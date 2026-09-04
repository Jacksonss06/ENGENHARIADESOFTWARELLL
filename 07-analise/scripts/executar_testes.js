const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = path.resolve(__dirname, '../..')

const RESPOSTAS = path.join(
  ROOT,
  '04-respostas-llms'
)

const EXECUCAO = path.join(
  ROOT,
  '05-execucao'
)

const RESULTADOS = path.join(
  ROOT,
  '06-resultados'
)

const BACKEND = path.join(
  ROOT,
  '01-projeto-base',
  'backend',
  'hidroWebnia_API-main'
)

const JEST_CONFIG = path.join(
  EXECUCAO,
  'jest.config.js'
)

const JEST_BIN = path.join(
  EXECUCAO,
  'node_modules',
  'jest',
  'bin',
  'jest.js'
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

const llmsDisponiveis = [
  'chatgpt',
  'claude',
  'gemini'
]

function escaparCsv(valor) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return ''
  }

  const texto = String(valor)

  if (
    texto.includes(',') ||
    texto.includes('"') ||
    texto.includes('\n') ||
    texto.includes('\r')
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

function normalizarMensagem(texto) {
  if (!texto) {
    return ''
  }

  return String(texto)
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000)
}

function obterArgumento(nome) {
  const prefixo = `--${nome}=`

  const argumento = process.argv
    .slice(2)
    .find(item =>
      item.startsWith(prefixo)
    )

  if (!argumento) {
    return null
  }

  return argumento
    .slice(prefixo.length)
    .trim()
}

function possuiFlag(nome) {
  return process.argv
    .slice(2)
    .includes(`--${nome}`)
}

function mostrarAjuda() {
  console.log(`
Executor automatizado das suítes Jest geradas pelas LLMs.

Uso:

  node 07-analise/scripts/executar_testes.js

Opções:

  --help
      Exibe esta ajuda sem executar testes.

  --llm=chatgpt
  --llm=claude
  --llm=gemini
      Executa somente uma LLM.

  --ct=CT01
      Executa somente uma unidade experimental.

  --dry-run
      Apenas mostra quais testes seriam executados.

Exemplos:

  node 07-analise/scripts/executar_testes.js --help

  node 07-analise/scripts/executar_testes.js --llm=gemini

  node 07-analise/scripts/executar_testes.js --ct=CT28

  node 07-analise/scripts/executar_testes.js --llm=claude --ct=CT28

  node 07-analise/scripts/executar_testes.js --dry-run

Saídas:

  Execução completa:
  06-resultados/resultados_execucao_automatica.csv

  Execução com filtro:
  06-resultados/resultados_execucao_automatica_parcial.csv
`)
}

function validarAmbiente() {
  const obrigatorios = [
    {
      nome: 'Backend',
      caminho: BACKEND
    },
    {
      nome: 'Jest',
      caminho: JEST_BIN
    },
    {
      nome: 'Configuração do Jest',
      caminho: JEST_CONFIG
    },
    {
      nome: 'Respostas das LLMs',
      caminho: RESPOSTAS
    }
  ]

  const ausentes = obrigatorios.filter(
    item => !fs.existsSync(item.caminho)
  )

  if (ausentes.length > 0) {
    console.error(
      'Erro: ambiente de execução incompleto.'
    )

    for (const item of ausentes) {
      console.error(
        `  ${item.nome}: ${item.caminho}`
      )
    }

    process.exit(1)
  }

  if (!fs.existsSync(RESULTADOS)) {
    fs.mkdirSync(
      RESULTADOS,
      {
        recursive: true
      }
    )
  }
}

function obterDataColeta(arquivoTeste) {
  const arquivoMeta = arquivoTeste.replace(
    /\.test\.js$/i,
    '.meta.json'
  )

  if (!fs.existsSync(arquivoMeta)) {
    return ''
  }

  try {
    const meta = JSON.parse(
      fs.readFileSync(
        arquivoMeta,
        'utf8'
      )
    )

    const valor =
      meta.timestamp ||
      meta.data_coleta ||
      meta.dataColeta ||
      meta.created_at ||
      meta.createdAt ||
      ''

    if (!valor) {
      return ''
    }

    const data = new Date(valor)

    if (Number.isNaN(data.getTime())) {
      return String(valor)
    }

    return data
      .toISOString()
      .slice(0, 10)
  } catch (erro) {
    return ''
  }
}

function obterMensagemFalha(
  dados,
  resultado
) {
  const mensagens = []

  if (
    dados &&
    Array.isArray(dados.testResults)
  ) {
    for (
      const suite of dados.testResults
    ) {
      if (suite.failureMessage) {
        mensagens.push(
          suite.failureMessage
        )
      }

      if (
        Array.isArray(
          suite.assertionResults
        )
      ) {
        for (
          const teste of
          suite.assertionResults
        ) {
          if (
            Array.isArray(
              teste.failureMessages
            )
          ) {
            mensagens.push(
              ...teste.failureMessages
            )
          }
        }
      }
    }
  }

  if (
    mensagens.length === 0 &&
    resultado.stderr
  ) {
    mensagens.push(
      resultado.stderr
    )
  }

  if (
    mensagens.length === 0 &&
    resultado.stdout
  ) {
    mensagens.push(
      resultado.stdout
    )
  }

  if (
    mensagens.length === 0 &&
    resultado.error
  ) {
    mensagens.push(
      resultado.error.message
    )
  }

  return normalizarMensagem(
    mensagens.join(' | ')
  )
}

function executarTeste(arquivo) {
  const arquivoTemporario = path.join(
    EXECUCAO,
    `resultado-jest-${process.pid}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.json`
  )

  const argumentos = [
    JEST_BIN,
    arquivo,
    '--config',
    JEST_CONFIG,
    '--runInBand',
    '--runTestsByPath',
    '--json',
    '--outputFile',
    arquivoTemporario
  ]

  const inicio =
    process.hrtime.bigint()

  const resultado = spawnSync(
    process.execPath,
    argumentos,
    {
      /*
       * IMPORTANTE:
       *
       * O diretório de trabalho é o backend
       * original da aplicação.
       *
       * Isso permite que testes gerados que
       * utilizam process.cwd() encontrem
       * corretamente:
       *
       * src/middlewares
       * src/controllers
       * src/services
       * src/model
       * src/utils
       */
      cwd: BACKEND,
      encoding: 'utf8',
      shell: false,
      env: process.env
    }
  )

  const fim =
    process.hrtime.bigint()

  const tempoSegundos =
    Number(fim - inicio) /
    1_000_000_000

  let dados = null

  if (
    fs.existsSync(
      arquivoTemporario
    )
  ) {
    try {
      dados = JSON.parse(
        fs.readFileSync(
          arquivoTemporario,
          'utf8'
        )
      )
    } catch (erro) {
      dados = null
    } finally {
      try {
        fs.unlinkSync(
          arquivoTemporario
        )
      } catch (erro) {
        // Não interfere na medição.
      }
    }
  }

  /*
   * O processo do Jest nem conseguiu
   * produzir seu JSON de resultado.
   */
  if (!dados) {
    return {
      status: 'erro_execucao',
      executou: 'nao',
      passou: 'nao',
      qtdTestes: 0,
      qtdPassou: 0,
      qtdFalhou: 0,
      taxa: 'N/A',
      tempo: tempoSegundos.toFixed(3),
      observacao:
        obterMensagemFalha(
          null,
          resultado
        ) ||
        'Jest não produziu o arquivo JSON de resultado.'
    }
  }

  const total =
    Number(
      dados.numTotalTests || 0
    )

  const qtdPassou =
    Number(
      dados.numPassedTests || 0
    )

  const qtdFalhou =
    Number(
      dados.numFailedTests || 0
    )

  /*
   * A suíte foi localizada/carregada pelo
   * Jest, mas falhou antes de qualquer
   * caso de teste ser executado.
   *
   * Exemplos:
   * - erro em import/require
   * - mock inválido
   * - SyntaxError
   * - TypeError durante inicialização
   */
  if (
    total === 0 &&
    dados.success === false
  ) {
    return {
      status:
        'erro_inicializacao',
      executou: 'nao',
      passou: 'nao',
      qtdTestes: 0,
      qtdPassou: 0,
      qtdFalhou: 0,
      taxa: 'N/A',
      tempo:
        tempoSegundos.toFixed(3),
      observacao:
        obterMensagemFalha(
          dados,
          resultado
        ) ||
        'A suíte falhou antes da execução dos casos de teste.'
    }
  }

  /*
   * Caso extremamente incomum:
   * a suíte terminou sem erro, mas não
   * possui nenhum teste.
   */
  if (total === 0) {
    return {
      status: 'sem_testes',
      executou: 'nao',
      passou: 'nao',
      qtdTestes: 0,
      qtdPassou: 0,
      qtdFalhou: 0,
      taxa: 'N/A',
      tempo:
        tempoSegundos.toFixed(3),
      observacao:
        'A suíte foi carregada, mas nenhum caso de teste foi encontrado.'
    }
  }

  const taxa =
    (
      (qtdPassou / total) *
      100
    ).toFixed(2)

  if (
    dados.success &&
    qtdFalhou === 0
  ) {
    return {
      status: 'sucesso',
      executou: 'sim',
      passou: 'sim',
      qtdTestes: total,
      qtdPassou,
      qtdFalhou,
      taxa,
      tempo:
        tempoSegundos.toFixed(3),
      observacao: ''
    }
  }

  /*
   * A suíte iniciou e pelo menos um teste
   * foi efetivamente executado, porém
   * houve uma ou mais falhas.
   *
   * Isso é diferente de erro de
   * inicialização.
   */
  return {
    status: 'falha_testes',
    executou: 'sim',
    passou: 'nao',
    qtdTestes: total,
    qtdPassou,
    qtdFalhou,
    taxa,
    tempo:
      tempoSegundos.toFixed(3),
    observacao:
      obterMensagemFalha(
        dados,
        resultado
      )
  }
}

function coletarArquivos(
  llmsSelecionadas,
  ctFiltro
) {
  const encontrados = []

  for (
    const llm of
    llmsSelecionadas
  ) {
    for (
      const dificuldade of
      dificuldades
    ) {
      const pasta = path.join(
        RESPOSTAS,
        llm,
        dificuldade
      )

      if (
        !fs.existsSync(pasta)
      ) {
        continue
      }

      const arquivos = fs
        .readdirSync(pasta)
        .filter(
          arquivo =>
            arquivo.endsWith(
              '.test.js'
            )
        )
        .sort()

      for (
        const nomeArquivo of
        arquivos
      ) {
        const id =
          extrairId(
            nomeArquivo
          )

        if (
          ctFiltro &&
          id !== ctFiltro
        ) {
          continue
        }

        encontrados.push({
          id,
          llm,
          dificuldade,
          nomeArquivo,
          arquivoCompleto:
            path.join(
              pasta,
              nomeArquivo
            )
        })
      }
    }
  }

  return encontrados.sort(
    (a, b) => {
      const llmA =
        llmsDisponiveis.indexOf(
          a.llm
        )

      const llmB =
        llmsDisponiveis.indexOf(
          b.llm
        )

      if (llmA !== llmB) {
        return llmA - llmB
      }

      return a.id.localeCompare(
        b.id
      )
    }
  )
}

function principal() {
  if (
    possuiFlag('help') ||
    possuiFlag('h')
  ) {
    mostrarAjuda()
    return
  }

  validarAmbiente()

  const llmFiltro =
    obterArgumento('llm')

  const ctArgumento =
    obterArgumento('ct')

  const dryRun =
    possuiFlag('dry-run')

  let llmsSelecionadas = [
    ...llmsDisponiveis
  ]

  if (llmFiltro) {
    const normalizado =
      llmFiltro.toLowerCase()

    if (
      !llmsDisponiveis.includes(
        normalizado
      )
    ) {
      console.error(
        `LLM inválida: ${llmFiltro}`
      )

      console.error(
        `Use: ${llmsDisponiveis.join(', ')}`
      )

      process.exit(1)
    }

    llmsSelecionadas = [
      normalizado
    ]
  }

  let ctFiltro = null

  if (ctArgumento) {
    const normalizado =
      ctArgumento
        .toUpperCase()

    if (
      !/^CT\d{2}$/.test(
        normalizado
      )
    ) {
      console.error(
        `CT inválida: ${ctArgumento}`
      )

      console.error(
        'Use o formato CT01 até CT30.'
      )

      process.exit(1)
    }

    const numero =
      Number(
        normalizado.slice(2)
      )

    if (
      numero < 1 ||
      numero > 30
    ) {
      console.error(
        `CT fora da amostra: ${normalizado}`
      )

      process.exit(1)
    }

    ctFiltro =
      normalizado
  }

  const arquivos =
    coletarArquivos(
      llmsSelecionadas,
      ctFiltro
    )

  if (
    arquivos.length === 0
  ) {
    console.error(
      'Nenhum arquivo de teste encontrado para os filtros informados.'
    )

    process.exit(1)
  }

  const execucaoCompleta =
    !llmFiltro &&
    !ctFiltro

  const CSV = path.join(
    RESULTADOS,
    execucaoCompleta
      ? 'resultados_execucao_automatica.csv'
      : 'resultados_execucao_automatica_parcial.csv'
  )

  console.log(
    '============================================'
  )

  console.log(
    'EXECUÇÃO AUTOMATIZADA DOS TESTES GERADOS'
  )

  console.log(
    '============================================'
  )

  console.log(
    `Backend (cwd): ${BACKEND}`
  )

  console.log(
    `Jest config: ${JEST_CONFIG}`
  )

  console.log(
    `Testes selecionados: ${arquivos.length}`
  )

  if (llmFiltro) {
    console.log(
      `LLM: ${llmFiltro}`
    )
  }

  if (ctFiltro) {
    console.log(
      `CT: ${ctFiltro}`
    )
  }

  if (dryRun) {
    console.log(
      '\nDRY-RUN: nenhum teste será executado.\n'
    )

    for (
      const item of arquivos
    ) {
      console.log(
        `${item.id} - ${llmNome[item.llm]} - ${item.dificuldade}`
      )
    }

    return
  }

  const linhas = []

  linhas.push([
    'id',
    'dificuldade',
    'llm',
    'modelo_versao',
    'data_coleta',
    'status_execucao',
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

  let sucesso = 0
  let falhaTestes = 0
  let erroInicializacao = 0
  let erroExecucao = 0
  let semTestes = 0

  for (
    let indice = 0;
    indice < arquivos.length;
    indice++
  ) {
    const item =
      arquivos[indice]

    console.log(
      `\n[${indice + 1}/${arquivos.length}] ` +
      `Executando ${item.id} - ` +
      `${llmNome[item.llm]}...`
    )

    const r =
      executarTeste(
        item.arquivoCompleto
      )

    const dataColeta =
      obterDataColeta(
        item.arquivoCompleto
      )

    linhas.push([
      item.id,
      item.dificuldade,
      llmNome[item.llm],
      modelos[item.llm],
      dataColeta,
      r.status,
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

    switch (r.status) {
      case 'sucesso':
        sucesso++
        break

      case 'falha_testes':
        falhaTestes++
        break

      case 'erro_inicializacao':
        erroInicializacao++
        break

      case 'erro_execucao':
        erroExecucao++
        break

      case 'sem_testes':
        semTestes++
        break
    }

    if (
      r.status === 'sucesso'
    ) {
      console.log(
        `  PASS - ${r.qtdPassou}/${r.qtdTestes} ` +
        `(${r.taxa}%)`
      )

      continue
    }

    if (
      r.status ===
      'falha_testes'
    ) {
      console.log(
        `  FAIL - ${r.qtdPassou}/${r.qtdTestes} ` +
        `(${r.taxa}%)`
      )
    } else {
      console.log(
        `  ${r.status.toUpperCase()}`
      )
    }

    if (r.observacao) {
      console.log(
        `  ${r.observacao}`
      )
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
    '\n============================================'
  )

  console.log(
    'RESUMO DA EXECUÇÃO'
  )

  console.log(
    '============================================'
  )

  console.log(
    `Total de suítes: ${arquivos.length}`
  )

  console.log(
    `Sucesso: ${sucesso}`
  )

  console.log(
    `Falha em testes: ${falhaTestes}`
  )

  console.log(
    `Erro de inicialização: ${erroInicializacao}`
  )

  console.log(
    `Erro de execução: ${erroExecucao}`
  )

  console.log(
    `Sem testes: ${semTestes}`
  )

  console.log(
    '\nExecução concluída.'
  )

  console.log(
    `Resultado: ${CSV}`
  )
}

principal()