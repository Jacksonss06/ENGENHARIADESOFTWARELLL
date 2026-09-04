# Metodologia

## 1. Delineamento da Pesquisa

Este trabalho adota uma abordagem experimental e quantitativa para avaliar a capacidade de Large Language Models (LLMs) na geração automatizada de casos de teste para código JavaScript utilizando o framework Jest.

O experimento foi realizado sobre unidades de código extraídas de uma aplicação real, denominada HidroWebnia API. O mesmo conjunto de unidades experimentais foi submetido independentemente a três LLMs, permitindo comparar os resultados obtidos pelos modelos sob condições equivalentes.

Foram avaliadas as seguintes LLMs:

| Identificação | Provedor | Modelo utilizado |
|---|---|---|
| ChatGPT | OpenAI | `gpt-5.6-sol` |
| Claude | Anthropic | `claude-sonnet-5` |
| Gemini | Google | `gemini-3.1-pro-preview` |

O delineamento utilizou 30 unidades de código e três LLMs, resultando em:

```text
30 unidades × 3 LLMs = 90 gerações
```

Cada unidade foi submetida uma vez a cada modelo, considerando como resultado experimental a primeira resposta válida obtida.

## 2. Projeto Utilizado

As unidades experimentais foram extraídas do backend da aplicação HidroWebnia API, desenvolvida em JavaScript sobre Node.js.

Uma cópia do projeto utilizado no experimento foi preservada em:

```text
01-projeto-base/backend/hidroWebnia_API-main/
```

O código-fonte original não foi modificado para adaptar seu comportamento às respostas produzidas pelas LLMs.

As unidades selecionadas representam diferentes tipos de componentes encontrados na aplicação, incluindo funções utilitárias, middlewares, serviços e controllers.

## 3. Seleção das Unidades Experimentais

Foram selecionadas 30 unidades de código, identificadas de CT01 a CT30.

As unidades foram armazenadas em:

```text
02-amostra/unidades/
```

A amostra foi organizada em três níveis de dificuldade:

| Dificuldade | Identificadores | Quantidade |
|---|---|---:|
| Fácil | CT01–CT10 | 10 |
| Média | CT11–CT20 | 10 |
| Difícil | CT21–CT30 | 10 |
| **Total** | **CT01–CT30** | **30** |

A classificação foi utilizada para permitir a análise descritiva do comportamento das LLMs diante de unidades com diferentes características estruturais e de dependência.

Os critérios utilizados para classificação das unidades são documentados separadamente em:

```text
08-documentacao/classificacao_dificuldade.md
```

A classificação por dificuldade não foi utilizada para alterar o prompt ou fornecer informações adicionais às LLMs.

## 4. Unidades Avaliadas

As 30 unidades experimentais correspondem aos seguintes comportamentos:

### Fácil

- CT01 — `calculateDaysPassed`;
- CT02 — `canAdvanceCycle`, condição verdadeira;
- CT03 — `canAdvanceCycle`, condição falsa;
- CT04 — `advanceCycle`;
- CT05 — `Timer.formatTime`;
- CT06 — `Timer.padTime`;
- CT07 — `getTimeRange`, período diário;
- CT08 — `getTimeRange`, período semanal;
- CT09 — `getTimeRange`, período mensal;
- CT10 — `getTimeRange`, período inválido.

### Média

- CT11 — `adminMiddleware`, usuário administrador;
- CT12 — `adminMiddleware`, acesso proibido;
- CT13 — `validateRegister`, ausência de nome de usuário;
- CT14 — `validateRegister`, divergência de senhas;
- CT15 — `validateRegister`, senha fraca;
- CT16 — `validateRegister`, dados válidos;
- CT17 — `validateLogin`, ausência de senha;
- CT18 — `authMiddleware`, ausência de token;
- CT19 — `authMiddleware`, token válido;
- CT20 — `getTimerForDevice`, mesmo dispositivo.

### Difícil

- CT21 — `graphicsService.getMeasuresByPeriod`;
- CT22 — `getMeasuresByCustomPeriod`;
- CT23 — `graphicsController`, período personalizado sem datas;
- CT24 — `authController.login`, autenticação bem-sucedida;
- CT25 — `authController.register`, usuário duplicado;
- CT26 — `devicesController.getOneDevice`, escopo do usuário;
- CT27 — `devicesController.cycleDevices`;
- CT28 — `exportController`, ObjectId inválido;
- CT29 — `exportController`, filtro diário;
- CT30 — `csvGenerator`, geração por stream.

O manifesto completo das unidades experimentais foi mantido juntamente com a amostra para permitir rastreabilidade entre os identificadores CT01–CT30 e o código utilizado no experimento.

## 5. Prompt Padronizado

Para controlar a influência da formulação da solicitação, foi utilizado um único prompt padronizado para todas as LLMs e todas as unidades experimentais.

O prompt foi armazenado em:

```text
03-prompts/prompt_padrao.md
```

Seu conteúdo foi congelado antes da coleta definitiva.

O prompt instruiu as LLMs a:

- analisar somente o código-fonte fornecido;
- gerar testes automatizados compatíveis com Jest;
- não alterar o código-fonte original;
- utilizar mocks quando necessários;
- testar o comportamento principal da unidade;
- incluir casos positivos e negativos quando aplicáveis;
- considerar casos de borda relevantes;
- retornar somente código JavaScript;
- utilizar Node.js e CommonJS;
- produzir conteúdo que pudesse ser salvo diretamente em arquivo `.test.js`.

Para cada requisição, o conteúdo da unidade CT correspondente foi inserido na área reservada do prompt padronizado.

Não foram fornecidos às LLMs os testes do oráculo, resultados das outras LLMs ou resultados de execuções anteriores.

## 6. Protocolo de Geração

A coleta definitiva foi realizada por meio das APIs dos respectivos provedores.

Foi utilizado o script:

```text
07-analise/scripts/coletar_respostas.js
```

Os identificadores dos modelos foram fixados no código do coletor para evitar alterações acidentais entre as execuções.

Para o ChatGPT foi utilizado o modelo:

```text
gpt-5.6-sol
```

com nível de esforço de raciocínio configurado como `medium`.

Para o Claude foi utilizado:

```text
claude-sonnet-5
```

Para o Gemini foi utilizado:

```text
gemini-3.1-pro-preview
```

Cada combinação entre unidade e LLM constituiu uma requisição independente e sem contexto proveniente das demais requisições.

O protocolo adotou as seguintes regras:

1. utilização do mesmo prompt padronizado;
2. fornecimento somente da unidade de código correspondente;
3. requisições independentes entre unidades e modelos;
4. utilização da primeira resposta válida retornada;
5. ausência de pedidos de correção;
6. ausência de refinamento iterativo;
7. ausência de regeneração de respostas válidas;
8. nenhuma modificação manual do teste gerado antes da avaliação.

Dessa forma, cada resposta representa a geração inicial do modelo para a unidade correspondente.

## 7. Tratamento de Falhas de API

Falhas de comunicação ou indisponibilidade do provedor que não produziram uma resposta válida não foram consideradas respostas experimentais.

Durante a coleta, ocorreram situações de indisponibilidade temporária do serviço, incluindo respostas HTTP 503.

Nessas situações, a mesma coleta pôde ser repetida posteriormente exclusivamente porque nenhuma resposta válida havia sido obtida.

Uma vez obtida uma resposta válida para determinada combinação de LLM e unidade experimental, essa resposta foi preservada e não foi regenerada com o objetivo de melhorar seu resultado.

O coletor não implementou mecanismo automático de repetição de requisições. Novas tentativas decorrentes de falhas de disponibilidade foram realizadas posteriormente, mantendo-se as respostas válidas previamente coletadas.

Esse procedimento diferencia repetição por indisponibilidade do provedor de refinamento da resposta produzida pela LLM.

## 8. Armazenamento das Respostas

Para cada resposta válida foram preservados três tipos principais de artefatos:

```text
.raw.txt
.test.js
.meta.json
```

O arquivo `.raw.txt` preserva a resposta original retornada pelo provedor.

O arquivo `.test.js` contém o código utilizado na execução com Jest.

O arquivo `.meta.json` registra metadados relacionados à coleta, incluindo informações disponíveis sobre modelo, data da requisição, status HTTP, utilização de tokens e outros dados necessários à rastreabilidade.

Os artefatos foram organizados por LLM e nível de dificuldade em:

```text
04-respostas-llms/
```

A coleta definitiva resultou em:

| LLM | Respostas válidas |
|---|---:|
| ChatGPT | 30 |
| Claude | 30 |
| Gemini | 30 |
| **Total** | **90** |

Após o encerramento da coleta, os 90 arquivos `.test.js` foram considerados congelados para a etapa de avaliação.

## 9. Execução das Suítes de Teste

As suítes geradas foram executadas utilizando Jest.

A execução automatizada foi realizada pelo script:

```text
07-analise/scripts/executar_testes.js
```

Cada suíte foi executada individualmente, permitindo associar seu resultado à respectiva combinação de unidade experimental e LLM.

O backend original foi utilizado como diretório de trabalho durante a execução, e os arquivos de teste foram informados ao Jest por caminho absoluto utilizando a opção:

```text
--runTestsByPath
```

Essa estratégia foi adotada para tornar consistente a resolução das dependências do projeto.

Nenhum dos 90 arquivos `.test.js` gerados foi alterado para fazer uma suíte inicialmente incorreta passar.

## 10. Normalização do Harness

Como os artefatos experimentais foram armazenados fora da árvore original do backend, foi necessário normalizar aspectos relacionados à resolução de módulos e ao diretório de execução.

A normalização incluiu:

- execução com o backend original como `cwd`;
- utilização de caminhos absolutos para as suítes;
- disponibilização do `node_modules` do backend;
- mapeamento de caminhos legítimos para módulos efetivamente existentes no projeto;
- utilização de configuração controlada do Jest.

A normalização teve como objetivo corrigir apenas diferenças decorrentes da organização do ambiente experimental.

Não foram criados módulos inexistentes nem corrigidos nomes, dependências, mocks, expectativas ou interpretações incorretas produzidas pelas LLMs.

Consequentemente, falhas atribuíveis ao conteúdo gerado permaneceram registradas como resultados das respectivas LLMs.

Os detalhes técnicos do ambiente e da normalização estão documentados em:

```text
08-documentacao/ambiente_experimental.md
```

## 11. Classificação dos Resultados de Execução

Cada suíte recebeu um status final.

Os principais estados utilizados foram:

### `sucesso`

A suíte foi inicializada, executou pelo menos um caso Jest e todos os casos foram aprovados.

### `falha_testes`

A suíte foi inicializada e executada, porém um ou mais casos Jest falharam.

### `erro_inicializacao`

A suíte não conseguiu iniciar adequadamente, impossibilitando a execução dos casos Jest.

### `erro_execucao`

O processo responsável pela execução apresentou erro que impediu a avaliação normal da suíte.

### `sem_testes`

A execução foi inicializada, mas nenhum caso Jest foi identificado como executado.

Essa separação permite distinguir uma expectativa incorreta dentro de um teste de uma suíte que sequer conseguiu inicializar.

## 12. Métricas de Avaliação

Foram utilizadas métricas em dois níveis principais: suíte e caso de teste.

### 12.1. Executabilidade

A taxa de executabilidade representa a proporção de suítes que conseguiram efetivamente executar casos Jest.

A métrica é calculada por:

```text
Taxa de executabilidade =
suítes executáveis / total de suítes × 100
```

### 12.2. Sucesso Integral

Uma suíte foi considerada integralmente bem-sucedida somente quando todos os seus casos Jest foram aprovados.

A taxa de sucesso integral é calculada por:

```text
Taxa de sucesso integral =
suítes com todos os casos aprovados / total de suítes × 100
```

Essa métrica considera no denominador todas as suítes submetidas à avaliação, incluindo aquelas que apresentaram erro de inicialização.

### 12.3. Taxa de Aprovação dos Casos Jest

Para as suítes que efetivamente executaram casos, foi calculada a proporção de casos aprovados:

```text
Taxa de aprovação =
casos Jest aprovados / casos Jest executados × 100
```

Erros de inicialização não foram transformados artificialmente em casos Jest reprovados, uma vez que nenhum caso foi efetivamente executado nessas situações.

### 12.4. Quantidade de Casos Gerados

Também foi registrada a quantidade de casos Jest executados por suíte.

Essa medida foi utilizada como informação descritiva sobre o comportamento de geração dos modelos.

Uma quantidade maior de testes não foi interpretada isoladamente como evidência de maior qualidade.

### 12.5. Tempo de Execução

O tempo de execução das suítes também foi registrado para fins descritivos e de rastreabilidade do experimento.

Não se assume que diferenças pequenas de tempo representem necessariamente diferenças de qualidade entre as LLMs.

## 13. Oráculo de Referência

Foi mantido um conjunto independente de testes de referência para as 30 unidades experimentais:

```text
02-amostra/oraculo/
```

O oráculo possui uma suíte para cada unidade CT01–CT30.

Sua principal finalidade é validar que todas as unidades selecionadas podem ser carregadas e testadas no ambiente experimental normalizado.

O oráculo não foi fornecido às LLMs.

Sua execução foi automatizada pelo script:

```text
07-analise/scripts/executar_oraculo.js
```

Após a normalização específica dos caminhos utilizados pelo oráculo, foram obtidos:

```text
30/30 suítes executáveis
30/30 suítes aprovadas integralmente
30/30 casos Jest aprovados
```

Assim, todas as 30 unidades experimentais puderam ser carregadas e testadas no ambiente de referência.

O número de casos do oráculo não foi comparado diretamente à quantidade de casos produzidos pelas LLMs, pois os dois conjuntos possuem finalidades distintas.

## 14. Consolidação dos Resultados

Os resultados definitivos da execução das 90 suítes foram registrados em:

```text
06-resultados/resultados_execucao_automatica.csv
```

A consolidação foi realizada pelo script:

```text
07-analise/scripts/consolidar_resultados.js
```

A etapa produziu, entre outros artefatos:

```text
06-resultados/resumo_por_llm.csv
06-resultados/resultados_consolidados.csv
06-resultados/metricas_qualidade.csv
```

Os resultados globais consolidados foram:

| Métrica | Resultado |
|---|---:|
| Suítes analisadas | 90 |
| Suítes executáveis | 87 |
| Taxa de executabilidade | 96,67% |
| Suítes com sucesso integral | 78 |
| Taxa de sucesso integral | 86,67% |
| Suítes com falha em testes | 9 |
| Erros de inicialização | 3 |
| Casos Jest executados | 841 |
| Casos aprovados | 814 |
| Casos falhos | 27 |
| Taxa de aprovação dos casos executados | 96,79% |

## 15. Análise Descritiva

A análise descritiva foi automatizada pelo script:

```text
07-analise/scripts/analise_resultados.js
```

Foram produzidos indicadores globais, comparações entre LLMs e comparações por dificuldade.

Os artefatos derivados foram armazenados em:

```text
07-analise/graficos/
07-analise/tabelas/
```

A análise considera separadamente:

- executabilidade das suítes;
- sucesso integral das suítes;
- aprovação dos casos Jest executados;
- quantidade de casos produzidos;
- nível de dificuldade das unidades.

A quantidade de casos produzidos por cada modelo é interpretada em conjunto com as demais métricas e não como medida isolada de qualidade.

## 16. Comparação entre as LLMs

Como as mesmas 30 unidades foram submetidas às três LLMs, os resultados possuem estrutura pareada por unidade experimental.

A comparação principal entre os modelos considera o sucesso integral de cada suíte para cada uma das 30 unidades.

Assim, para uma mesma unidade CT, é possível verificar se a suíte produzida por ChatGPT, Claude e Gemini obteve ou não sucesso integral.

A análise estatística inferencial deve respeitar esse pareamento, evitando tratar as 90 observações como amostras independentes.

Para o desfecho binário de sucesso integral, será utilizado um procedimento apropriado para três condições relacionadas. Comparações posteriores entre pares de modelos serão realizadas somente quando metodologicamente justificadas e com correção para múltiplas comparações.

Outras métricas quantitativas, como proporção de casos aprovados e quantidade de casos por suíte, serão avaliadas considerando a estrutura dos dados e as limitações decorrentes do fato de cada LLM poder gerar quantidades diferentes de casos Jest.

Os casos Jest individuais produzidos por modelos diferentes não serão tratados como observações independentes equivalentes, pois cada LLM determinou autonomamente a quantidade, estrutura e finalidade dos testes gerados.

## 17. Preservação da Integridade Experimental

Durante a execução do experimento foram adotadas medidas para reduzir interferências posteriores sobre os resultados:

- o prompt foi congelado antes da coleta definitiva;
- as três LLMs receberam o mesmo prompt;
- as mesmas 30 unidades foram utilizadas para os três modelos;
- cada requisição foi independente;
- somente a primeira resposta válida foi considerada;
- não houve refinamento das respostas;
- respostas válidas não foram regeneradas;
- os arquivos `.test.js` não foram corrigidos após a geração;
- o código-fonte original não foi alterado para acomodar os testes;
- o oráculo não foi apresentado às LLMs;
- os resultados brutos foram preservados;
- as transformações posteriores foram realizadas por scripts reproduzíveis.

Essas medidas permitem rastrear cada resultado desde a unidade experimental e resposta original da LLM até sua execução e consolidação.

## 18. Reprodutibilidade

Os artefatos experimentais foram organizados em um repositório versionado, contendo o projeto base, unidades experimentais, prompts, respostas das LLMs, metadados, suítes de teste, oráculo, scripts de execução, arquivos CSV, tabelas e gráficos.

A organização adotada permite reproduzir as principais etapas do experimento e auditar as decisões metodológicas empregadas.

As limitações identificadas durante o estudo são documentadas separadamente em:

```text
08-documentacao/limitacoes.md
```
