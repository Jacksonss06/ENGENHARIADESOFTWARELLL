const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

const ORACULO_ROOT = path.join(
  REPO_ROOT,
  '02-amostra',
  'oraculo'
);

const BACKEND_ROOT = path.join(
  REPO_ROOT,
  '01-projeto-base',
  'backend',
  'hidroWebnia_API-main'
);

const JEST_PATH = path.join(
  REPO_ROOT,
  '05-execucao',
  'node_modules',
  'jest',
  'bin',
  'jest.js'
);

const JEST_CONFIG = path.join(
  REPO_ROOT,
  '05-execucao',
  'oraculo',
  'jest.config.js'
);

const RESULTADO_CSV = path.join(
  REPO_ROOT,
  '06-resultados',
  'resultados_oraculo.csv'
);

function mostrarAjuda() {
  console.log(`
EXECUTOR DO ORÁCULO

Uso:
  node 07-analise/scripts/executar_oraculo.js
  node 07-analise/scripts/executar_oraculo.js --ct=CT01
  node 07-analise/scripts/executar_oraculo.js --dry-run
  node 07-analise/scripts/executar_oraculo.js --help

Opções:
  --ct=CTXX     Executa somente uma unidade do oráculo
  --dry-run     Lista os testes selecionados sem executar o Jest
  --help        Exibe esta ajuda

Saída definitiva:
  06-resultados/resultados_oraculo.csv
`);
}

function argumentosCLI() {
  const args = process.argv.slice(2);

  const config = {
    help: false,
    dryRun: false,
    ct: null
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      config.help = true;
      continue;
    }

    if (arg === '--dry-run') {
      config.dryRun = true;
      continue;
    }

    if (arg.startsWith('--ct=')) {
      config.ct = arg.split('=')[1].trim().toUpperCase();
      continue;
    }

    throw new Error(`Argumento desconhecido: ${arg}`);
  }

  return config;
}

function validarAmbiente() {
  const itens = [
    ['Diretório do oráculo', ORACULO_ROOT],
    ['Diretório do backend', BACKEND_ROOT],
    ['Jest', JEST_PATH],
    ['Configuração Jest do oráculo', JEST_CONFIG]
  ];

  let valido = true;

  for (const [nome, caminho] of itens) {
    if (!fs.existsSync(caminho)) {
      console.error(`[ERRO] ${nome} não encontrado:`);
      console.error(`       ${caminho}`);
      valido = false;
    }
  }

  if (!valido) {
    process.exit(1);
  }
}

function dificuldadeNormalizada(pasta) {
  const mapa = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil'
  };

  return mapa[pasta] || pasta;
}

function extrairCt(nomeArquivo) {
  const match = nomeArquivo.match(/^(CT\d+)/i);
  return match ? match[1].toUpperCase() : null;
}

function listarTestes() {
  const dificuldades = ['facil', 'medio', 'dificil'];
  const testes = [];

  for (const dificuldade of dificuldades) {
    const pasta = path.join(ORACULO_ROOT, dificuldade);

    if (!fs.existsSync(pasta)) {
      continue;
    }

    const arquivos = fs
      .readdirSync(pasta)
      .filter((arquivo) => arquivo.endsWith('.test.js'));

    for (const arquivo of arquivos) {
      const ct = extrairCt(arquivo);

      if (!ct) {
        continue;
      }

      testes.push({
        ct,
        dificuldade: dificuldadeNormalizada(dificuldade),
        arquivo,
        caminho: path.join(pasta, arquivo)
      });
    }
  }

  return testes.sort((a, b) => {
    const numA = Number(a.ct.replace('CT', ''));
    const numB = Number(b.ct.replace('CT', ''));
    return numA - numB;
  });
}

function limitarPorCt(testes, ct) {
  if (!ct) {
    return testes;
  }

  const filtrados = testes.filter((teste) => teste.ct === ct);

  if (filtrados.length === 0) {
    throw new Error(`Unidade não encontrada no oráculo: ${ct}`);
  }

  return filtrados;
}

function executarTeste(teste) {
  const inicio = process.hrtime.bigint();

  const resultado = spawnSync(
    process.execPath,
    [
      JEST_PATH,
      `--config=${JEST_CONFIG}`,
      '--runTestsByPath',
      teste.caminho,
      '--json'
    ],
    {
      cwd: BACKEND_ROOT,
      encoding: 'utf8',
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024
    }
  );

  const fim = process.hrtime.bigint();
  const tempoSegundos = Number(fim - inicio) / 1_000_000_000;

  if (resultado.error) {
    return {
      ...teste,
      executou: 'nao',
      passou: 'nao',
      status: 'erro_execucao',
      totalTestes: 0,
      testesPassaram: 0,
      testesFalharam: 0,
      tempoSegundos,
      erro: resultado.error.message
    };
  }

  let json;

  try {
    json = JSON.parse(resultado.stdout);
  } catch {
    return {
      ...teste,
      executou: 'nao',
      passou: 'nao',
      status: 'erro_inicializacao',
      totalTestes: 0,
      testesPassaram: 0,
      testesFalharam: 0,
      tempoSegundos,
      erro: (resultado.stderr || '').trim()
    };
  }

  const totalTestes = Number(json.numTotalTests || 0);
  const testesPassaram = Number(json.numPassedTests || 0);
  const testesFalharam = Number(json.numFailedTests || 0);

  if (totalTestes === 0) {
    return {
      ...teste,
      executou: 'nao',
      passou: 'nao',
      status: 'sem_testes',
      totalTestes,
      testesPassaram,
      testesFalharam,
      tempoSegundos,
      erro: ''
    };
  }

  const sucesso =
    json.success === true &&
    testesFalharam === 0 &&
    testesPassaram === totalTestes;

  return {
    ...teste,
    executou: 'sim',
    passou: sucesso ? 'sim' : 'nao',
    status: sucesso ? 'sucesso' : 'falha_testes',
    totalTestes,
    testesPassaram,
    testesFalharam,
    tempoSegundos,
    erro: sucesso ? '' : (resultado.stderr || '').trim()
  };
}

function csvEscape(valor) {
  const texto =
    valor === null || valor === undefined
      ? ''
      : String(valor);

  if (
    texto.includes(',') ||
    texto.includes('"') ||
    texto.includes('\n')
  ) {
    return `"${texto.replace(/"/g, '""')}"`;
  }

  return texto;
}

function gerarCsv(resultados) {
  const linhas = [
    [
      'ct',
      'dificuldade',
      'arquivo',
      'executou',
      'passou',
      'status',
      'total_testes',
      'testes_passaram',
      'testes_falharam',
      'tempo_segundos',
      'erro'
    ].join(',')
  ];

  for (const r of resultados) {
    linhas.push(
      [
        r.ct,
        r.dificuldade,
        r.arquivo,
        r.executou,
        r.passou,
        r.status,
        r.totalTestes,
        r.testesPassaram,
        r.testesFalharam,
        r.tempoSegundos.toFixed(3),
        r.erro
      ]
        .map(csvEscape)
        .join(',')
    );
  }

  fs.mkdirSync(path.dirname(RESULTADO_CSV), {
    recursive: true
  });

  fs.writeFileSync(
    RESULTADO_CSV,
    `${linhas.join('\n')}\n`,
    'utf8'
  );
}

function mostrarResumo(resultados) {
  const total = resultados.length;
  const executadas = resultados.filter(r => r.executou === 'sim').length;
  const sucesso = resultados.filter(r => r.status === 'sucesso').length;
  const falhas = resultados.filter(r => r.status === 'falha_testes').length;
  const errosInicializacao = resultados.filter(r => r.status === 'erro_inicializacao').length;
  const errosExecucao = resultados.filter(r => r.status === 'erro_execucao').length;
  const semTestes = resultados.filter(r => r.status === 'sem_testes').length;

  const totalTestes = resultados.reduce((s, r) => s + r.totalTestes, 0);
  const passaram = resultados.reduce((s, r) => s + r.testesPassaram, 0);
  const falharam = resultados.reduce((s, r) => s + r.testesFalharam, 0);

  console.log('');
  console.log('============================================');
  console.log('RESULTADO DO ORÁCULO');
  console.log('============================================');
  console.log(`Suítes analisadas: ${total}`);
  console.log(`Suítes executáveis: ${executadas}/${total} (${((executadas / total) * 100).toFixed(2)}%)`);
  console.log(`Sucesso integral: ${sucesso}/${total} (${((sucesso / total) * 100).toFixed(2)}%)`);
  console.log(`Falhas em testes: ${falhas}`);
  console.log(`Erros de inicialização: ${errosInicializacao}`);
  console.log(`Erros de execução: ${errosExecucao}`);
  console.log(`Sem testes: ${semTestes}`);
  console.log(`Casos Jest executados: ${totalTestes}`);
  console.log(`Casos aprovados: ${passaram}`);
  console.log(`Casos falhos: ${falharam}`);
  console.log('');
}

function principal() {
  let cli;

  try {
    cli = argumentosCLI();
  } catch (erro) {
    console.error(`[ERRO] ${erro.message}`);
    process.exit(1);
  }

  if (cli.help) {
    mostrarAjuda();
    return;
  }

  validarAmbiente();

  let testes = listarTestes();

  try {
    testes = limitarPorCt(testes, cli.ct);
  } catch (erro) {
    console.error(`[ERRO] ${erro.message}`);
    process.exit(1);
  }

  console.log('============================================');
  console.log('EXECUÇÃO DO ORÁCULO');
  console.log('============================================');
  console.log(`Backend: ${BACKEND_ROOT}`);
  console.log(`Config Jest: ${JEST_CONFIG}`);
  console.log(`Suítes selecionadas: ${testes.length}`);
  console.log('');

  if (!cli.ct && testes.length !== 30) {
    console.error(
      `[ERRO] Esperadas 30 suítes, mas foram encontradas ${testes.length}.`
    );
    process.exit(1);
  }

  if (cli.dryRun) {
    for (const teste of testes) {
      console.log(
        `${teste.ct} | ${teste.dificuldade} | ${teste.arquivo}`
      );
    }

    console.log('');
    console.log('Dry-run concluído.');
    return;
  }

  const resultados = [];

  for (const teste of testes) {
    process.stdout.write(
      `Executando ${teste.ct} (${teste.dificuldade})... `
    );

    const resultado = executarTeste(teste);
    resultados.push(resultado);

    if (resultado.status === 'sucesso') {
      console.log(
        `PASS (${resultado.testesPassaram}/${resultado.totalTestes})`
      );
    } else {
      console.log(resultado.status.toUpperCase());
    }
  }

  mostrarResumo(resultados);

  if (!cli.ct) {
    gerarCsv(resultados);
    console.log(`Arquivo gerado: ${RESULTADO_CSV}`);
  }

  const houveFalha = resultados.some(
    r => r.status !== 'sucesso'
  );

  if (houveFalha) {
    process.exitCode = 1;
  }
}

principal();
