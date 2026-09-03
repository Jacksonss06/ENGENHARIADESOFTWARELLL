# Protocolo Experimental

## 1. LLMs avaliadas

A coleta definitiva será realizada por meio das APIs oficiais, usando os seguintes modelos:

- OpenAI: `gpt-5.6-sol` (GPT-5.6 Sol)
- Anthropic: `claude-sonnet-5` (Claude Sonnet 5)
- Google: `gemini-3.1-pro-preview` (Gemini 3.1 Pro Preview)

O identificador efetivamente retornado pela API será armazenado nos metadados de cada coleta.

## 2. Amostra

A amostra é composta por 30 unidades de código JavaScript extraídas de uma aplicação real:

- CT01 a CT10: nível fácil;
- CT11 a CT20: nível médio;
- CT21 a CT30: nível difícil.

Com três LLMs, a coleta definitiva totaliza 90 gerações.

## 3. Prompt

Todas as LLMs recebem o mesmo texto de `03-prompts/prompt_padrao.md`. Em cada requisição, apenas o marcador `[INSERIR AQUI O CONTEÚDO DA UNIDADE CTXX]` é substituído integralmente pelo conteúdo da unidade correspondente.

O prompt não deve ser alterado depois do início da coleta definitiva.

## 4. Procedimento automatizado de coleta

Para cada unidade CT01–CT30, o script `07-analise/scripts/coletar_respostas.js` realiza uma requisição independente para cada LLM. Não há histórico de conversa compartilhado entre unidades ou modelos.

Regras:

1. Cada combinação CT × LLM gera no máximo uma resposta válida para a amostra definitiva.
2. A primeira resposta válida retornada pela API é preservada integralmente.
3. Não são realizadas solicitações de correção, refinamento ou segunda geração após uma resposta válida.
4. Repetições automáticas são permitidas somente quando não houve resposta válida do modelo, por exemplo em erro de rede, HTTP 429 ou erro 5xx.
5. Respostas já existentes são ignoradas pelo script, salvo uso explícito da opção `--force` antes do início da coleta definitiva ou para testes de infraestrutura que não integrem a amostra.
6. A resposta textual integral é salva como `.raw.txt`.
7. O bloco JavaScript é extraído sem correção manual e salvo como `.test.js` para execução.
8. Metadados da requisição e resposta são salvos como `.meta.json`.

## 5. Identificação e armazenamento

Exemplo para CT01/ChatGPT:

- `04-respostas-llms/chatgpt/facil/CT01_chatgpt.raw.txt`
- `04-respostas-llms/chatgpt/facil/CT01_chatgpt.test.js`
- `04-respostas-llms/chatgpt/facil/CT01_chatgpt.meta.json`

O mesmo padrão é utilizado para Claude e Gemini.

## 6. Controle experimental

Durante a coleta definitiva:

- não alterar as 30 unidades;
- não alterar o prompt;
- não fornecer o conteúdo de `02-amostra/oraculo/` às LLMs;
- não informar resultados de outra LLM;
- não corrigir manualmente o código gerado;
- não regenerar uma resposta válida;
- preservar os arquivos brutos e metadados.

## 7. Execução

Os `.test.js` gerados são executados no mesmo ambiente Jest por `07-analise/scripts/executar_testes.js` contra o código original em `01-projeto-base/`.

Os resultados automáticos são gravados em `06-resultados/resultados_execucao_automatica.csv`.

## 8. Métricas

Serão registrados, quando aplicáveis:

- execução bem-sucedida ou falha de execução;
- quantidade de testes gerados;
- quantidade de testes aprovados;
- quantidade de testes que falharam;
- taxa de aprovação;
- tempo de execução;
- aderência ao escopo da unidade;
- linhas de código (LOC);
- complexidade ciclomática;
- complexidade cognitiva;
- code smells.

## 9. Reprodutibilidade

O repositório preservará código-fonte, unidades, oráculo, prompt, protocolo, respostas brutas, testes extraídos, metadados, resultados, scripts, tabelas e gráficos. Chaves de API nunca devem ser versionadas.
