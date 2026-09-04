const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '../..')

const RESULTADOS = path.join(
  ROOT,
  '06-resultados'
)

const ANALISE = path.join(
  ROOT,
  '07-analise'
)

const GRAFICOS = path.join(
  ANALISE,
  'graficos'
)

const TABELAS = path.join(
  ANALISE,
  'tabelas'
)

const ARQUIVO_RESUMO_LLM = path.join(
  RESULTADOS,
  'resumo_por_llm.csv'
)

const ARQUIVO_CONSOLIDADO = path.join(
  RESULTADOS,
  'resultados_consolidados.csv'
)

const ARQUIVO_METRICAS = path.join(
  RESULTADOS,
  'metricas_qualidade.csv'
)

const ORDEM_LLMS = [
  'ChatGPT',
  'Claude',
  'Gemini'
]

const ORDEM_DIFICULDADES = [
  'facil',
  'medio',
  'dificil'
]

const ROTULOS_DIFICULDADE = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil'
}

const CORES = {
  ChatGPT: '#10a37f',
  Claude: '#d97757',
  Gemini: '#4285f4',
  grade: '#d9d9d9',
  texto: '#222222',
  fundo: '#ffffff'
}

function garantirDiretorios() {
  fs.mkdirSync(
    GRAFICOS,
    {
      recursive: true
    }
  )

  fs.mkdirSync(
    TABELAS,
    {
      recursive: true
    }
  )
}

function parseCsv(conteudo) {
  conteudo = conteudo.replace(
    /^\uFEFF/,
    ''
  )

  const linhas = []

  let linha = []
  let campo = ''
  let dentroAspas = false

  for (
    let i = 0;
    i < conteudo.length;
    i++
  ) {
    const char = conteudo[i]

    if (dentroAspas) {
      if (char === '"') {
        if (
          i + 1 <
            conteudo.length &&
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
        campo.replace(
          /\r$/,
          ''
        )
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
      campo.replace(
        /\r$/,
        ''
      )
    )

    linhas.push(linha)
  }

  if (!linhas.length) {
    return []
  }

  const cabecalho = linhas[0]

  return linhas
    .slice(1)
    .filter(
      linhaAtual =>
        linhaAtual.some(
          valor =>
            String(valor).trim() !== ''
        )
    )
    .map(
      linhaAtual => {
        const registro = {}

        cabecalho.forEach(
          (coluna, indice) => {
            registro[coluna] =
              linhaAtual[indice] ?? ''
          }
        )

        return registro
      }
    )
}

function lerCsv(arquivo) {
  if (
    !fs.existsSync(arquivo)
  ) {
    throw new Error(
      `Arquivo não encontrado: ${arquivo}`
    )
  }

  const conteudo =
    fs.readFileSync(
      arquivo,
      'utf8'
    )

  return parseCsv(conteudo)
}

function escaparCsv(valor) {
  if (
    valor === undefined ||
    valor === null
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
    return `"${texto.replace(
      /"/g,
      '""'
    )}"`
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
  const n = Number(valor)

  if (
    !Number.isFinite(n)
  ) {
    return 0
  }

  return n
}

function formatarPercentual(valor) {
  return `${numero(valor)
    .toFixed(2)
    .replace('.', ',')}%`
}

function formatarNumero(valor) {
  return numero(valor)
    .toFixed(2)
    .replace('.', ',')
}

function escaparXml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function validarResumoLlm(
  registros
) {
  if (
    registros.length !== 3
  ) {
    throw new Error(
      `Esperados 3 registros em resumo_por_llm.csv, encontrados ${registros.length}.`
    )
  }

  for (
    const llm of ORDEM_LLMS
  ) {
    const encontrado =
      registros.find(
        r => r.llm === llm
      )

    if (!encontrado) {
      throw new Error(
        `LLM ausente no resumo: ${llm}`
      )
    }

    if (
      numero(
        encontrado.total_suites
      ) !== 30
    ) {
      throw new Error(
        `A LLM ${llm} deveria possuir 30 suítes.`
      )
    }
  }
}

function validarConsolidado(
  registros
) {
  if (
    registros.length !== 9
  ) {
    throw new Error(
      `Esperados 9 grupos LLM × dificuldade, encontrados ${registros.length}.`
    )
  }

  for (
    const llm of ORDEM_LLMS
  ) {
    for (
      const dificuldade of
      ORDEM_DIFICULDADES
    ) {
      const registro =
        registros.find(
          r =>
            r.llm === llm &&
            r.dificuldade ===
              dificuldade
        )

      if (!registro) {
        throw new Error(
          `Grupo ausente: ${llm} × ${dificuldade}`
        )
      }

      if (
        numero(
          registro.total_suites
        ) !== 10
      ) {
        throw new Error(
          `O grupo ${llm} × ${dificuldade} deveria possuir 10 suítes.`
        )
      }
    }
  }
}

function validarMetricas(
  registros
) {
  const mapa = new Map()

  for (
    const registro of registros
  ) {
    mapa.set(
      registro.metrica,
      registro.valor
    )
  }

  const esperados = {
    total_suites: 90,
    suites_executadas: 87,
    suites_sucesso: 78,
    suites_falha_testes: 9,
    erros_inicializacao: 3,
    total_testes: 841,
    testes_passaram: 814,
    testes_falharam: 27
  }

  for (
    const [metrica, valor]
    of Object.entries(
      esperados
    )
  ) {
    if (
      numero(
        mapa.get(metrica)
      ) !== valor
    ) {
      throw new Error(
        `Métrica global divergente: ${metrica}. Esperado ${valor}, encontrado ${mapa.get(metrica)}.`
      )
    }
  }
}

function criarSvgBase(
  titulo,
  subtitulo,
  largura,
  altura,
  conteudo
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${largura}"
  height="${altura}"
  viewBox="0 0 ${largura} ${altura}"
>
  <rect
    width="100%"
    height="100%"
    fill="${CORES.fundo}"
  />

  <text
    x="${largura / 2}"
    y="38"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="22"
    font-weight="bold"
    fill="${CORES.texto}"
  >
    ${escaparXml(titulo)}
  </text>

  <text
    x="${largura / 2}"
    y="64"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="13"
    fill="#666666"
  >
    ${escaparXml(subtitulo)}
  </text>

  ${conteudo}
</svg>
`
}

function gerarGraficoBarrasPercentual({
  titulo,
  subtitulo,
  arquivo,
  dados,
  maximo = 100
}) {
  const largura = 900
  const altura = 560

  const margemEsquerda = 90
  const margemDireita = 40
  const margemSuperior = 100
  const margemInferior = 90

  const larguraGrafico =
    largura -
    margemEsquerda -
    margemDireita

  const alturaGrafico =
    altura -
    margemSuperior -
    margemInferior

  const quantidade =
    dados.length

  const larguraGrupo =
    larguraGrafico /
    quantidade

  const larguraBarra =
    Math.min(
      120,
      larguraGrupo * 0.48
    )

  let svg = ''

  for (
    let valor = 0;
    valor <= maximo;
    valor += 20
  ) {
    const y =
      margemSuperior +
      alturaGrafico -
      (
        valor /
        maximo
      ) *
        alturaGrafico

    svg += `
  <line
    x1="${margemEsquerda}"
    y1="${y}"
    x2="${largura - margemDireita}"
    y2="${y}"
    stroke="${CORES.grade}"
    stroke-width="1"
  />

  <text
    x="${margemEsquerda - 12}"
    y="${y + 5}"
    text-anchor="end"
    font-family="Arial, Helvetica, sans-serif"
    font-size="12"
    fill="#555555"
  >
    ${valor}%
  </text>
`
  }

  dados.forEach(
    (item, indice) => {
      const valor =
        numero(item.valor)

      const alturaBarra =
        (
          valor /
          maximo
        ) *
        alturaGrafico

      const centroX =
        margemEsquerda +
        larguraGrupo *
          indice +
        larguraGrupo / 2

      const x =
        centroX -
        larguraBarra / 2

      const y =
        margemSuperior +
        alturaGrafico -
        alturaBarra

      const cor =
        CORES[item.llm] ||
        '#777777'

      svg += `
  <rect
    x="${x}"
    y="${y}"
    width="${larguraBarra}"
    height="${alturaBarra}"
    rx="4"
    fill="${cor}"
  />

  <text
    x="${centroX}"
    y="${y - 12}"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="15"
    font-weight="bold"
    fill="${CORES.texto}"
  >
    ${formatarPercentual(valor)}
  </text>

  <text
    x="${centroX}"
    y="${margemSuperior + alturaGrafico + 30}"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="14"
    font-weight="bold"
    fill="${CORES.texto}"
  >
    ${escaparXml(item.llm)}
  </text>
`
    }
  )

  const conteudo =
    criarSvgBase(
      titulo,
      subtitulo,
      largura,
      altura,
      svg
    )

  fs.writeFileSync(
    arquivo,
    conteudo,
    'utf8'
  )
}

function gerarGraficoQuantidade({
  titulo,
  subtitulo,
  arquivo,
  dados
}) {
  const largura = 900
  const altura = 560

  const margemEsquerda = 90
  const margemDireita = 40
  const margemSuperior = 100
  const margemInferior = 90

  const larguraGrafico =
    largura -
    margemEsquerda -
    margemDireita

  const alturaGrafico =
    altura -
    margemSuperior -
    margemInferior

  const maiorValor =
    Math.max(
      ...dados.map(
        d =>
          numero(d.valor)
      )
    )

  const maximo =
    Math.ceil(
      maiorValor /
        50
    ) * 50

  const quantidade =
    dados.length

  const larguraGrupo =
    larguraGrafico /
    quantidade

  const larguraBarra =
    Math.min(
      120,
      larguraGrupo * 0.48
    )

  const intervalo =
    maximo / 5

  let svg = ''

  for (
    let i = 0;
    i <= 5;
    i++
  ) {
    const valor =
      intervalo * i

    const y =
      margemSuperior +
      alturaGrafico -
      (
        valor /
        maximo
      ) *
        alturaGrafico

    svg += `
  <line
    x1="${margemEsquerda}"
    y1="${y}"
    x2="${largura - margemDireita}"
    y2="${y}"
    stroke="${CORES.grade}"
    stroke-width="1"
  />

  <text
    x="${margemEsquerda - 12}"
    y="${y + 5}"
    text-anchor="end"
    font-family="Arial, Helvetica, sans-serif"
    font-size="12"
    fill="#555555"
  >
    ${Math.round(valor)}
  </text>
`
  }

  dados.forEach(
    (item, indice) => {
      const valor =
        numero(item.valor)

      const alturaBarra =
        (
          valor /
          maximo
        ) *
        alturaGrafico

      const centroX =
        margemEsquerda +
        larguraGrupo *
          indice +
        larguraGrupo / 2

      const x =
        centroX -
        larguraBarra / 2

      const y =
        margemSuperior +
        alturaGrafico -
        alturaBarra

      const cor =
        CORES[item.llm] ||
        '#777777'

      svg += `
  <rect
    x="${x}"
    y="${y}"
    width="${larguraBarra}"
    height="${alturaBarra}"
    rx="4"
    fill="${cor}"
  />

  <text
    x="${centroX}"
    y="${y - 12}"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="15"
    font-weight="bold"
    fill="${CORES.texto}"
  >
    ${valor}
  </text>

  <text
    x="${centroX}"
    y="${margemSuperior + alturaGrafico + 30}"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="14"
    font-weight="bold"
    fill="${CORES.texto}"
  >
    ${escaparXml(item.llm)}
  </text>
`
    }
  )

  const conteudo =
    criarSvgBase(
      titulo,
      subtitulo,
      largura,
      altura,
      svg
    )

  fs.writeFileSync(
    arquivo,
    conteudo,
    'utf8'
  )
}

function gerarGraficoDificuldade(
  consolidado
) {
  const largura = 1000
  const altura = 620

  const margemEsquerda = 90
  const margemDireita = 40
  const margemSuperior = 110
  const margemInferior = 130

  const larguraGrafico =
    largura -
    margemEsquerda -
    margemDireita

  const alturaGrafico =
    altura -
    margemSuperior -
    margemInferior

  const larguraGrupo =
    larguraGrafico /
    ORDEM_DIFICULDADES.length

  const larguraBarra = 58
  const espacamento = 12

  let svg = ''

  for (
    let valor = 0;
    valor <= 100;
    valor += 20
  ) {
    const y =
      margemSuperior +
      alturaGrafico -
      (
        valor /
        100
      ) *
        alturaGrafico

    svg += `
  <line
    x1="${margemEsquerda}"
    y1="${y}"
    x2="${largura - margemDireita}"
    y2="${y}"
    stroke="${CORES.grade}"
    stroke-width="1"
  />

  <text
    x="${margemEsquerda - 12}"
    y="${y + 5}"
    text-anchor="end"
    font-family="Arial, Helvetica, sans-serif"
    font-size="12"
    fill="#555555"
  >
    ${valor}%
  </text>
`
  }

  ORDEM_DIFICULDADES.forEach(
    (
      dificuldade,
      indiceDificuldade
    ) => {
      const centroGrupo =
        margemEsquerda +
        larguraGrupo *
          indiceDificuldade +
        larguraGrupo / 2

      const larguraTotal =
        ORDEM_LLMS.length *
          larguraBarra +
        (
          ORDEM_LLMS.length -
          1
        ) *
          espacamento

      const inicioX =
        centroGrupo -
        larguraTotal / 2

      ORDEM_LLMS.forEach(
        (
          llm,
          indiceLlm
        ) => {
          const registro =
            consolidado.find(
              r =>
                r.llm ===
                  llm &&
                r.dificuldade ===
                  dificuldade
            )

          const valor =
            numero(
              registro
                .taxa_sucesso_integral
            )

          const alturaBarra =
            (
              valor /
              100
            ) *
              alturaGrafico

          const x =
            inicioX +
            indiceLlm *
              (
                larguraBarra +
                espacamento
              )

          const y =
            margemSuperior +
            alturaGrafico -
            alturaBarra

          svg += `
  <rect
    x="${x}"
    y="${y}"
    width="${larguraBarra}"
    height="${alturaBarra}"
    rx="3"
    fill="${CORES[llm]}"
  />

  <text
    x="${x + larguraBarra / 2}"
    y="${y - 8}"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="11"
    font-weight="bold"
    fill="${CORES.texto}"
  >
    ${formatarPercentual(valor)}
  </text>
`
        }
      )

      svg += `
  <text
    x="${centroGrupo}"
    y="${margemSuperior + alturaGrafico + 30}"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="15"
    font-weight="bold"
    fill="${CORES.texto}"
  >
    ${ROTULOS_DIFICULDADE[dificuldade]}
  </text>
`
    }
  )

  const legendaY =
    altura - 48

  const larguraLegenda = 160

  const inicioLegenda =
    (
      largura -
      larguraLegenda *
        ORDEM_LLMS.length
    ) / 2

  ORDEM_LLMS.forEach(
    (llm, indice) => {
      const x =
        inicioLegenda +
        indice *
          larguraLegenda

      svg += `
  <rect
    x="${x}"
    y="${legendaY - 13}"
    width="18"
    height="18"
    rx="2"
    fill="${CORES[llm]}"
  />

  <text
    x="${x + 28}"
    y="${legendaY + 2}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="13"
    fill="${CORES.texto}"
  >
    ${llm}
  </text>
`
    }
  )

  const conteudo =
    criarSvgBase(
      'Sucesso integral por dificuldade',
      'Percentual de suítes com todos os casos Jest aprovados',
      largura,
      altura,
      svg
    )

  fs.writeFileSync(
    path.join(
      GRAFICOS,
      '04-sucesso-integral-por-dificuldade.svg'
    ),
    conteudo,
    'utf8'
  )
}

function gerarGraficos(
  resumo,
  consolidado
) {
  gerarGraficoBarrasPercentual({
    titulo:
      'Taxa de sucesso integral por LLM',
    subtitulo:
      'Percentual das 30 suítes de cada modelo que foram aprovadas integralmente',
    arquivo:
      path.join(
        GRAFICOS,
        '01-sucesso-integral-por-llm.svg'
      ),
    dados:
      ORDEM_LLMS.map(
        llm => {
          const registro =
            resumo.find(
              r =>
                r.llm === llm
            )

          return {
            llm,
            valor:
              registro
                .taxa_sucesso_integral
          }
        }
      )
  })

  gerarGraficoBarrasPercentual({
    titulo:
      'Taxa de executabilidade por LLM',
    subtitulo:
      'Percentual de suítes que conseguiram inicializar e executar testes Jest',
    arquivo:
      path.join(
        GRAFICOS,
        '02-executabilidade-por-llm.svg'
      ),
    dados:
      ORDEM_LLMS.map(
        llm => {
          const registro =
            resumo.find(
              r =>
                r.llm === llm
            )

          return {
            llm,
            valor:
              registro
                .taxa_executabilidade
          }
        }
      )
  })

  gerarGraficoBarrasPercentual({
    titulo:
      'Taxa de aprovação dos casos Jest por LLM',
    subtitulo:
      'Percentual de casos aprovados entre os testes efetivamente executados',
    arquivo:
      path.join(
        GRAFICOS,
        '03-aprovacao-casos-jest-por-llm.svg'
      ),
    dados:
      ORDEM_LLMS.map(
        llm => {
          const registro =
            resumo.find(
              r =>
                r.llm === llm
            )

          return {
            llm,
            valor:
              registro
                .taxa_aprovacao_testes
          }
        }
      )
  })

  gerarGraficoDificuldade(
    consolidado
  )

  gerarGraficoQuantidade({
    titulo:
      'Quantidade de casos Jest executados por LLM',
    subtitulo:
      'Total de casos presentes nas suítes que conseguiram executar',
    arquivo:
      path.join(
        GRAFICOS,
        '05-quantidade-casos-jest-por-llm.svg'
      ),
    dados:
      ORDEM_LLMS.map(
        llm => {
          const registro =
            resumo.find(
              r =>
                r.llm === llm
            )

          return {
            llm,
            valor:
              registro.total_testes
          }
        }
      )
  })
}

function gerarTabelaResumoGeral(
  metricas
) {
  const mapa = new Map()

  for (
    const registro of metricas
  ) {
    mapa.set(
      registro.metrica,
      registro.valor
    )
  }

  const linhas = [
    [
      'Suítes analisadas',
      mapa.get(
        'total_suites'
      )
    ],
    [
      'Suítes executáveis',
      mapa.get(
        'suites_executadas'
      )
    ],
    [
      'Taxa de executabilidade (%)',
      mapa.get(
        'taxa_executabilidade'
      )
    ],
    [
      'Suítes com sucesso integral',
      mapa.get(
        'suites_sucesso'
      )
    ],
    [
      'Taxa de sucesso integral (%)',
      mapa.get(
        'taxa_sucesso_integral'
      )
    ],
    [
      'Suítes com falha em testes',
      mapa.get(
        'suites_falha_testes'
      )
    ],
    [
      'Erros de inicialização',
      mapa.get(
        'erros_inicializacao'
      )
    ],
    [
      'Casos Jest executados',
      mapa.get(
        'total_testes'
      )
    ],
    [
      'Casos aprovados',
      mapa.get(
        'testes_passaram'
      )
    ],
    [
      'Casos falhos',
      mapa.get(
        'testes_falharam'
      )
    ],
    [
      'Taxa de aprovação dos casos (%)',
      mapa.get(
        'taxa_aprovacao_testes'
      )
    ]
  ]

  escreverCsv(
    path.join(
      TABELAS,
      '01-resumo-geral.csv'
    ),
    [
      'metrica',
      'valor'
    ],
    linhas
  )
}

function gerarTabelaComparativoLlms(
  resumo
) {
  const linhas =
    ORDEM_LLMS.map(
      llm => {
        const r =
          resumo.find(
            item =>
              item.llm === llm
          )

        return [
          r.llm,
          r.modelo_versao,
          r.total_suites,
          r.suites_executadas,
          r.taxa_executabilidade,
          r.suites_sucesso,
          r.taxa_sucesso_integral,
          r.total_testes,
          r.testes_passaram,
          r.testes_falharam,
          r.taxa_aprovacao_testes,
          r.media_testes_por_suite_executada,
          r.tempo_medio_segundos
        ]
      }
    )

  escreverCsv(
    path.join(
      TABELAS,
      '02-comparativo-llms.csv'
    ),
    [
      'llm',
      'modelo',
      'total_suites',
      'suites_executadas',
      'taxa_executabilidade',
      'suites_sucesso',
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

function gerarTabelaDificuldade(
  consolidado
) {
  const linhas = []

  for (
    const llm of ORDEM_LLMS
  ) {
    for (
      const dificuldade
      of ORDEM_DIFICULDADES
    ) {
      const r =
        consolidado.find(
          item =>
            item.llm ===
              llm &&
            item.dificuldade ===
              dificuldade
        )

      linhas.push([
        r.llm,
        r.modelo_versao,
        ROTULOS_DIFICULDADE[
          dificuldade
        ],
        r.total_suites,
        r.suites_executadas,
        r.taxa_executabilidade,
        r.suites_sucesso,
        r.taxa_sucesso_integral,
        r.total_testes,
        r.testes_passaram,
        r.testes_falharam,
        r.taxa_aprovacao_testes
      ])
    }
  }

  escreverCsv(
    path.join(
      TABELAS,
      '03-comparativo-por-dificuldade.csv'
    ),
    [
      'llm',
      'modelo',
      'dificuldade',
      'total_suites',
      'suites_executadas',
      'taxa_executabilidade',
      'suites_sucesso',
      'taxa_sucesso_integral',
      'total_testes',
      'testes_passaram',
      'testes_falharam',
      'taxa_aprovacao_testes'
    ],
    linhas
  )
}

function gerarResumoTexto(
  resumo,
  metricas
) {
  const mapa = new Map()

  for (
    const registro of metricas
  ) {
    mapa.set(
      registro.metrica,
      registro.valor
    )
  }

  const chatgpt =
    resumo.find(
      r =>
        r.llm === 'ChatGPT'
    )

  const claude =
    resumo.find(
      r =>
        r.llm === 'Claude'
    )

  const gemini =
    resumo.find(
      r =>
        r.llm === 'Gemini'
    )

  const texto = `RESUMO QUANTITATIVO DO EXPERIMENTO

Suítes analisadas: ${mapa.get('total_suites')}
Suítes executáveis: ${mapa.get('suites_executadas')} (${formatarPercentual(mapa.get('taxa_executabilidade'))})
Suítes com sucesso integral: ${mapa.get('suites_sucesso')} (${formatarPercentual(mapa.get('taxa_sucesso_integral'))})
Suítes com falha em testes: ${mapa.get('suites_falha_testes')}
Erros de inicialização: ${mapa.get('erros_inicializacao')}

Casos Jest executados: ${mapa.get('total_testes')}
Casos aprovados: ${mapa.get('testes_passaram')}
Casos falhos: ${mapa.get('testes_falharam')}
Taxa de aprovação dos casos: ${formatarPercentual(mapa.get('taxa_aprovacao_testes'))}

POR LLM

ChatGPT
Modelo: ${chatgpt.modelo_versao}
Executabilidade: ${formatarPercentual(chatgpt.taxa_executabilidade)}
Sucesso integral: ${formatarPercentual(chatgpt.taxa_sucesso_integral)}
Casos executados: ${chatgpt.total_testes}
Casos aprovados: ${chatgpt.testes_passaram}
Taxa de aprovação dos casos: ${formatarPercentual(chatgpt.taxa_aprovacao_testes)}

Claude
Modelo: ${claude.modelo_versao}
Executabilidade: ${formatarPercentual(claude.taxa_executabilidade)}
Sucesso integral: ${formatarPercentual(claude.taxa_sucesso_integral)}
Casos executados: ${claude.total_testes}
Casos aprovados: ${claude.testes_passaram}
Taxa de aprovação dos casos: ${formatarPercentual(claude.taxa_aprovacao_testes)}

Gemini
Modelo: ${gemini.modelo_versao}
Executabilidade: ${formatarPercentual(gemini.taxa_executabilidade)}
Sucesso integral: ${formatarPercentual(gemini.taxa_sucesso_integral)}
Casos executados: ${gemini.total_testes}
Casos aprovados: ${gemini.testes_passaram}
Taxa de aprovação dos casos: ${formatarPercentual(gemini.taxa_aprovacao_testes)}
`

  fs.writeFileSync(
    path.join(
      TABELAS,
      '04-resumo-quantitativo.txt'
    ),
    texto,
    'utf8'
  )
}

function gerarTabelas(
  resumo,
  consolidado,
  metricas
) {
  gerarTabelaResumoGeral(
    metricas
  )

  gerarTabelaComparativoLlms(
    resumo
  )

  gerarTabelaDificuldade(
    consolidado
  )

  gerarResumoTexto(
    resumo,
    metricas
  )
}

function mostrarAjuda() {
  console.log(`
Análise dos resultados experimentais.

Uso:

  node 07-analise/scripts/analise_resultados.js

Entradas:

  06-resultados/resumo_por_llm.csv
  06-resultados/resultados_consolidados.csv
  06-resultados/metricas_qualidade.csv

Saídas:

  07-analise/graficos/
  07-analise/tabelas/

O script não executa novamente os testes Jest
e não altera os dados brutos do experimento.
`)
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
    mostrarAjuda()
    return
  }

  try {
    garantirDiretorios()

    const resumo =
      lerCsv(
        ARQUIVO_RESUMO_LLM
      )

    const consolidado =
      lerCsv(
        ARQUIVO_CONSOLIDADO
      )

    const metricas =
      lerCsv(
        ARQUIVO_METRICAS
      )

    validarResumoLlm(
      resumo
    )

    validarConsolidado(
      consolidado
    )

    validarMetricas(
      metricas
    )

    gerarGraficos(
      resumo,
      consolidado
    )

    gerarTabelas(
      resumo,
      consolidado,
      metricas
    )

    console.log(
      '============================================'
    )

    console.log(
      'ANÁLISE DOS RESULTADOS'
    )

    console.log(
      '============================================'
    )

    console.log(
      'Dados consolidados validados com sucesso.'
    )

    console.log(
      '\nGráficos gerados:'
    )

    console.log(
      '  01-sucesso-integral-por-llm.svg'
    )

    console.log(
      '  02-executabilidade-por-llm.svg'
    )

    console.log(
      '  03-aprovacao-casos-jest-por-llm.svg'
    )

    console.log(
      '  04-sucesso-integral-por-dificuldade.svg'
    )

    console.log(
      '  05-quantidade-casos-jest-por-llm.svg'
    )

    console.log(
      '\nTabelas geradas:'
    )

    console.log(
      '  01-resumo-geral.csv'
    )

    console.log(
      '  02-comparativo-llms.csv'
    )

    console.log(
      '  03-comparativo-por-dificuldade.csv'
    )

    console.log(
      '  04-resumo-quantitativo.txt'
    )

    console.log(
      '\nNenhum teste Jest foi reexecutado.'
    )
  } catch (erro) {
    console.error(
      '\nERRO NA ANÁLISE:'
    )

    console.error(
      erro.message
    )

    process.exit(1)
  }
}

principal()