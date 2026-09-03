const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = path.resolve(__dirname, '../..')

const RESPOSTAS = path.join(ROOT, '04-respostas-llms')
const EXECUCAO = path.join(ROOT, '05-execucao')
const RESULTADOS = path.join(ROOT, '06-resultados')

const CSV = path.join(
  RESULTADOS,
  'resultados_execucao_automatica.csv'
)

const modelos = {
  chatgpt: 'GPT-5.6 Sol',
  claude: 'Sonnet 5',
  gemini: '3.1 Pro'
}

const llmNome = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini'
}

const dificuldades = [
  'facil',
  'medio',
  'dificil'
]

const llms = [
  'chatgpt',
  'claude',
  'gemini'
]

function escaparCsv(valor) {
  if (valor === null || valor === undefined) {
    return ''
  }

  const texto = String(valor)

  if (
    texto.includes(',') ||
    texto.includes('"') ||
    texto.includes('\n')
  ) {
    return `"${texto.replace(/"/g, '""')}"`
  }

  return texto
}

function extrairId(nomeArquivo) {
  const match = nomeArquivo.match(/CT\d{2}/i)

  return match
    ? match[0].toUpperCase()
    : ''
}

function dataAtual() {
  return new Date()
    .toISOString()
    .slice(0, 10)
}

function executarTeste(arquivo) {
  const arquivoTemporario = path.join(
    EXECUCAO,
    `resultado-jest-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.json`
  )

  const caminhoRelativo = path.relative(
    EXECUCAO,
    arquivo
  )

  /*
   * Executa diretamente o Jest instalado em
   * 05-execucao/node_modules.
   *
   * Isso evita npx, shell:true e problemas
   * de execução no Windows/Git Bash.
   */
  const jestBin = path.join(
    EXECUCAO,
    'node_modules',
    'jest',
    'bin',
    'jest.js'
  )

  const argumentos = [
    jestBin,
    '--config',
    path.join(EXECUCAO, 'jest.config.js'),
    '--runTestsByPath',
    caminhoRelativo,
    '--runInBand',
    '--json',
    '--outputFile',
    arquivoTemporario
  ]

  const inicio = process.hrtime.bigint()

  const resultado = spawnSync(
    process.execPath,
    argumentos,
    {
      cwd: EXECUCAO,
      encoding: 'utf8',
      shell: false
    }
  )

  const fim = process.hrtime.bigint()

  const tempoSegundos =
    Number(fim - inicio) / 1_000_000_000

  if (resultado.error) {
    console.error(
      'Erro ao iniciar Jest:',
      resultado.error.message
    )
  }

  let dados = null

  if (fs.existsSync(arquivoTemporario)) {
    try {
      dados = JSON.parse(
        fs.readFileSync(
          arquivoTemporario,
          'utf8'
        )
      )
    } catch (erro) {
      console.error(
        'Erro ao interpretar JSON do Jest:',
        erro.message
      )

      dados = null
    }

    fs.unlinkSync(arquivoTemporario)
  }

  /*
   * Quando o Jest não consegue produzir o JSON,
   * consideramos que o arquivo não pôde ser executado.
   */
  if (!dados) {
    const mensagemErro =
      resultado.stderr ||
      resultado.stdout ||
      resultado.error?.message ||
      'Jest não produziu o arquivo JSON de resultado'

    return {
      executou: 'nao',
      passou: 'nao',
      qtdTestes: 0,
      qtdPassou: 0,
      qtdFalhou: 0,
      taxa: '0.00',
      tempo: tempoSegundos.toFixed(3),
      observacao: mensagemErro
        .replace(/\r?\n/g, ' ')
        .slice(0, 500)
    }
  }

  const total =
    dados.numTotalTests || 0

  const passou =
    dados.numPassedTests || 0

  const falhou =
    dados.numFailedTests || 0

  const taxa =
    total > 0
      ? ((passou / total) * 100).toFixed(2)
      : '0.00'

  return {
    executou: 'sim',

    passou:
      dados.success && falhou === 0
        ? 'sim'
        : 'nao',

    qtdTestes: total,
    qtdPassou: passou,
    qtdFalhou: falhou,
    taxa,
    tempo: tempoSegundos.toFixed(3),
    observacao: ''
  }
}

const linhas = []

linhas.push([
  'id',
  'dificuldade',
  'llm',
  'modelo_versao',
  'data_coleta',
  'executou',
  'passou',
  'qtd_testes',
  'qtd_passou',
  'qtd_falhou',
  'taxa_aprovacao',
  'tempo_segundos',
  'aderencia_escopo',
  'observacao'
])

for (const llm of llms) {
  for (const dificuldade of dificuldades) {
    const pasta = path.join(
      RESPOSTAS,
      llm,
      dificuldade
    )

    if (!fs.existsSync(pasta)) {
      continue
    }

    const arquivos = fs
      .readdirSync(pasta)
      .filter(
        arquivo =>
          arquivo.endsWith('.test.js')
      )
      .sort()

    for (const nomeArquivo of arquivos) {
      const arquivoCompleto = path.join(
        pasta,
        nomeArquivo
      )

      const id = extrairId(nomeArquivo)

      console.log(
        `Executando ${id} - ${llmNome[llm]}...`
      )

      const r =
        executarTeste(arquivoCompleto)

      linhas.push([
        id,
        dificuldade,
        llmNome[llm],
        modelos[llm],
        dataAtual(),
        r.executou,
        r.passou,
        r.qtdTestes,
        r.qtdPassou,
        r.qtdFalhou,
        r.taxa,
        r.tempo,
        '',
        r.observacao
      ])

      if (r.executou === 'sim') {
        console.log(
          `  ${r.qtdPassou}/${r.qtdTestes} ` +
          `passaram (${r.taxa}%)`
        )
      } else {
        console.log(
          '  ERRO DE EXECUÇÃO'
        )

        if (r.observacao) {
          console.log(
            `  ${r.observacao}`
          )
        }
      }
    }
  }
}

const conteudo = linhas
  .map(
    linha =>
      linha
        .map(escaparCsv)
        .join(',')
  )
  .join('\n')

fs.writeFileSync(
  CSV,
  '\uFEFF' + conteudo,
  'utf8'
)

console.log(
  '\nExecução concluída.'
)

console.log(
  `Resultado: ${CSV}`
)