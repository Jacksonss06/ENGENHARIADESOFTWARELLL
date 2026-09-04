const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

const ARQUIVO_ENTRADA = path.join(
  REPO_ROOT,
  '06-resultados',
  'resultados_execucao_automatica.csv'
);

const DIRETORIO_SAIDA = path.join(
  REPO_ROOT,
  '07-analise',
  'estatistica'
);

const LLMS = ['ChatGPT', 'Claude', 'Gemini'];
const ALPHA = 0.05;

function parseCsv(texto) {
  const linhas = [];
  let linha = [];
  let campo = '';
  let dentroAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const char = texto[i];

    if (dentroAspas) {
      if (char === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          dentroAspas = false;
        }
      } else {
        campo += char;
      }
    } else if (char === '"') {
      dentroAspas = true;
    } else if (char === ',') {
      linha.push(campo);
      campo = '';
    } else if (char === '\n') {
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = '';
    } else if (char !== '\r') {
      campo += char;
    }
  }

  if (campo.length > 0 || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }

  return linhas.filter(
    (l) => l.some((valor) => valor !== '')
  );
}

function csvEscape(valor) {
  const texto =
    valor === null || valor === undefined
      ? ''
      : String(valor);

  if (
    texto.includes(',') ||
    texto.includes('"') ||
    texto.includes('\n') ||
    texto.includes('\r')
  ) {
    return `"${texto.replace(/"/g, '""')}"`;
  }

  return texto;
}

function carregarDados() {
  if (!fs.existsSync(ARQUIVO_ENTRADA)) {
    throw new Error(
      `Arquivo não encontrado: ${ARQUIVO_ENTRADA}`
    );
  }

  let texto = fs.readFileSync(ARQUIVO_ENTRADA, 'utf8');
  texto = texto.replace(/^\uFEFF/, '');

  const linhas = parseCsv(texto);
  const cabecalho = linhas[0];

  const colunas = {
    id: cabecalho.indexOf('id'),
    dificuldade: cabecalho.indexOf('dificuldade'),
    llm: cabecalho.indexOf('llm'),
    status: cabecalho.indexOf('status_execucao'),
    qtdTestes: cabecalho.indexOf('qtd_testes')
  };

  for (const [nome, indice] of Object.entries(colunas)) {
    if (indice === -1) {
      throw new Error(
        `Coluna obrigatória não encontrada: ${nome}`
      );
    }
  }

  return linhas.slice(1).map((linha) => ({
    id: linha[colunas.id],
    dificuldade: linha[colunas.dificuldade],
    llm: linha[colunas.llm],
    status: linha[colunas.status],
    qtdTestes: Number(linha[colunas.qtdTestes])
  }));
}

function construirMatriz(dados) {
  if (dados.length !== 90) {
    throw new Error(
      `Esperados 90 registros; encontrados ${dados.length}.`
    );
  }

  const matriz = [];

  for (let numero = 1; numero <= 30; numero++) {
    const id = `CT${String(numero).padStart(2, '0')}`;
    const registros = dados.filter((r) => r.id === id);

    if (registros.length !== 3) {
      throw new Error(
        `${id}: esperados 3 registros; encontrados ${registros.length}.`
      );
    }

    const item = {
      id,
      dificuldade: registros[0].dificuldade,
      sucesso: {},
      qtdTestes: {}
    };

    for (const llm of LLMS) {
      const encontrados = registros.filter(
        (r) => r.llm === llm
      );

      if (encontrados.length !== 1) {
        throw new Error(
          `${id}: esperado exatamente um registro para ${llm}.`
        );
      }

      item.sucesso[llm] =
        encontrados[0].status === 'sucesso' ? 1 : 0;

      item.qtdTestes[llm] =
        encontrados[0].qtdTestes;
    }

    matriz.push(item);
  }

  return matriz;
}

function validarMatriz(matriz) {
  const sucessosEsperados = {
    ChatGPT: 29,
    Claude: 25,
    Gemini: 24
  };

  const testesEsperados = {
    ChatGPT: 249,
    Claude: 348,
    Gemini: 244
  };

  const sucessos = {};
  const testes = {};

  for (const llm of LLMS) {
    sucessos[llm] = matriz.reduce(
      (soma, item) => soma + item.sucesso[llm],
      0
    );

    testes[llm] = matriz.reduce(
      (soma, item) => soma + item.qtdTestes[llm],
      0
    );

    if (sucessos[llm] !== sucessosEsperados[llm]) {
      throw new Error(
        `${llm}: total inesperado de sucessos.`
      );
    }

    if (testes[llm] !== testesEsperados[llm]) {
      throw new Error(
        `${llm}: total inesperado de casos Jest executados.`
      );
    }
  }

  return { sucessos, testes };
}

function cochranQ(matriz) {
  const k = LLMS.length;

  const colunas = LLMS.map((llm) =>
    matriz.reduce(
      (soma, item) => soma + item.sucesso[llm],
      0
    )
  );

  const linhas = matriz.map((item) =>
    LLMS.reduce(
      (soma, llm) => soma + item.sucesso[llm],
      0
    )
  );

  const total = colunas.reduce((a, b) => a + b, 0);

  const somaColunasQuadrado =
    colunas.reduce((a, b) => a + b * b, 0);

  const somaLinhasQuadrado =
    linhas.reduce((a, b) => a + b * b, 0);

  const q =
    ((k - 1) *
      (k * somaColunasQuadrado - total * total)) /
    (k * total - somaLinhasQuadrado);

  const gl = k - 1;

  if (gl !== 2) {
    throw new Error(
      'Cálculo do p-valor preparado para três condições.'
    );
  }

  const p = Math.exp(-q / 2);

  return { q, gl, p };
}

function combinacao(n, k) {
  if (k < 0 || k > n) return 0;

  k = Math.min(k, n - k);

  let resultado = 1;

  for (let i = 1; i <= k; i++) {
    resultado =
      (resultado * (n - k + i)) / i;
  }

  return resultado;
}

function mcnemarExato(matriz, a, b) {
  let ambosSucesso = 0;
  let a1b0 = 0;
  let a0b1 = 0;
  let ambosFalha = 0;

  for (const item of matriz) {
    const va = item.sucesso[a];
    const vb = item.sucesso[b];

    if (va === 1 && vb === 1) ambosSucesso++;
    else if (va === 1 && vb === 0) a1b0++;
    else if (va === 0 && vb === 1) a0b1++;
    else ambosFalha++;
  }

  const n = a1b0 + a0b1;

  let p = 1;

  if (n > 0) {
    const limite = Math.min(a1b0, a0b1);
    let acumulada = 0;

    for (let i = 0; i <= limite; i++) {
      acumulada +=
        combinacao(n, i) * Math.pow(0.5, n);
    }

    p = Math.min(1, 2 * acumulada);
  }

  return {
    a,
    b,
    ambosSucesso,
    a1b0,
    a0b1,
    ambosFalha,
    discordantes: n,
    p
  };
}

function corrigirHolm(resultados, campoP = 'p') {
  const ordenados = resultados
    .map((resultado, indice) => ({
      indice,
      p: resultado[campoP]
    }))
    .sort((a, b) => a.p - b.p);

  let anterior = 0;
  const m = ordenados.length;

  for (let i = 0; i < m; i++) {
    let ajustado =
      ordenados[i].p * (m - i);

    ajustado = Math.min(1, ajustado);
    ajustado = Math.max(anterior, ajustado);

    resultados[ordenados[i].indice].pHolm =
      ajustado;

    anterior = ajustado;
  }

  return resultados;
}

function calcularRanks(valores) {
  const ordenados = valores
    .map((valor, indice) => ({
      valor,
      indice
    }))
    .sort((a, b) => a.valor - b.valor);

  const ranks = Array(valores.length).fill(0);

  let i = 0;

  while (i < ordenados.length) {
    let j = i;

    while (
      j + 1 < ordenados.length &&
      ordenados[j + 1].valor === ordenados[i].valor
    ) {
      j++;
    }

    const rankMedio =
      ((i + 1) + (j + 1)) / 2;

    for (let k = i; k <= j; k++) {
      ranks[ordenados[k].indice] = rankMedio;
    }

    i = j + 1;
  }

  return ranks;
}

function friedman(matriz) {
  const n = matriz.length;
  const k = LLMS.length;

  const somasRanks = Array(k).fill(0);

  let somaTermosEmpates = 0;

  for (const item of matriz) {
    const valores = LLMS.map(
      (llm) => item.qtdTestes[llm]
    );

    const ranks = calcularRanks(valores);

    for (let j = 0; j < k; j++) {
      somasRanks[j] += ranks[j];
    }

    const frequencias = new Map();

    for (const valor of valores) {
      frequencias.set(
        valor,
        (frequencias.get(valor) || 0) + 1
      );
    }

    for (const tamanho of frequencias.values()) {
      if (tamanho > 1) {
        somaTermosEmpates +=
          Math.pow(tamanho, 3) - tamanho;
      }
    }
  }

  const somaRanksQuadrado =
    somasRanks.reduce(
      (soma, rank) => soma + rank * rank,
      0
    );

  let chi2 =
    (12 /
      (n * k * (k + 1))) *
      somaRanksQuadrado -
    3 * n * (k + 1);

  const denominadorCorrecao =
    n * (Math.pow(k, 3) - k);

  const fatorCorrecao =
    1 -
    somaTermosEmpates /
      denominadorCorrecao;

  if (fatorCorrecao <= 0) {
    throw new Error(
      'Não foi possível aplicar correção de empates no Friedman.'
    );
  }

  chi2 /= fatorCorrecao;

  const gl = k - 1;

  if (gl !== 2) {
    throw new Error(
      'Cálculo do p-valor preparado para três condições.'
    );
  }

  const p = Math.exp(-chi2 / 2);

  const kendallW =
    chi2 / (n * (k - 1));

  return {
    chi2,
    gl,
    p,
    kendallW,
    somasRanks,
    ranksMedios: somasRanks.map(
      (valor) => valor / n
    ),
    fatorCorrecao
  };
}

function normalCdf(z) {
  const sinal = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);

  const t = 1 / (1 + 0.3275911 * x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const erf =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) *
      t +
      a1) *
      t) *
      Math.exp(-x * x);

  return 0.5 * (1 + sinal * erf);
}

function wilcoxonPareado(matriz, a, b) {
  const diferencas = [];

  for (const item of matriz) {
    const diferenca =
      item.qtdTestes[a] - item.qtdTestes[b];

    if (diferenca !== 0) {
      diferencas.push({
        diferenca,
        absoluto: Math.abs(diferenca)
      });
    }
  }

  const absolutos =
    diferencas.map((d) => d.absoluto);

  const ranks = calcularRanks(absolutos);

  let wPositivo = 0;
  let wNegativo = 0;

  for (let i = 0; i < diferencas.length; i++) {
    if (diferencas[i].diferenca > 0) {
      wPositivo += ranks[i];
    } else {
      wNegativo += ranks[i];
    }
  }

  const n = diferencas.length;

  const media =
    (n * (n + 1)) / 4;

  const frequencias = new Map();

  for (const valor of absolutos) {
    frequencias.set(
      valor,
      (frequencias.get(valor) || 0) + 1
    );
  }

  let correcaoEmpates = 0;

  for (const t of frequencias.values()) {
    if (t > 1) {
      correcaoEmpates +=
        t * (t + 1) * (2 * t + 1);
    }
  }

  const variancia =
    (n * (n + 1) * (2 * n + 1)) / 24 -
    correcaoEmpates / 48;

  const desvio = Math.sqrt(variancia);

  const w = Math.min(wPositivo, wNegativo);

  let z = 0;
  let p = 1;

  if (desvio > 0) {
    z =
      (Math.abs(w - media) - 0.5) /
      desvio;

    p =
      2 *
      (1 - normalCdf(Math.abs(z)));

    p = Math.max(0, Math.min(1, p));
  }

  return {
    a,
    b,
    n,
    wPositivo,
    wNegativo,
    w,
    z,
    p
  };
}

function media(valores) {
  return (
    valores.reduce((a, b) => a + b, 0) /
    valores.length
  );
}

function mediana(valores) {
  const ordenados = [...valores].sort(
    (a, b) => a - b
  );

  const meio = Math.floor(
    ordenados.length / 2
  );

  if (ordenados.length % 2 === 0) {
    return (
      (ordenados[meio - 1] +
        ordenados[meio]) /
      2
    );
  }

  return ordenados[meio];
}

function formatar(valor, casas = 6) {
  return Number(valor).toFixed(casas);
}

function salvarArquivos(
  matriz,
  validacao,
  cochran,
  mcnemar,
  friedmanResultado,
  wilcoxon
) {
  fs.mkdirSync(
    DIRETORIO_SAIDA,
    { recursive: true }
  );

  const matrizCsv = [
    [
      'ct',
      'dificuldade',
      'ChatGPT_sucesso',
      'Claude_sucesso',
      'Gemini_sucesso',
      'ChatGPT_testes_executados',
      'Claude_testes_executados',
      'Gemini_testes_executados'
    ].join(',')
  ];

  for (const item of matriz) {
    matrizCsv.push(
      [
        item.id,
        item.dificuldade,
        item.sucesso.ChatGPT,
        item.sucesso.Claude,
        item.sucesso.Gemini,
        item.qtdTestes.ChatGPT,
        item.qtdTestes.Claude,
        item.qtdTestes.Gemini
      ]
        .map(csvEscape)
        .join(',')
    );
  }

  fs.writeFileSync(
    path.join(
      DIRETORIO_SAIDA,
      '01-matriz-pareada.csv'
    ),
    `${matrizCsv.join('\n')}\n`,
    'utf8'
  );

  fs.writeFileSync(
    path.join(
      DIRETORIO_SAIDA,
      '02-cochran-q.csv'
    ),
    [
      'teste,q,graus_liberdade,p_valor,alpha,significativo',
      [
        'Cochran Q',
        formatar(cochran.q),
        cochran.gl,
        formatar(cochran.p),
        ALPHA,
        cochran.p < ALPHA ? 'sim' : 'nao'
      ].join(',')
    ].join('\n') + '\n',
    'utf8'
  );

  const mcnemarCsv = [
    [
      'comparacao',
      'ambos_sucesso',
      'primeiro_sucesso_segundo_falha',
      'primeiro_falha_segundo_sucesso',
      'ambos_falha',
      'discordantes',
      'p_exato',
      'p_holm',
      'significativo_apos_holm'
    ].join(',')
  ];

  for (const r of mcnemar) {
    mcnemarCsv.push(
      [
        `${r.a} x ${r.b}`,
        r.ambosSucesso,
        r.a1b0,
        r.a0b1,
        r.ambosFalha,
        r.discordantes,
        formatar(r.p),
        formatar(r.pHolm),
        r.pHolm < ALPHA ? 'sim' : 'nao'
      ].join(',')
    );
  }

  fs.writeFileSync(
    path.join(
      DIRETORIO_SAIDA,
      '03-mcnemar-pares.csv'
    ),
    `${mcnemarCsv.join('\n')}\n`,
    'utf8'
  );

  const friedmanCsv = [
    [
      'teste',
      'n',
      'k',
      'qui_quadrado',
      'graus_liberdade',
      'p_valor',
      'kendall_w',
      'alpha',
      'significativo'
    ].join(','),

    [
      'Friedman',
      matriz.length,
      LLMS.length,
      formatar(friedmanResultado.chi2),
      friedmanResultado.gl,
      formatar(friedmanResultado.p),
      formatar(friedmanResultado.kendallW),
      ALPHA,
      friedmanResultado.p < ALPHA
        ? 'sim'
        : 'nao'
    ].join(',')
  ];

  fs.writeFileSync(
    path.join(
      DIRETORIO_SAIDA,
      '04-friedman-quantidade-testes.csv'
    ),
    `${friedmanCsv.join('\n')}\n`,
    'utf8'
  );

  const wilcoxonCsv = [
    [
      'comparacao',
      'pares_nao_zero',
      'w_positivo',
      'w_negativo',
      'w',
      'z_aproximado',
      'p_aproximado',
      'p_holm',
      'significativo_apos_holm'
    ].join(',')
  ];

  for (const r of wilcoxon) {
    wilcoxonCsv.push(
      [
        `${r.a} x ${r.b}`,
        r.n,
        formatar(r.wPositivo, 3),
        formatar(r.wNegativo, 3),
        formatar(r.w, 3),
        formatar(r.z),
        formatar(r.p),
        formatar(r.pHolm),
        r.pHolm < ALPHA ? 'sim' : 'nao'
      ].join(',')
    );
  }

  fs.writeFileSync(
    path.join(
      DIRETORIO_SAIDA,
      '05-wilcoxon-quantidade-testes.csv'
    ),
    `${wilcoxonCsv.join('\n')}\n`,
    'utf8'
  );

  const resumo = [];

  resumo.push('ANÁLISE ESTATÍSTICA');
  resumo.push('============================================');
  resumo.push('');

  resumo.push('1. DESFECHO PRINCIPAL - SUCESSO INTEGRAL');
  resumo.push(
    `ChatGPT: ${validacao.sucessos.ChatGPT}/30 (96,67%)`
  );
  resumo.push(
    `Claude: ${validacao.sucessos.Claude}/30 (83,33%)`
  );
  resumo.push(
    `Gemini: ${validacao.sucessos.Gemini}/30 (80,00%)`
  );
  resumo.push('');
  resumo.push(
    `Cochran Q: Q(${cochran.gl}) = ${formatar(cochran.q, 3)}; p = ${formatar(cochran.p, 6)}`
  );
  resumo.push(
    cochran.p < ALPHA
      ? 'Resultado: diferença estatisticamente significativa.'
      : 'Resultado: não foi identificada diferença estatisticamente significativa.'
  );

  resumo.push('');
  resumo.push('McNemar exato com correção de Holm:');

  for (const r of mcnemar) {
    resumo.push(
      `${r.a} x ${r.b}: p=${formatar(r.p)}; p_Holm=${formatar(r.pHolm)}`
    );
  }

  resumo.push('');
  resumo.push(
    '2. ANÁLISE SECUNDÁRIA - CASOS JEST EXECUTADOS'
  );

  for (const llm of LLMS) {
    const valores =
      matriz.map(
        (item) => item.qtdTestes[llm]
      );

    resumo.push(
      `${llm}: total=${validacao.testes[llm]}; média=${formatar(media(valores), 2)}; mediana=${formatar(mediana(valores), 2)}`
    );
  }

  resumo.push('');
  resumo.push(
    `Friedman: χ²(${friedmanResultado.gl}) = ${formatar(friedmanResultado.chi2, 3)}; p = ${formatar(friedmanResultado.p, 6)}`
  );

  resumo.push(
    `Kendall W = ${formatar(friedmanResultado.kendallW, 3)}`
  );

  resumo.push('');

  if (friedmanResultado.p < ALPHA) {
    resumo.push(
      'Como o teste de Friedman foi significativo, as comparações pareadas de Wilcoxon são utilizadas como análise pós-hoc.'
    );
  } else {
    resumo.push(
      'Como o teste de Friedman não foi significativo, as comparações pareadas de Wilcoxon devem ser consideradas apenas exploratórias.'
    );
  }

  resumo.push('');

  for (const r of wilcoxon) {
    resumo.push(
      `${r.a} x ${r.b}: p=${formatar(r.p)}; p_Holm=${formatar(r.pHolm)}`
    );
  }

  resumo.push('');
  resumo.push('NOTA METODOLÓGICA');
  resumo.push(
    'Os valores de qtd_testes representam casos Jest efetivamente executados/reconhecidos durante a execução automatizada.'
  );
  resumo.push(
    'Valores zero associados a erros de inicialização não devem ser interpretados como evidência de que a LLM gerou zero casos de teste.'
  );
  resumo.push(
    'Os casos Jest individuais não são tratados como observações estatisticamente independentes.'
  );

  fs.writeFileSync(
    path.join(
      DIRETORIO_SAIDA,
      '06-resumo-estatistico.txt'
    ),
    `${resumo.join('\n')}\n`,
    'utf8'
  );
}

function principal() {
  if (
    process.argv.includes('--help') ||
    process.argv.includes('-h')
  ) {
    console.log(
      'Uso: node 07-analise/scripts/analise_estatistica.js'
    );
    return;
  }

  console.log(
    '============================================'
  );
  console.log('ANÁLISE ESTATÍSTICA');
  console.log(
    '============================================'
  );

  const dados = carregarDados();
  const matriz = construirMatriz(dados);
  const validacao = validarMatriz(matriz);

  console.log(`Registros: ${dados.length}`);
  console.log(
    `Unidades pareadas: ${matriz.length}`
  );

  console.log('');
  console.log('Sucesso integral:');
  console.log(
    `  ChatGPT: ${validacao.sucessos.ChatGPT}/30`
  );
  console.log(
    `  Claude:  ${validacao.sucessos.Claude}/30`
  );
  console.log(
    `  Gemini:  ${validacao.sucessos.Gemini}/30`
  );

  const cochran = cochranQ(matriz);

  console.log('');
  console.log("Cochran's Q:");
  console.log(
    `  Q(${cochran.gl}) = ${formatar(cochran.q)}`
  );
  console.log(
    `  p = ${formatar(cochran.p)}`
  );

  let mcnemar = [
    mcnemarExato(matriz, 'ChatGPT', 'Claude'),
    mcnemarExato(matriz, 'ChatGPT', 'Gemini'),
    mcnemarExato(matriz, 'Claude', 'Gemini')
  ];

  mcnemar = corrigirHolm(mcnemar);

  console.log('');
  console.log(
    'Casos Jest executados:'
  );

  for (const llm of LLMS) {
    console.log(
      `  ${llm}: ${validacao.testes[llm]}`
    );
  }

  const friedmanResultado =
    friedman(matriz);

  console.log('');
  console.log('Friedman:');
  console.log(
    `  chi2(${friedmanResultado.gl}) = ${formatar(friedmanResultado.chi2)}`
  );
  console.log(
    `  p = ${formatar(friedmanResultado.p)}`
  );
  console.log(
    `  Kendall W = ${formatar(friedmanResultado.kendallW)}`
  );

  console.log('');
  console.log('Ranks médios:');

  LLMS.forEach((llm, indice) => {
    console.log(
      `  ${llm}: ${formatar(friedmanResultado.ranksMedios[indice], 3)}`
    );
  });

  let wilcoxon = [
    wilcoxonPareado(
      matriz,
      'ChatGPT',
      'Claude'
    ),
    wilcoxonPareado(
      matriz,
      'ChatGPT',
      'Gemini'
    ),
    wilcoxonPareado(
      matriz,
      'Claude',
      'Gemini'
    )
  ];

  wilcoxon =
    corrigirHolm(wilcoxon);

  console.log('');
  console.log(
    'Wilcoxon pareado + Holm:'
  );

  for (const r of wilcoxon) {
    console.log(
      `  ${r.a} x ${r.b}: p=${formatar(r.p)}, p_Holm=${formatar(r.pHolm)}`
    );
  }

  salvarArquivos(
    matriz,
    validacao,
    cochran,
    mcnemar,
    friedmanResultado,
    wilcoxon
  );

  console.log('');
  console.log(
    `Resultados salvos em: ${DIRETORIO_SAIDA}`
  );
}

principal();
