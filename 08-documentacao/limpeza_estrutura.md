# Limpeza e preparação para a coleta definitiva

Antes da coleta definitiva foram removidos do pacote de trabalho:

- resultados do piloto CT01 nas três LLMs;
- evidências de execução do piloto CT01;
- `resultados_execucao_automatica.csv` gerado no piloto;
- conteúdo antigo de `resultados_brutos.csv`;
- `node_modules/` do ambiente Jest;
- diretório `.git/` do pacote ZIP de transferência;
- arquivo de texto vazio/acidental em `07-analise/`;
- `.gitkeep` redundantes em diretórios já populados.

Foram adicionados:

- template de prompt restaurado com marcador CTXX;
- protocolo atualizado para coleta via APIs oficiais;
- `.env.example` sem chaves;
- script de validação;
- script de coleta automática das 90 respostas;
- script de pipeline;
- registro `coleta_llms.csv`;
- mapeamentos Jest para os alvos da amostra.

O `.git` do repositório local existente não deve ser apagado. Ele foi removido apenas do ZIP limpo entregue para evitar transportar metadados internos do repositório.
