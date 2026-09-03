const path = require('path')
const { spawnSync } = require('child_process')

const DIR = __dirname
function run(script, args=[]) {
  console.log(`\n=== ${script} ===`)
  const r = spawnSync(process.execPath, [path.join(DIR, script), ...args], { stdio: 'inherit', shell: false })
  if (r.status !== 0) process.exit(r.status || 1)
}

const args = process.argv.slice(2)
run('validar_configuracao.js')
run('coletar_respostas.js', args)
run('executar_testes.js')
console.log('\nPipeline concluído.')
