const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

/* ============================================================
 * COLETA EXPERIMENTAL AUTOMATIZADA
 *
 * 30 unidades experimentais
 * 3 LLMs
 * 90 respostas
 *
 * Regras:
 * - uma única requisição por CT/LLM;
 * - sem retry automático;
 * - sem regeneração automática;
 * - resposta bruta preservada;
 * - código extraído salvo separadamente;
 * - metadados registrados;
 * - modelos fixados no código;
 * - respostas já coletadas são ignoradas;
 * - --force não deve ser usado na coleta definitiva.
 * ============================================================
 */


/* ============================================================
 * CAMINHOS
 * ============================================================
 */

const ROOT = path.resolve(__dirname, '../..')

const ANALISE = path.join(
  ROOT,
  '07-analise'
)

const UNIDADES = path.join(
  ROOT,
  '02-amostra',
  'unidades'
)

const RESPOSTAS = path.join(
  ROOT,
  '04-respostas-llms'
)

const PROMPT_FILE = path.join(
  ROOT,
  '03-prompts',
  'prompt_padrao.md'
)

const COLETA_CSV = path.join(
  ROOT,
  '06-resultados',
  'coleta_llms.csv'
)

const PLACEHOLDER =
  '[INSERIR AQUI O CONTEÚDO DA UNIDADE CTXX]'


/* ============================================================
 * CONFIGURAÇÃO EXPERIMENTAL FIXA
 * ============================================================
 */

const CONFIG = {
  chatgpt: {
    nome: 'ChatGPT',
    provedor: 'OpenAI',
    model: 'gpt-5.6-sol'
  },

  claude: {
    nome: 'Claude',
    provedor: 'Anthropic',
    model: 'claude-sonnet-5'
  },

  gemini: {
    nome: 'Gemini',
    provedor: 'Google',
    model: 'gemini-3.1-pro-preview'
  }
}


/*
 * Limite máximo uniforme de saída.
 */

const MAX_OUTPUT_TOKENS = 8192


/*
 * Configuração explícita usada com o GPT-5.6 Sol.
 */

const OPENAI_REASONING_EFFORT = 'medium'


/* ============================================================
 * CARREGAMENTO DO .ENV
 * ============================================================
 */

function carregarEnv() {
  const arquivo = path.join(
    ANALISE,
    '.env'
  )

  if (!fs.existsSync(arquivo)) {
    return
  }

  const linhas = fs
    .readFileSync(arquivo, 'utf8')
    .split(/\r?\n/)

  for (const linha of linhas) {
    const texto = linha.trim()

    if (
      !texto ||
      texto.startsWith('#')
    ) {
      continue
    }

    const indice = texto.indexOf('=')

    if (indice < 1) {
      continue
    }

    const chave = texto
      .slice(0, indice)
      .trim()

    let valor = texto
      .slice(indice + 1)
      .trim()

    if (
      (
        valor.startsWith('"') &&
        valor.endsWith('"')
      ) ||
      (
        valor.startsWith("'") &&
        valor.endsWith("'")
      )
    ) {
      valor = valor.slice(1, -1)
    }

    if (!(chave in process.env)) {
      process.env[chave] = valor
    }
  }
}


carregarEnv()


/* ============================================================
 * CHAVES DAS APIs
 * ============================================================
 */

const API_KEYS = {
  chatgpt: process.env.OPENAI_API_KEY,
  claude: process.env.ANTHROPIC_API_KEY,
  gemini: process.env.GEMINI_API_KEY
}


/* ============================================================
 * ARGUMENTOS
 * ============================================================
 */

const args = process.argv.slice(2)

const argumentoCt =
  args.find(
    argumento =>
      argumento.startsWith('--ct=')
  )

const argumentoLlm =
  args.find(
    argumento =>
      argumento.startsWith('--llm=')
  )

const filtroCt =
  argumentoCt
    ? argumentoCt
        .split('=')[1]
        .toUpperCase()
    : null

const filtroLlm =
  argumentoLlm
    ? argumentoLlm
        .split('=')[1]
        .toLowerCase()
    : null

const force =
  args.includes('--force')

const dryRun =
  args.includes('--dry-run')


/* ============================================================
 * FUNÇÕES AUXILIARES
 * ============================================================
 */

function agora() {
  const data = new Date()

  const iso =
    data.toISOString()

  return {
    iso,
    data: iso.slice(0, 10),
    hora: iso.slice(11, 19)
  }
}


function sha256(conteudo) {
  return crypto
    .createHash('sha256')
    .update(conteudo)
    .digest('hex')
}


function csvEscape(valor) {
  const texto =
    String(valor ?? '')

  if (/[",\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`
  }

  return texto
}


function caminhoRelativo(arquivo) {
  return path
    .relative(ROOT, arquivo)
    .replace(/\\/g, '/')
}


/* ============================================================
 * VALIDAÇÃO DAS CHAVES
 * ============================================================
 */

function validarChaves(llms) {
  const ausentes = []

  for (const llm of llms) {
    const chave =
      API_KEYS[llm]

    if (
      !chave ||
      !chave.trim()
    ) {
      ausentes.push(
        CONFIG[llm].nome
      )
    }
  }

  if (ausentes.length > 0) {
    throw new Error(
      `Chave de API ausente para: ${ausentes.join(', ')}. ` +
      'Verifique o arquivo 07-analise/.env.'
    )
  }
}


/* ============================================================
 * LEITURA DO CSV
 * ============================================================
 */

function parseCsvLinha(linha) {
  const campos = []

  let campo = ''
  let dentroDeAspas = false

  for (
    let i = 0;
    i < linha.length;
    i++
  ) {
    const caractere =
      linha[i]

    if (caractere === '"') {
      if (
        dentroDeAspas &&
        linha[i + 1] === '"'
      ) {
        campo += '"'
        i++
      } else {
        dentroDeAspas =
          !dentroDeAspas
      }

      continue
    }

    if (
      caractere === ',' &&
      !dentroDeAspas
    ) {
      campos.push(campo)
      campo = ''
      continue
    }

    campo += caractere
  }

  campos.push(campo)

  return campos
}


function lerRegistrosCsv() {
  if (!fs.existsSync(COLETA_CSV)) {
    return []
  }

  const texto = fs
    .readFileSync(
      COLETA_CSV,
      'utf8'
    )
    .replace(/^\uFEFF/, '')
    .trim()

  if (!texto) {
    return []
  }

  const linhas =
    texto.split(/\r?\n/)

  const registros = []

  for (
    const linha
    of linhas.slice(1)
  ) {
    if (!linha.trim()) {
      continue
    }

    const campos =
      parseCsvLinha(linha)

    if (campos.length < 11) {
      continue
    }

    registros.push({
      id: campos[0],
      dificuldade: campos[1],
      llm: campos[2],
      modelo_id: campos[3],
      data_coleta: campos[4],
      hora_coleta: campos[5],
      status: campos[6],
      http_status: campos[7],
      arquivo_bruto: campos[8],
      arquivo_teste: campos[9],
      observacao: campos[10]
    })
  }

  return registros
}


/* ============================================================
 * GRAVAÇÃO DO CSV
 * ============================================================
 */

function gravarRegistrosCsv(registros) {
  const cabecalho = [
    'id',
    'dificuldade',
    'llm',
    'modelo_id',
    'data_coleta',
    'hora_coleta',
    'status',
    'http_status',
    'arquivo_bruto',
    'arquivo_teste',
    'observacao'
  ]

  const linhas = [
    cabecalho.join(',')
  ]

  registros.sort(
    (a, b) =>
      `${a.id}-${a.llm}`.localeCompare(
        `${b.id}-${b.llm}`
      )
  )

  for (const registro of registros) {
    const linha = cabecalho
      .map(
        campo =>
          csvEscape(
            registro[campo]
          )
      )
      .join(',')

    linhas.push(linha)
  }

  fs.writeFileSync(
    COLETA_CSV,
    '\uFEFF' +
      linhas.join('\n') +
      '\n',
    'utf8'
  )
}


/* ============================================================
 * LISTAGEM DAS UNIDADES
 * ============================================================
 */

function listarUnidades() {
  const lista = []

  const dificuldades = [
    'facil',
    'medio',
    'dificil'
  ]

  for (
    const dificuldade
    of dificuldades
  ) {
    const pasta = path.join(
      UNIDADES,
      dificuldade
    )

    if (!fs.existsSync(pasta)) {
      continue
    }

    const arquivos = fs
      .readdirSync(pasta)
      .filter(
        arquivo =>
          /^CT\d{2}.*\.js$/i.test(
            arquivo
          )
      )
      .sort()

    for (const arquivo of arquivos) {
      const correspondencia =
        arquivo.match(/CT\d{2}/i)

      if (!correspondencia) {
        continue
      }

      const id =
        correspondencia[0]
          .toUpperCase()

      if (
        filtroCt &&
        id !== filtroCt
      ) {
        continue
      }

      lista.push({
        id,
        dificuldade,
        arquivo: path.join(
          pasta,
          arquivo
        )
      })
    }
  }

  return lista
}


/* ============================================================
 * EXTRAÇÃO DO CÓDIGO
 * ============================================================
 */

function extrairCodigo(texto) {
  const blocos = [
    ...texto.matchAll(
      /```(?:javascript|js)?\s*\r?\n([\s\S]*?)```/gi
    )
  ]

  if (blocos.length > 0) {
    return (
      blocos[0][1].trim() +
      '\n'
    )
  }

  return texto.trim() + '\n'
}


/* ============================================================
 * REQUISIÇÃO HTTP
 *
 * SOMENTE UMA TENTATIVA.
 * NÃO EXISTE RETRY AUTOMÁTICO.
 * ============================================================
 */

async function fetchUmaVez(
  url,
  options
) {
  let response

  try {
    response =
      await fetch(
        url,
        options
      )
  } catch (erro) {
    const falha =
      new Error(
        `Erro de rede: ${erro.message}`
      )

    falha.httpStatus = ''

    throw falha
  }

  const texto =
    await response.text()

  let json = null

  try {
    json =
      JSON.parse(texto)
  } catch {
    json = null
  }

  if (!response.ok) {
    const erro =
      new Error(
        `HTTP ${response.status}: ` +
        texto.slice(0, 1000)
      )

    erro.httpStatus =
      response.status

    throw erro
  }

  if (!json) {
    throw new Error(
      'A API retornou uma resposta que não pôde ser interpretada como JSON.'
    )
  }

  return {
    res: response,
    json,
    texto
  }
}


/* ============================================================
 * OPENAI
 * ============================================================
 */

async function chamarOpenAI(
  prompt,
  model,
  key
) {
  const {
    res,
    json
  } = await fetchUmaVez(
    'https://api.openai.com/v1/responses',
    {
      method: 'POST',

      headers: {
        Authorization:
          `Bearer ${key}`,

        'Content-Type':
          'application/json'
      },

      body: JSON.stringify({
        model,

        input: prompt,

        reasoning: {
          effort:
            OPENAI_REASONING_EFFORT
        },

        max_output_tokens:
          MAX_OUTPUT_TOKENS
      })
    }
  )

  const texto = (
    json.output || []
  )
    .flatMap(
      item =>
        item.content || []
    )
    .filter(
      item =>
        item.type ===
        'output_text'
    )
    .map(
      item =>
        item.text || ''
    )
    .join('\n')
    .trim()

  return {
    texto,

    modelRetornado:
      json.model || model,

    usage:
      json.usage || null,

    httpStatus:
      res.status,

    id:
      json.id || null
  }
}


/* ============================================================
 * ANTHROPIC / CLAUDE
 * ============================================================
 */

async function chamarClaude(
  prompt,
  model,
  key
) {
  const {
    res,
    json
  } = await fetchUmaVez(
    'https://api.anthropic.com/v1/messages',
    {
      method: 'POST',

      headers: {
        'x-api-key':
          key,

        'anthropic-version':
          '2023-06-01',

        'Content-Type':
          'application/json'
      },

      body: JSON.stringify({
        model,

        max_tokens:
          MAX_OUTPUT_TOKENS,

        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    }
  )

  const texto = (
    json.content || []
  )
    .filter(
      item =>
        item.type === 'text'
    )
    .map(
      item =>
        item.text || ''
    )
    .join('\n')
    .trim()

  return {
    texto,

    modelRetornado:
      json.model || model,

    usage:
      json.usage || null,

    httpStatus:
      res.status,

    id:
      json.id || null
  }
}


/* ============================================================
 * GOOGLE GEMINI
 * ============================================================
 */

async function chamarGemini(
  prompt,
  model,
  key
) {
  const url =
    'https://generativelanguage.googleapis.com/' +
    'v1beta/models/' +
    `${encodeURIComponent(model)}` +
    ':generateContent' +
    `?key=${encodeURIComponent(key)}`

  const {
    res,
    json
  } = await fetchUmaVez(
    url,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json'
      },

      body: JSON.stringify({
        contents: [
          {
            role: 'user',

            parts: [
              {
                text: prompt
              }
            ]
          }
        ],

        generationConfig: {
          maxOutputTokens:
            MAX_OUTPUT_TOKENS
        }
      })
    }
  )

  const texto = (
    json.candidates?.[0]
      ?.content
      ?.parts || []
  )
    .map(
      parte =>
        parte.text || ''
    )
    .join('\n')
    .trim()

  return {
    texto,

    modelRetornado:
      json.modelVersion ||
      model,

    usage:
      json.usageMetadata ||
      null,

    httpStatus:
      res.status,

    id:
      json.responseId ||
      null
  }
}


/* ============================================================
 * ROTEAMENTO DAS LLMS
 * ============================================================
 */

async function chamar(
  llm,
  prompt
) {
  const config =
    CONFIG[llm]

  const key =
    API_KEYS[llm]

  if (
    !key ||
    !key.trim()
  ) {
    throw new Error(
      `Chave ausente para ${config.nome}. ` +
      'Preencha 07-analise/.env.'
    )
  }

  if (llm === 'chatgpt') {
    return chamarOpenAI(
      prompt,
      config.model,
      key
    )
  }

  if (llm === 'claude') {
    return chamarClaude(
      prompt,
      config.model,
      key
    )
  }

  if (llm === 'gemini') {
    return chamarGemini(
      prompt,
      config.model,
      key
    )
  }

  throw new Error(
    `LLM desconhecida: ${llm}`
  )
}


/* ============================================================
 * EXIBIÇÃO DA CONFIGURAÇÃO
 * ============================================================
 */

function exibirConfiguracao(
  unidades,
  llms
) {
  console.log('')
  console.log(
    '============================================================'
  )
  console.log(
    'CONFIGURAÇÃO EXPERIMENTAL'
  )
  console.log(
    '============================================================'
  )
  console.log('')

  for (const llm of llms) {
    console.log(
      `${CONFIG[llm].nome}:`
    )

    console.log(
      `  Provedor: ${CONFIG[llm].provedor}`
    )

    console.log(
      `  Modelo:   ${CONFIG[llm].model}`
    )

    if (llm === 'chatgpt') {
      console.log(
        `  Reasoning effort: ${OPENAI_REASONING_EFFORT}`
      )
    }

    console.log('')
  }

  console.log(
    `Máximo de saída: ${MAX_OUTPUT_TOKENS} tokens`
  )

  console.log(
    `Unidades selecionadas: ${unidades.length}`
  )

  console.log(
    `LLMs selecionadas: ${llms.length}`
  )

  console.log(
    `Máximo de requisições: ${unidades.length * llms.length}`
  )

  console.log(
    'Retry automático: NÃO'
  )

  console.log(
    `Modo dry-run: ${dryRun ? 'SIM' : 'NÃO'}`
  )

  console.log(
    `Force: ${force ? 'SIM' : 'NÃO'}`
  )

  if (filtroCt) {
    console.log(
      `Filtro CT: ${filtroCt}`
    )
  }

  if (filtroLlm) {
    console.log(
      `Filtro LLM: ${filtroLlm}`
    )
  }

  console.log('')
  console.log(
    '============================================================'
  )
  console.log('')
}


/* ============================================================
 * ATUALIZA OU INSERE REGISTRO NO CSV
 * ============================================================
 */

function atualizarRegistro(
  registros,
  novo
) {
  const indice =
    registros.findIndex(
      registro =>
        registro.id === novo.id &&
        registro.llm === novo.llm
    )

  if (indice >= 0) {
    registros[indice] = novo
  } else {
    registros.push(novo)
  }

  gravarRegistrosCsv(registros)
}


/* ============================================================
 * MAIN
 * ============================================================
 */

async function main() {
  /*
   * ----------------------------------------------------------
   * Validação do prompt
   * ----------------------------------------------------------
   */

  if (!fs.existsSync(PROMPT_FILE)) {
    throw new Error(
      `Prompt não encontrado: ${PROMPT_FILE}`
    )
  }

  const template =
    fs.readFileSync(
      PROMPT_FILE,
      'utf8'
    )

  if (
    !template.includes(
      PLACEHOLDER
    )
  ) {
    throw new Error(
      `O prompt não contém o marcador: ${PLACEHOLDER}`
    )
  }


  /*
   * ----------------------------------------------------------
   * Localiza as unidades
   * ----------------------------------------------------------
   */

  const unidades =
    listarUnidades()

  if (unidades.length === 0) {
    throw new Error(
      'Nenhuma unidade encontrada para o filtro informado.'
    )
  }


  /*
   * ----------------------------------------------------------
   * Seleciona as LLMs
   * ----------------------------------------------------------
   */

  const llms = [
    'chatgpt',
    'claude',
    'gemini'
  ].filter(
    llm =>
      !filtroLlm ||
      llm === filtroLlm
  )

  if (llms.length === 0) {
    throw new Error(
      'LLM inválida. Use chatgpt, claude ou gemini.'
    )
  }


  /*
   * ----------------------------------------------------------
   * Mostra a configuração
   * ----------------------------------------------------------
   */

  exibirConfiguracao(
    unidades,
    llms
  )


  /*
   * ----------------------------------------------------------
   * DRY-RUN
   *
   * Nenhuma API é chamada.
   * ----------------------------------------------------------
   */

  if (dryRun) {
    for (
      const unidade
      of unidades
    ) {
      for (const llm of llms) {
        console.log(
          `[DRY-RUN] ${unidade.id} / ` +
          `${CONFIG[llm].nome} / ` +
          `${CONFIG[llm].model}`
        )
      }
    }

    console.log('')
    console.log(
      'Dry-run concluído. Nenhuma API foi chamada.'
    )

    return
  }


  /*
   * ----------------------------------------------------------
   * Validação das chaves
   * ----------------------------------------------------------
   */

  validarChaves(llms)


  /*
   * ----------------------------------------------------------
   * Registros existentes
   * ----------------------------------------------------------
   */

  const registros =
    lerRegistrosCsv()


  /*
   * ----------------------------------------------------------
   * COLETA
   * ----------------------------------------------------------
   */

  for (
    const unidade
    of unidades
  ) {
    const codigo =
      fs.readFileSync(
        unidade.arquivo,
        'utf8'
      )

    const prompt =
      template.replace(
        PLACEHOLDER,
        codigo
      )


    /*
     * Cada unidade é enviada individualmente
     * para cada LLM.
     */

    for (const llm of llms) {
      const pasta =
        path.join(
          RESPOSTAS,
          llm,
          unidade.dificuldade
        )

      fs.mkdirSync(
        pasta,
        {
          recursive: true
        }
      )

      const base =
        `${unidade.id}_${llm}`

      const raw =
        path.join(
          pasta,
          `${base}.raw.txt`
        )

      const teste =
        path.join(
          pasta,
          `${base}.test.js`
        )

      const meta =
        path.join(
          pasta,
          `${base}.meta.json`
        )


      /*
       * ------------------------------------------------------
       * Proteção contra coleta duplicada
       * ------------------------------------------------------
       */

      if (
        !force &&
        fs.existsSync(raw) &&
        fs.existsSync(teste) &&
        fs.existsSync(meta)
      ) {
        console.log(
          `SKIP ${unidade.id} / ` +
          `${CONFIG[llm].nome} ` +
          '(já coletado)'
        )

        continue
      }


      /*
       * ------------------------------------------------------
       * Início da chamada
       * ------------------------------------------------------
       */

      console.log('')

      console.log(
        `COLETA ${unidade.id} / ` +
        `${CONFIG[llm].nome} / ` +
        `${CONFIG[llm].model}`
      )

      const tempo =
        agora()

      try {
        /*
         * Uma única chamada.
         */

        const resposta =
          await chamar(
            llm,
            prompt
          )

        if (!resposta.texto) {
          throw new Error(
            'A API retornou resposta válida sem conteúdo textual.'
          )
        }


        /*
         * ----------------------------------------------------
         * Salva resposta bruta
         * ----------------------------------------------------
         */

        fs.writeFileSync(
          raw,
          resposta.texto + '\n',
          'utf8'
        )


        /*
         * ----------------------------------------------------
         * Extrai e salva o código de teste
         * ----------------------------------------------------
         */

        const codigoTeste =
          extrairCodigo(
            resposta.texto
          )

        fs.writeFileSync(
          teste,
          codigoTeste,
          'utf8'
        )


        /*
         * ----------------------------------------------------
         * Salva metadados
         * ----------------------------------------------------
         */

        const metadata = {
          id:
            unidade.id,

          dificuldade:
            unidade.dificuldade,

          llm,

          provedor:
            CONFIG[llm].provedor,

          modelo_solicitado:
            CONFIG[llm].model,

          modelo_retornado:
            resposta.modelRetornado,

          data_hora_utc:
            tempo.iso,

          http_status:
            resposta.httpStatus,

          response_id:
            resposta.id,

          max_output_tokens:
            MAX_OUTPUT_TOKENS,

          retry_automatico:
            false,

          parametros: {
            openai_reasoning_effort:
              llm === 'chatgpt'
                ? OPENAI_REASONING_EFFORT
                : null
          },

          usage:
            resposta.usage,

          prompt_sha256:
            sha256(prompt),

          unidade_sha256:
            sha256(codigo)
        }

        fs.writeFileSync(
          meta,
          JSON.stringify(
            metadata,
            null,
            2
          ) + '\n',
          'utf8'
        )


        /*
         * ----------------------------------------------------
         * Registra sucesso no CSV
         * ----------------------------------------------------
         */

        const novo = {
          id:
            unidade.id,

          dificuldade:
            unidade.dificuldade,

          llm:
            CONFIG[llm].nome,

          modelo_id:
            resposta.modelRetornado,

          data_coleta:
            tempo.data,

          hora_coleta:
            tempo.hora,

          status:
            'ok',

          http_status:
            resposta.httpStatus,

          arquivo_bruto:
            caminhoRelativo(raw),

          arquivo_teste:
            caminhoRelativo(teste),

          observacao:
            ''
        }

        atualizarRegistro(
          registros,
          novo
        )

        console.log(
          `  OK -> ${caminhoRelativo(teste)}`
        )

        if (resposta.usage) {
          console.log(
            `  Uso -> ${JSON.stringify(resposta.usage)}`
          )
        }

      } catch (erro) {
        /*
         * ----------------------------------------------------
         * Não existe retry.
         *
         * A falha é registrada e o experimento continua
         * para a próxima combinação.
         * ----------------------------------------------------
         */

        console.error(
          `  ERRO -> ${erro.message}`
        )

        const novo = {
          id:
            unidade.id,

          dificuldade:
            unidade.dificuldade,

          llm:
            CONFIG[llm].nome,

          modelo_id:
            CONFIG[llm].model,

          data_coleta:
            tempo.data,

          hora_coleta:
            tempo.hora,

          status:
            'erro',

          http_status:
            erro.httpStatus || '',

          arquivo_bruto:
            '',

          arquivo_teste:
            '',

          observacao:
            erro.message.slice(
              0,
              500
            )
        }

        atualizarRegistro(
          registros,
          novo
        )
      }
    }
  }


  /*
   * ----------------------------------------------------------
   * Finalização
   * ----------------------------------------------------------
   */

  console.log('')
  console.log(
    '============================================================'
  )

  console.log(
    'COLETA FINALIZADA'
  )

  console.log(
    '============================================================'
  )
}


/* ============================================================
 * EXECUÇÃO
 * ============================================================
 */

main().catch(
  erro => {
    console.error(
      erro.stack ||
      erro.message
    )

    process.exitCode = 1
  }
)