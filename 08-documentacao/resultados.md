# Resultados

## 1. Visão Geral do Experimento

O experimento avaliou 30 unidades de código JavaScript, identificadas de CT01 a CT30, submetidas de forma independente a três modelos de linguagem de grande porte: ChatGPT, Claude e Gemini.

Cada modelo gerou uma suíte de testes para cada unidade experimental, resultando em:

```text
30 unidades × 3 LLMs = 90 suítes de teste
```

As 30 unidades foram distribuídas igualmente entre três níveis de dificuldade:

```text
Fácil:   10 unidades
Médio:   10 unidades
Difícil: 10 unidades
```

Ao final da coleta, foram obtidas 90 respostas válidas, sendo 30 para cada LLM.

---

## 2. Validação do Ambiente pelo Oráculo

Antes da avaliação das suítes produzidas pelas LLMs, foi executado o conjunto de testes de referência utilizado como oráculo experimental.

O oráculo foi composto por 30 suítes, uma para cada unidade de código avaliada.

Os resultados foram:

| Indicador | Resultado |
|---|---:|
| Suítes do oráculo | 30 |
| Suítes executáveis | 30 |
| Suítes com sucesso integral | 30 |
| Casos Jest executados | 30 |
| Casos aprovados | 30 |
| Casos com falha | 0 |
| Erros de inicialização | 0 |

Assim, o oráculo apresentou 100% de sucesso nas 30 unidades selecionadas.

Esse resultado confirmou a executabilidade das unidades experimentais e o funcionamento do ambiente utilizado nas etapas posteriores.

---

## 3. Resultado Global das Suítes Geradas

As 90 suítes geradas pelas três LLMs foram executadas automaticamente no mesmo ambiente experimental.

Os resultados globais foram:

| Indicador | Resultado |
|---|---:|
| Suítes analisadas | 90 |
| Suítes executáveis | 87 |
| Taxa de executabilidade | 96,67% |
| Suítes com sucesso integral | 78 |
| Taxa de sucesso integral | 86,67% |
| Suítes com falha em testes | 9 |
| Erros de inicialização | 3 |
| Erros de execução | 0 |
| Suítes sem testes | 0 |
| Casos Jest executados | 841 |
| Casos aprovados | 814 |
| Casos com falha | 27 |
| Taxa geral de aprovação dos casos | 96,79% |

Das 90 suítes analisadas, 87 conseguiram executar casos Jest. Entre todas as suítes, 78 apresentaram sucesso integral.

Os três erros de inicialização ocorreram antes da execução de qualquer caso Jest e, por esse motivo, não receberam taxa de aprovação individual.

---

## 4. Comparação Descritiva entre as LLMs

Os resultados apresentaram diferenças descritivas entre os três modelos.

| Indicador | ChatGPT | Claude | Gemini |
|---|---:|---:|---:|
| Suítes avaliadas | 30 | 30 | 30 |
| Suítes executáveis | 30 | 29 | 28 |
| Executabilidade | 100,00% | 96,67% | 93,33% |
| Sucesso integral | 29 | 25 | 24 |
| Taxa de sucesso integral | 96,67% | 83,33% | 80,00% |
| Falhas em testes | 1 | 4 | 4 |
| Erros de inicialização | 0 | 1 | 2 |
| Casos Jest executados | 249 | 348 | 244 |
| Casos aprovados | 248 | 327 | 239 |
| Casos com falha | 1 | 21 | 5 |
| Taxa de aprovação dos casos | 99,60% | 93,97% | 97,95% |
| Média de casos por suíte executada | 8,30 | 12,00 | 8,71 |
| Mediana de casos por suíte executada | 8,00 | 12,00 | 8,50 |

O ChatGPT apresentou 29 suítes com sucesso integral, correspondendo a 96,67% das 30 unidades avaliadas.

O Claude apresentou 25 suítes com sucesso integral, correspondendo a 83,33%.

O Gemini apresentou 24 suítes com sucesso integral, correspondendo a 80,00%.

Em relação à quantidade de casos Jest executados, o Claude apresentou o maior total, com 348 casos, seguido pelo ChatGPT, com 249, e Gemini, com 244.

---

## 5. Taxa de Aprovação dos Casos Jest

Considerando apenas os casos Jest efetivamente executados, foram registrados 841 casos no conjunto total das três LLMs.

A distribuição foi:

| LLM | Casos executados | Aprovados | Falhos | Taxa de aprovação |
|---|---:|---:|---:|---:|
| ChatGPT | 249 | 248 | 1 | 99,60% |
| Claude | 348 | 327 | 21 | 93,97% |
| Gemini | 244 | 239 | 5 | 97,95% |
| **Total** | **841** | **814** | **27** | **96,79%** |

O ChatGPT apresentou a maior taxa descritiva de aprovação dos casos executados, seguido pelo Gemini e pelo Claude.

Essa métrica foi utilizada de forma descritiva, uma vez que os casos Jest individuais produzidos pelas diferentes LLMs não constituem observações independentes equivalentes.

---

## 6. Resultados por Nível de Dificuldade

### 6.1 ChatGPT

| Dificuldade | Suítes | Executáveis | Sucesso integral | Taxa de sucesso | Casos Jest | Aprovados | Falhos |
|---|---:|---:|---:|---:|---:|---:|---:|
| Fácil | 10 | 10 | 10 | 100,00% | 83 | 83 | 0 |
| Médio | 10 | 10 | 10 | 100,00% | 96 | 96 | 0 |
| Difícil | 10 | 10 | 9 | 90,00% | 70 | 69 | 1 |

O ChatGPT apresentou sucesso integral em todas as unidades fáceis e médias e em nove das dez unidades difíceis.

### 6.2 Claude

| Dificuldade | Suítes | Executáveis | Sucesso integral | Taxa de sucesso | Casos Jest | Aprovados | Falhos |
|---|---:|---:|---:|---:|---:|---:|---:|
| Fácil | 10 | 10 | 8 | 80,00% | 149 | 144 | 5 |
| Médio | 10 | 10 | 9 | 90,00% | 106 | 99 | 7 |
| Difícil | 10 | 9 | 8 | 80,00% | 93 | 84 | 9 |

O Claude apresentou a maior taxa de sucesso integral no nível médio, com 90,00%, enquanto os níveis fácil e difícil apresentaram 80,00%.

### 6.3 Gemini

| Dificuldade | Suítes | Executáveis | Sucesso integral | Taxa de sucesso | Casos Jest | Aprovados | Falhos |
|---|---:|---:|---:|---:|---:|---:|---:|
| Fácil | 10 | 10 | 8 | 80,00% | 121 | 118 | 3 |
| Médio | 10 | 10 | 10 | 100,00% | 79 | 79 | 0 |
| Difícil | 10 | 8 | 6 | 60,00% | 44 | 42 | 2 |

O Gemini apresentou 100,00% de sucesso integral nas unidades classificadas como médias, 80,00% nas fáceis e 60,00% nas difíceis.

Os resultados por dificuldade não apresentaram redução monotônica de desempenho conforme o aumento do nível de dificuldade para todos os modelos.

---

## 7. Suítes que Não Obtiveram Sucesso Integral

### 7.1 ChatGPT

O ChatGPT apresentou uma única suíte sem sucesso integral: CT27.

A suíte executou sete casos Jest, dos quais seis foram aprovados e um falhou.

### 7.2 Claude

O Claude apresentou cinco suítes sem sucesso integral: CT01, CT02, CT20, CT21 e CT28.

Quatro dessas suítes executaram casos Jest e apresentaram falhas. A CT28 apresentou erro de inicialização e nenhum caso Jest foi executado.

### 7.3 Gemini

O Gemini apresentou seis suítes sem sucesso integral: CT09, CT10, CT24, CT28, CT29 e CT30.

Quatro suítes executaram casos Jest e apresentaram falhas. As unidades CT28 e CT29 apresentaram erro de inicialização.

---

## 8. Principais Tipos de Falha Observados

As falhas identificadas durante a execução abrangeram diferentes situações.

Entre elas foram observados:

- expectativas incompatíveis com o comportamento efetivo do código original;
- comparação incorreta de objetos `Date`;
- pressupostos adicionais sobre validação de datas;
- comportamento esperado diferente do implementado na aplicação;
- problemas em mocks de construtores;
- contaminação de mocks entre casos de teste;
- substituição incompleta do módulo `mongoose`;
- exceções esperadas como respostas HTTP que, no código original, eram propagadas;
- expectativas divergentes sobre valores produzidos durante geração de CSV.

Os erros de inicialização registrados em CT28, para Claude e Gemini, e em CT29, para Gemini, impediram a execução dos casos Jest dessas suítes.

---

## 9. Análise Estatística do Sucesso Integral

Como as mesmas 30 unidades foram avaliadas pelos três modelos, foi realizada uma comparação pareada do desfecho binário de sucesso integral.

As proporções observadas foram:

| LLM | Sucesso | Total | Percentual |
|---|---:|---:|---:|
| ChatGPT | 29 | 30 | 96,67% |
| Claude | 25 | 30 | 83,33% |
| Gemini | 24 | 30 | 80,00% |

O teste Q de Cochran apresentou:

```text
Q(2) = 3,818
p = 0,148
```

Adotando nível de significância de 5%, o resultado não foi estatisticamente significativo.

As comparações pareadas exploratórias pelo teste exato de McNemar, com correção de Holm, apresentaram:

| Comparação | p exato | p ajustado por Holm |
|---|---:|---:|
| ChatGPT × Claude | 0,218750 | 0,437500 |
| ChatGPT × Gemini | 0,125000 | 0,375000 |
| Claude × Gemini | 1,000000 | 1,000000 |

Nenhuma comparação pareada apresentou significância estatística após a correção de Holm.

---

## 10. Análise Estatística da Quantidade de Casos Jest Executados

A quantidade de casos Jest executados por unidade também foi comparada entre os três modelos.

Os totais foram:

```text
ChatGPT: 249
Claude: 348
Gemini: 244
```

O teste de Friedman apresentou:

```text
χ²(2) = 21,876
p = 0,000018
Kendall W = 0,365
```

Os ranks médios foram:

| LLM | Rank médio |
|---|---:|
| ChatGPT | 1,767 |
| Claude | 2,667 |
| Gemini | 1,567 |

O teste de Friedman indicou diferença estatisticamente significativa entre os modelos quanto à quantidade de casos Jest executados.

Como análise pós-hoc, foram realizadas comparações pareadas pelo teste de Wilcoxon signed-rank, com aproximação normal e correção de Holm.

| Comparação | p | p ajustado por Holm |
|---|---:|---:|
| ChatGPT × Claude | 0,000528 | 0,001057 |
| ChatGPT × Gemini | 0,835417 | 0,835417 |
| Claude × Gemini | 0,000294 | 0,000881 |

Foram identificadas diferenças estatisticamente significativas entre ChatGPT e Claude e entre Claude e Gemini.

Não foi identificada diferença estatisticamente significativa entre ChatGPT e Gemini.

---

## 11. Síntese dos Resultados

Os principais resultados obtidos foram:

| Indicador | ChatGPT | Claude | Gemini |
|---|---:|---:|---:|
| Executabilidade | 100,00% | 96,67% | 93,33% |
| Sucesso integral | 96,67% | 83,33% | 80,00% |
| Aprovação dos casos executados | 99,60% | 93,97% | 97,95% |
| Casos Jest executados | 249 | 348 | 244 |
| Rank médio da quantidade de casos | 1,767 | 2,667 | 1,567 |

No desfecho principal, as diferenças observadas nas taxas de sucesso integral não foram estatisticamente significativas pelo teste Q de Cochran.

Na análise secundária, foi identificada diferença estatisticamente significativa na quantidade de casos Jest executados, com o Claude apresentando o maior rank médio.

Os resultados completos, tabelas, dados consolidados e artefatos estatísticos estão armazenados nos diretórios:

```text
06-resultados
07-analise/tabelas
07-analise/graficos
07-analise/estatistica
```
