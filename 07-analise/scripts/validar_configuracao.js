const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '../..')
const checks = []
function check(nome, ok, detalhe='') { checks.push({ nome, ok, detalhe }) }

const prompt = path.join(ROOT, '03-prompts', 'prompt_padrao.md')
const env = path.join(ROOT, '07-analise', '.env')
const jest = path.join(ROOT, '05-execucao', 'node_modules', 'jest', 'bin', 'jest.js')
const backend = path.join(ROOT, '01-projeto-base', 'backend', 'hidroWebnia_API-main', 'src')

check('Node >= 20', Number(process.versions.node.split('.')[0]) >= 20, process.versions.node)
check('Prompt existe', fs.existsSync(prompt), prompt)
check('Prompt possui marcador', fs.existsSync(prompt) && fs.readFileSync(prompt,'utf8').includes('[INSERIR AQUI O CONTEÚDO DA UNIDADE CTXX]'))
check('Arquivo .env existe', fs.existsSync(env), 'copie 07-analise/.env.example para .env')
check('Jest instalado', fs.existsSync(jest), 'execute npm install em 05-execucao')
check('Backend presente', fs.existsSync(backend), backend)

for (const d of ['facil','medio','dificil']) {
  const p = path.join(ROOT,'02-amostra','unidades',d)
  const n = fs.existsSync(p) ? fs.readdirSync(p).filter(f => /^CT\d{2}.*\.js$/i.test(f)).length : 0
  check(`Unidades ${d}`, n === 10, `${n}/10`)
}

for (const c of checks) console.log(`${c.ok ? 'OK ' : 'ERRO'} ${c.nome}${c.detalhe ? ` - ${c.detalhe}` : ''}`)
if (checks.some(c => !c.ok)) process.exitCode = 1
