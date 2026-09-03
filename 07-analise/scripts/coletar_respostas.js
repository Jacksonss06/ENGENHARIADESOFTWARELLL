const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '../..')
const ANALISE = path.join(ROOT, '07-analise')
const UNIDADES = path.join(ROOT, '02-amostra', 'unidades')
const RESPOSTAS = path.join(ROOT, '04-respostas-llms')
const PROMPT_FILE = path.join(ROOT, '03-prompts', 'prompt_padrao.md')
const COLETA_CSV = path.join(ROOT, '06-resultados', 'coleta_llms.csv')
const PLACEHOLDER = '[INSERIR AQUI O CONTEÚDO DA UNIDADE CTXX]'

function carregarEnv() {
  const arquivo = path.join(ANALISE, '.env')
  if (!fs.existsSync(arquivo)) return
  for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const texto = linha.trim()
    if (!texto || texto.startsWith('#')) continue
    const idx = texto.indexOf('=')
    if (idx < 1) continue
    const chave = texto.slice(0, idx).trim()
    let valor = texto.slice(idx + 1).trim()
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1)
    }
    if (!(chave in process.env)) process.env[chave] = valor
  }
}

carregarEnv()

const CONFIG = {
  chatgpt: {
    nome: 'ChatGPT',
    model: process.env.OPENAI_MODEL || 'gpt-5.6-sol',
    key: process.env.OPENAI_API_KEY
  },
  claude: {
    nome: 'Claude',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
    key: process.env.ANTHROPIC_API_KEY
  },
  gemini: {
    nome: 'Gemini',
    model: process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview',
    key: process.env.GEMINI_API_KEY
  }
}

const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS || 8192)
const args = process.argv.slice(2)
const filtroCt = (args.find(a => a.startsWith('--ct=')) || '').split('=')[1]?.toUpperCase()
const filtroLlm = (args.find(a => a.startsWith('--llm=')) || '').split('=')[1]?.toLowerCase()
const force = args.includes('--force')
const dryRun = args.includes('--dry-run')

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function agora() {
  const d = new Date()
  return {
    iso: d.toISOString(),
    data: d.toISOString().slice(0, 10),
    hora: d.toISOString().slice(11, 19)
  }
}

function csvEscape(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function lerRegistrosCsv() {
  if (!fs.existsSync(COLETA_CSV)) return []
  const txt = fs.readFileSync(COLETA_CSV, 'utf8').replace(/^\uFEFF/, '').trim()
  if (!txt) return []
  const linhas = txt.split(/\r?\n/)
  return linhas.slice(1).map(l => {
    // Arquivo é controlado pelo script; campos com vírgula só aparecem escapados na observação.
    const m = l.match(/^(.*?),(.*?),(.*?),(.*?),(.*?),(.*?),(.*?),(.*?),(.*?),(.*?),(.*)$/)
    if (!m) return null
    return {
      id: m[1], dificuldade: m[2], llm: m[3], modelo_id: m[4], data_coleta: m[5],
      hora_coleta: m[6], status: m[7], http_status: m[8], arquivo_bruto: m[9],
      arquivo_teste: m[10], observacao: m[11].replace(/^"|"$/g, '').replace(/""/g, '"')
    }
  }).filter(Boolean)
}

function gravarRegistrosCsv(registros) {
  const cab = ['id','dificuldade','llm','modelo_id','data_coleta','hora_coleta','status','http_status','arquivo_bruto','arquivo_teste','observacao']
  const linhas = [cab.join(',')]
  for (const r of registros.sort((a,b) => `${a.id}-${a.llm}`.localeCompare(`${b.id}-${b.llm}`))) {
    linhas.push(cab.map(k => csvEscape(r[k])).join(','))
  }
  fs.writeFileSync(COLETA_CSV, '\uFEFF' + linhas.join('\n') + '\n', 'utf8')
}

function listarUnidades() {
  const lista = []
  for (const dificuldade of ['facil','medio','dificil']) {
    const pasta = path.join(UNIDADES, dificuldade)
    if (!fs.existsSync(pasta)) continue
    for (const arquivo of fs.readdirSync(pasta).filter(f => /^CT\d{2}.*\.js$/i.test(f)).sort()) {
      const id = arquivo.match(/CT\d{2}/i)[0].toUpperCase()
      if (filtroCt && id !== filtroCt) continue
      lista.push({ id, dificuldade, arquivo: path.join(pasta, arquivo) })
    }
  }
  return lista
}

function extrairCodigo(texto) {
  const blocos = [...texto.matchAll(/```(?:javascript|js)?\s*\n([\s\S]*?)```/gi)]
  if (blocos.length) return blocos[0][1].trim() + '\n'
  return texto.trim() + '\n'
}

async function fetchComRetry(url, options, tentativas = 4) {
  let ultimoErro
  for (let i = 0; i < tentativas; i++) {
    try {
      const res = await fetch(url, options)
      const texto = await res.text()
      let json = null
      try { json = JSON.parse(texto) } catch {}
      if (res.ok) return { res, json, texto }
      const retryable = res.status === 429 || res.status >= 500
      if (!retryable || i === tentativas - 1) {
        const err = new Error(`HTTP ${res.status}: ${texto.slice(0, 1000)}`)
        err.httpStatus = res.status
        throw err
      }
      await esperar(2000 * (2 ** i))
    } catch (e) {
      ultimoErro = e
      if (i === tentativas - 1) throw e
      await esperar(2000 * (2 ** i))
    }
  }
  throw ultimoErro
}

async function chamarOpenAI(prompt, model, key) {
  const { res, json } = await fetchComRetry('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: prompt, max_output_tokens: MAX_OUTPUT_TOKENS })
  })
  const texto = (json.output || []).flatMap(o => o.content || [])
    .filter(c => c.type === 'output_text').map(c => c.text || '').join('\n').trim()
  return { texto, modelRetornado: json.model || model, usage: json.usage || null, httpStatus: res.status, id: json.id || null }
}

async function chamarClaude(prompt, model, key) {
  const { res, json } = await fetchComRetry('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: MAX_OUTPUT_TOKENS, messages: [{ role: 'user', content: prompt }] })
  })
  const texto = (json.content || []).filter(c => c.type === 'text').map(c => c.text || '').join('\n').trim()
  return { texto, modelRetornado: json.model || model, usage: json.usage || null, httpStatus: res.status, id: json.id || null }
}

async function chamarGemini(prompt, model, key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`
  const { res, json } = await fetchComRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS }
    })
  })
  const texto = (json.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('\n').trim()
  return { texto, modelRetornado: json.modelVersion || model, usage: json.usageMetadata || null, httpStatus: res.status, id: json.responseId || null }
}

async function chamar(llm, prompt) {
  const cfg = CONFIG[llm]
  if (!cfg.key) throw new Error(`Chave ausente para ${cfg.nome}. Preencha 07-analise/.env.`)
  if (llm === 'chatgpt') return chamarOpenAI(prompt, cfg.model, cfg.key)
  if (llm === 'claude') return chamarClaude(prompt, cfg.model, cfg.key)
  return chamarGemini(prompt, cfg.model, cfg.key)
}

async function main() {
  const template = fs.readFileSync(PROMPT_FILE, 'utf8')
  if (!template.includes(PLACEHOLDER)) throw new Error(`O prompt não contém o marcador ${PLACEHOLDER}`)

  const unidades = listarUnidades()
  const llms = ['chatgpt','claude','gemini'].filter(x => !filtroLlm || x === filtroLlm)
  if (!unidades.length) throw new Error('Nenhuma unidade encontrada para o filtro informado.')
  if (!llms.length) throw new Error('LLM inválida. Use chatgpt, claude ou gemini.')

  console.log(`Unidades: ${unidades.length} | LLMs: ${llms.length} | Máximo de requisições: ${unidades.length * llms.length}`)
  if (dryRun) {
    for (const u of unidades) for (const llm of llms) console.log(`[DRY-RUN] ${u.id} / ${llm}`)
    return
  }

  const registros = lerRegistrosCsv()

  for (const unidade of unidades) {
    const codigo = fs.readFileSync(unidade.arquivo, 'utf8')
    const prompt = template.replace(PLACEHOLDER, codigo)

    for (const llm of llms) {
      const pasta = path.join(RESPOSTAS, llm, unidade.dificuldade)
      fs.mkdirSync(pasta, { recursive: true })
      const base = `${unidade.id}_${llm}`
      const raw = path.join(pasta, `${base}.raw.txt`)
      const teste = path.join(pasta, `${base}.test.js`)
      const meta = path.join(pasta, `${base}.meta.json`)

      if (!force && fs.existsSync(raw) && fs.existsSync(teste) && fs.existsSync(meta)) {
        console.log(`SKIP ${unidade.id} / ${llm} (já coletado)`)
        continue
      }

      console.log(`COLETA ${unidade.id} / ${llm} / ${CONFIG[llm].model}`)
      const t = agora()
      try {
        const resp = await chamar(llm, prompt)
        if (!resp.texto) throw new Error('API retornou resposta válida sem conteúdo textual.')
        const codigoTeste = extrairCodigo(resp.texto)
        fs.writeFileSync(raw, resp.texto + '\n', 'utf8')
        fs.writeFileSync(teste, codigoTeste, 'utf8')
        const metadata = {
          id: unidade.id,
          dificuldade: unidade.dificuldade,
          llm,
          modelo_solicitado: CONFIG[llm].model,
          modelo_retornado: resp.modelRetornado,
          data_hora_utc: t.iso,
          http_status: resp.httpStatus,
          response_id: resp.id,
          usage: resp.usage,
          prompt_sha256: require('crypto').createHash('sha256').update(prompt).digest('hex'),
          unidade_sha256: require('crypto').createHash('sha256').update(codigo).digest('hex')
        }
        fs.writeFileSync(meta, JSON.stringify(metadata, null, 2) + '\n', 'utf8')

        const novo = {
          id: unidade.id, dificuldade: unidade.dificuldade, llm: CONFIG[llm].nome,
          modelo_id: resp.modelRetornado, data_coleta: t.data, hora_coleta: t.hora,
          status: 'ok', http_status: resp.httpStatus,
          arquivo_bruto: path.relative(ROOT, raw).replace(/\\/g, '/'),
          arquivo_teste: path.relative(ROOT, teste).replace(/\\/g, '/'), observacao: ''
        }
        const idx = registros.findIndex(r => r.id === unidade.id && r.llm === CONFIG[llm].nome)
        if (idx >= 0) registros[idx] = novo; else registros.push(novo)
        gravarRegistrosCsv(registros)
        console.log(`  OK -> ${path.relative(ROOT, teste)}`)
      } catch (e) {
        console.error(`  ERRO: ${e.message}`)
        const novo = {
          id: unidade.id, dificuldade: unidade.dificuldade, llm: CONFIG[llm].nome,
          modelo_id: CONFIG[llm].model, data_coleta: t.data, hora_coleta: t.hora,
          status: 'erro', http_status: e.httpStatus || '', arquivo_bruto: '', arquivo_teste: '',
          observacao: e.message.slice(0, 500)
        }
        const idx = registros.findIndex(r => r.id === unidade.id && r.llm === CONFIG[llm].nome)
        if (idx >= 0) registros[idx] = novo; else registros.push(novo)
        gravarRegistrosCsv(registros)
      }
    }
  }

  console.log('Coleta finalizada.')
}

main().catch(err => {
  console.error(err.stack || err.message)
  process.exitCode = 1
})
