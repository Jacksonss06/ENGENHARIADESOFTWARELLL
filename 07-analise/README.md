# Automação do experimento

## Preparação

1. Instale as dependências do ambiente de testes:

```bash
cd 05-execucao
npm install
cd ..
```

2. Instale as dependências da API original para que controllers/services possam ser carregados:

```bash
npm ci --prefix 01-projeto-base/backend/hidroWebnia_API-main
```

3. Copie `07-analise/.env.example` para `07-analise/.env` e preencha as três chaves.

## Validar sem gastar API

```bash
node 07-analise/scripts/validar_configuracao.js
node 07-analise/scripts/coletar_respostas.js --dry-run
```

## Teste controlado com apenas uma unidade/modelo

```bash
node 07-analise/scripts/coletar_respostas.js --ct=CT01 --llm=chatgpt
node 07-analise/scripts/executar_testes.js
```

Depois de validar a infraestrutura, remova os artefatos desse teste controlado antes da coleta definitiva ou use um clone separado do repositório.

## Coleta definitiva das 90 respostas

```bash
node 07-analise/scripts/coletar_respostas.js
```

O script ignora combinações já coletadas. Não use `--force` durante a coleta definitiva.

## Executar todos os testes gerados

```bash
node 07-analise/scripts/executar_testes.js
```

## Pipeline completo

```bash
node 07-analise/scripts/executar_pipeline.js
```

O pipeline valida a estrutura, coleta apenas itens ainda ausentes e executa os testes encontrados.
