const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '../..')

const RESULTADOS = path.join(
  ROOT,
  '06-resultados'
)

const ENTRADA = path.join(
  RESULTADOS,
  'resultados_execucao_automatica.csv'
)

const SAIDA_CONSOLIDADA = path.join(
  RESULTADOS,
  'resultados_consolidados.csv'
)

const SAIDA_RESUMO_LLM = path.join(
  RESULTADOS,
  'resumo_por_llm.csv'
)

const SAIDA_METRICAS = path.join(
  RESULTADOS,
  'metricas_qualidade.csv'
)

/*
 * Parser CSV simples com suporte a:
 * - campos entre aspas
 * - vírgulas dentro de campos
 * - aspas escapadas ("")
 * - BOM UTF-8
 */
function parseCsv(conteudo) {
  conteudo = conteudo.replace(/^\uFEFF/, '')

  const linhas = []
  let linha = []
  let campo = ''
  let dentroAspas = false

  for (let i = 0; i < conteudo.length; i++) {
    const char = conteudo[i]

    if (dentroAspas) {
      if (char === '"') {
        if (
          i + 1 < conteudo.length &&
          conteudo[i + 1] === '"'
        ) {
          campo += '"'
          i++
        } else {
          dentroAspas = false
        }
      } else {
        campo += char
      }

      continue
    }

    if (char === '"') {
      dentroAspas = true
      continue
    }

    if (char === ',') {
      linha.push(campo)
      campo = ''
      continue
    }

    if (char === '\n') {
      linha.push(
        campo.replace(/\r$/, '')
      )

      linhas.push(linha)

      linha = []
      campo = ''
      continue
    }

    campo += char
  }

  if (
    campo.length > 0 ||
    linha.length > 0
  ) {
    linha.push(
      campo.replace(/\r$/, '')
    )

    linhas.push(linha)
  }

  if (linhas.length === 0) {
    return []
  }

  const cabecalho = linhas[0]

  return linhas
    .slice(1)
    .filter(
      linha =>
        linha.some(
          valor =>
            String(valor).trim() !== ''
        )
    )
    .map(linha => {
      const objeto = {}

      cabecalho.forEach(
        (coluna, indice) => {
          objeto[coluna] =
            linha[indice] ?? ''
        }
      )

      return objeto
    })
}

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

function escreverCsv(
  arquivo,
  cabecalho,
  linhas
) {
  const conteudo = [
    cabecalho,
    ...linhas
  ]
    .map(
      linha =>
        linha
          .map(escaparCsv)
          .join(',')
    )
    .join('\n')

  fs.writeFileSync(
    arquivo,
    '\uFEFF' + conteudo,
    'utf8'
  )
}

function numero(valor) {
  const convertido = Number(valor)

  return Number.isFinite(convertido)
    ? convertido
    : 0
}

function percentual(
  numerador,
  denominador
) {
  if (!denominador) {
    return '0.00'
  }

  return (
    (numerador / denominador) *
    100
  ).toFixed(2)
}

function media(
  valores
) {
  if (!valores.length) {
    return '0.00'
  }

  const soma = valores.reduce(
    (total, valor) =>
      total + numero(valor),
    0
  )

  return (
    soma / valores.length
  ).toFixed(2)
}

function mediana(
  valores
) {
  if (!valores.length) {
    return '0.00'
  }

  const ordenados = valores
    .map(numero)
    .sort(
      (a, b) => a - b
    )

  const meio = Math.floor(
    ordenados.length / 2
  )

  if (
    ordenados.length % 2 === 0
  ) {
    return (
      (
        ordenados[meio - 1] +
        ordenados[meio]
      ) / 2
    ).toFixed(2)
  }

  return ordenados[
    meio
  ].toFixed(2)
}

function agrupar(
  registros,
  chave
) {
  const grupos = new Map()

  for (const registro of registros) {
    const valor = chave(registro)

    if (!grupos.has(valor)) {
      grupos.set(valor, [])
    }

    grupos
      .get(valor)
      .push(registro)
  }

  return grupos
}

function calcularMetricas(
  registros
) {
  const totalSuites =
    registros.length

  const suitesExecutadas =
    registros.filter(
      r => r.executou === 'sim'
    ).length

  const suitesSucesso =
    registros.filter(
      r =>
        r.status_execucao ===
        'sucesso'
    ).length

  const suitesFalhaTestes =
    registros.filter(
      r =>
        r.status_execucao ===
        'falha_testes'
    ).length

  const errosInicializacao =
    registros.filter(
      r =>
        r.status_execucao ===
        'erro_inicializacao'
    ).length

  const errosExecucao =
    registros.filter(
      r =>
        r.status_execucao ===
        'erro_execucao'
    ).length

  const semTestes =
    registros.filter(
      r =>
        r.status_execucao ===
        'sem_testes'
    ).length

  const totalTestes =
    registros.reduce(
      (total, r) =>
        total +
        numero(r.qtd_testes),
      0
    )

  const testesPassaram =
    registros.reduce(
      (total, r) =>
        total +
        numero(r.qtd_passou),
      0
    )

  const testesFalharam =
    registros.reduce(
      (total, r) =>
        total +
        numero(r.qtd_falhou),
      0
    )

  const tempos =
    registros
      .filter(
        r =>
          r.tempo_segundos !== ''
      )
      .map(
        r =>
          numero(
            r.tempo_segundos
          )
      )

  const testesPorSuiteExecutada =
    registros
      .filter(
        r =>
          r.executou === 'sim'
      )
      .map(
        r =>
          numero(
            r.qtd_testes
          )
      )

  return {
    totalSuites,
    suitesExecutadas,
    suitesSucesso,
    suitesFalhaTestes,
    errosInicializacao,
    errosExecucao,
    semTestes,

    taxaExecutabilidade:
      percentual(
        suitesExecutadas,
        totalSuites
      ),

    taxaSucessoIntegral:
      percentual(
        suitesSucesso,
        totalSuites
      ),

    taxaSucessoEntreExecutaveis:
      percentual(
        suitesSucesso,
        suitesExecutadas
      ),

    totalTestes,
    testesPassaram,
    testesFalharam,

    taxaAprovacaoTestes:
      percentual(
        testesPassaram,
        totalTestes
      ),

    mediaTestesSuite:
      media(
        testesPorSuiteExecutada
      ),

    medianaTestesSuite:
      mediana(
        testesPorSuiteExecutada
      ),

    tempoMedio:
      media(tempos),

    tempoMediano:
      mediana(tempos)
  }
}

function validarEntrada(
  registros
) {
  if (
    registros.length !== 90
  ) {
    console.warn(
      `AVISO: eram esperadas 90 suítes, mas foram encontradas ${registros.length}.`
    )
  }

  const idsValidos =
    registros.filter(
      r =>
        /^CT\d{2}$/.test(
          r.id
        )
    )

  if (
    idsValidos.length !==
    registros.length
  ) {
    console.warn(
      'AVISO: há registros com identificador CT inválido.'
    )
  }

  const statusValidos = new Set([
    'sucesso',
    'falha_testes',
    'erro_inicializacao',
    'erro_execucao',
    'sem_testes'
  ])

  const invalidos =
    registros.filter(
      r =>
        !statusValidos.has(
          r.status_execucao
        )
    )

  if (invalidos.length > 0) {
    console.warn(
      `AVISO: ${invalidos.length} registro(s) possuem status_execucao desconhecido.`
    )
  }
}

function gerarResumoPorLlm(
  registros
) {
  const grupos = agrupar(
    registros,
    r => r.llm
  )

  const ordem = [
    'ChatGPT',
    'Claude',
    'Gemini'
  ]

  const linhas = []

  for (const llm of ordem) {
    if (!grupos.has(llm)) {
      continue
    }

    const dados =
      grupos.get(llm)

    const m =
      calcularMetricas(dados)

    const modelo =
      dados[0]
        ?.modelo_versao || ''

    linhas.push([
      llm,
      modelo,
      m.totalSuites,
      m.suitesExecutadas,
      m.suitesSucesso,
      m.suitesFalhaTestes,
      m.errosInicializacao,
      m.errosExecucao,
      m.semTestes,
      m.taxaExecutabilidade,
      m.taxaSucessoIntegral,
      m.taxaSucessoEntreExecutaveis,
      m.totalTestes,
      m.testesPassaram,
      m.testesFalharam,
      m.taxaAprovacaoTestes,
      m.mediaTestesSuite,
      m.medianaTestesSuite,
      m.tempoMedio,
      m.tempoMediano
    ])
  }

  escreverCsv(
    SAIDA_RESUMO_LLM,
    [
      'llm',
      'modelo_versao',
      'total_suites',
      'suites_executadas',
      'suites_sucesso',
      'suites_falha_testes',
      'erros_inicializacao',
      'erros_execucao',
      'sem_testes',
      'taxa_executabilidade',
      'taxa_sucesso_integral',
      'taxa_sucesso_entre_executaveis',
      'total_testes',
      'testes_passaram',
      'testes_falharam',
      'taxa_aprovacao_testes',
      'media_testes_por_suite_executada',
      'mediana_testes_por_suite_executada',
      'tempo_medio_segundos',
      'tempo_mediano_segundos'
    ],
    linhas
  )
}

function gerarConsolidado(
  registros
) {
  const dificuldades = [
    'facil',
    'medio',
    'dificil'
  ]

  const llms = [
    'ChatGPT',
    'Claude',
    'Gemini'
  ]

  const linhas = []

  for (const llm of llms) {
    for (
      const dificuldade of
      dificuldades
    ) {
      const dados =
        registros.filter(
          r =>
            r.llm === llm &&
            r.dificuldade ===
              dificuldade
        )

      if (!dados.length) {
        continue
      }

      const m =
        calcularMetricas(dados)

      linhas.push([
        llm,
        dados[0]
          ?.modelo_versao || '',
        dificuldade,
        m.totalSuites,
        m.suitesExecutadas,
        m.suitesSucesso,
        m.suitesFalhaTestes,
        m.errosInicializacao,
        m.errosExecucao,
        m.semTestes,
        m.taxaExecutabilidade,
        m.taxaSucessoIntegral,
        m.totalTestes,
        m.testesPassaram,
        m.testesFalharam,
        m.taxaAprovacaoTestes,
        m.mediaTestesSuite,
        m.tempoMedio
      ])
    }
  }

  escreverCsv(
    SAIDA_CONSOLIDADA,
    [
      'llm',
      'modelo_versao',
      'dificuldade',
      'total_suites',
      'suites_executadas',
      'suites_sucesso',
      'suites_falha_testes',
      'erros_inicializacao',
      'erros_execucao',
      'sem_testes',
      'taxa_executabilidade',
      'taxa_sucesso_integral',
      'total_testes',
      'testes_passaram',
      'testes_falharam',
      'taxa_aprovacao_testes',
      'media_testes_por_suite_executada',
      'tempo_medio_segundos'
    ],
    linhas
  )
}

function gerarMetricasGlobais(
  registros
) {
  const m =
    calcularMetricas(registros)

  const linhas = [
    [
      'total_suites',
      m.totalSuites
    ],
    [
      'suites_executadas',
      m.suitesExecutadas
    ],
    [
      'suites_sucesso',
      m.suitesSucesso
    ],
    [
      'suites_falha_testes',
      m.suitesFalhaTestes
    ],
    [
      'erros_inicializacao',
      m.errosInicializacao
    ],
    [
      'erros_execucao',
      m.errosExecucao
    ],
    [
      'sem_testes',
      m.semTestes
    ],
    [
      'taxa_executabilidade',
      m.taxaExecutabilidade
    ],
    [
      'taxa_sucesso_integral',
      m.taxaSucessoIntegral
    ],
    [
      'taxa_sucesso_entre_executaveis',
      m.taxaSucessoEntreExecutaveis
    ],
    [
      'total_testes',
      m.totalTestes
    ],
    [
      'testes_passaram',
      m.testesPassaram
    ],
    [
      'testes_falharam',
      m.testesFalharam
    ],
    [
      'taxa_aprovacao_testes',
      m.taxaAprovacaoTestes
    ],
    [
      'media_testes_por_suite_executada',
      m.mediaTestesSuite
    ],
    [
      'mediana_testes_por_suite_executada',
      m.medianaTestesSuite
    ],
    [
      'tempo_medio_segundos',
      m.tempoMedio
    ],
    [
      'tempo_mediano_segundos',
      m.tempoMediano
    ]
  ]

  escreverCsv(
    SAIDA_METRICAS,
    [
      'metrica',
      'valor'
    ],
    linhas
  )

  return m
}

function principal() {
  if (
    process.argv.includes(
      '--help'
    ) ||
    process.argv.includes(
      '-h'
    )
  ) {
    console.log(`
Consolidação dos resultados experimentais.

Uso:

  node 07-analise/scripts/consolidar_resultados.js

Entrada:

  06-resultados/resultados_execucao_automatica.csv

Saídas:

  06-resultados/resultados_consolidados.csv
  06-resultados/resumo_por_llm.csv
  06-resultados/metricas_qualidade.csv
`)
    return
  }

  if (
    !fs.existsSync(ENTRADA)
  ) {
    console.error(
      `Arquivo não encontrado: ${ENTRADA}`
    )

    process.exit(1)
  }

  const conteudo =
    fs.readFileSync(
      ENTRADA,
      'utf8'
    )

  const registros =
    parseCsv(conteudo)

  validarEntrada(registros)

  gerarResumoPorLlm(
    registros
  )

  gerarConsolidado(
    registros
  )

  const global =
    gerarMetricasGlobais(
      registros
    )

  console.log(
    '============================================'
  )

  console.log(
    'CONSOLIDAÇÃO DOS RESULTADOS'
  )

  console.log(
    '============================================'
  )

  console.log(
    `Suítes analisadas: ${global.totalSuites}`
  )

  console.log(
    `Executáveis: ${global.suitesExecutadas}/${global.totalSuites} (${global.taxaExecutabilidade}%)`
  )

  console.log(
    `Sucesso integral: ${global.suitesSucesso}/${global.totalSuites} (${global.taxaSucessoIntegral}%)`
  )

  console.log(
    `Falha em testes: ${global.suitesFalhaTestes}`
  )

  console.log(
    `Erros de inicialização: ${global.errosInicializacao}`
  )

  console.log(
    `Casos Jest executados: ${global.totalTestes}`
  )

  console.log(
    `Casos aprovados: ${global.testesPassaram}`
  )

  console.log(
    `Casos falhos: ${global.testesFalharam}`
  )

  console.log(
    `Taxa de aprovação dos casos: ${global.taxaAprovacaoTestes}%`
  )

  console.log(
    '\nArquivos gerados:'
  )

  console.log(
    `  ${SAIDA_RESUMO_LLM}`
  )

  console.log(
    `  ${SAIDA_CONSOLIDADA}`
  )

  console.log(
    `  ${SAIDA_METRICAS}`
  )
}

principal()
