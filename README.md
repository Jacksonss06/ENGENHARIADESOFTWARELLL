# Avaliação de LLMs na Geração de Casos de Teste

Repositório de artefatos do experimento com 30 unidades JavaScript e três LLMs.

## Organização

- `01-projeto-base/`: código-fonte real utilizado no estudo.
- `02-amostra/`: 30 unidades experimentais e testes de referência (`oraculo`).
- `03-prompts/`: prompt congelado e protocolo experimental.
- `04-respostas-llms/`: respostas brutas, testes extraídos e metadados de ChatGPT, Claude e Gemini.
- `05-execucao/`: ambiente Jest padronizado.
- `06-resultados/`: coleta, resultados brutos, consolidados e métricas.
- `07-analise/`: automação da coleta, execução e análise.
- `08-documentacao/`: metodologia, ambiente, dificuldade e limitações.
- `09-relatorio/`: Overleaf, apresentação e PDF final.

## Amostra

- 10 unidades fáceis: CT01–CT10
- 10 unidades médias: CT11–CT20
- 10 unidades difíceis: CT21–CT30
- 3 LLMs × 30 unidades = 90 respostas definitivas

## Automação

Consulte `07-analise/README.md`.

As chaves de API devem ficar somente em `07-analise/.env`, que é ignorado pelo Git.
