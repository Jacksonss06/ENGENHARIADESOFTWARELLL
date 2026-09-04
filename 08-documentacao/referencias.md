# Referências Bibliográficas Consolidadas

## 1. Critério temporal

A bibliografia principal do relatório adota o recorte de **2021 a 2026**. As publicações históricas originais de Cochran, McNemar, Friedman, Wilcoxon e Holm não serão utilizadas na bibliografia final, em razão desse critério temporal.

Os nomes dos testes estatísticos permanecem na Metodologia, mas a fundamentação contemporânea da estratégia de análise será apoiada principalmente por Kitchenham e Madeyski (2024), que discutem experimentos de Engenharia de Software com amostras pequenas, desenhos com medidas relacionadas e métodos robustos/não paramétricos.

## 2. Núcleo bibliográfico selecionado

### Oliveira, Silveira e Andrade (2025)

**Avaliação de Qualidade de Código Java gerado por Large Language Models.**

Uso: avaliação empírica e comparativa de artefatos de software produzidos por LLMs; aproximação metodológica pelo uso da primeira resposta sem refinamento.

Chave: `oliveira2025qualidade`.

### Lima e Lima (2026)

**Avaliação do Uso de LLMs na Geração de Casos de Teste a Partir de User Stories: Um Estudo Experimental em Contexto Educacional com Análise de Test Smells.**

Uso: fundamentação diretamente relacionada à geração de casos de teste com apoio de LLMs e à necessidade de avaliação crítica dos artefatos produzidos.

Chave: `lima2026llms`.

### Schäfer et al. (2024)

**An Empirical Evaluation of Using Large Language Models for Automated Unit Test Generation.** IEEE Transactions on Software Engineering, 50(1), 85–105. DOI: 10.1109/TSE.2023.3334955.

Uso: uma das referências mais diretamente relacionadas ao presente trabalho. O TestPilot utiliza LLM para geração automática de testes de unidade em JavaScript e foi avaliado em 25 pacotes npm e 1.684 funções de API. O estudo também utiliza execução dos testes e métricas de cobertura.

Diferença importante: o TestPilot utiliza realimentação para tentar reparar testes que falham; no presente experimento, a primeira resposta válida foi preservada sem refinamento.

Chave: `schaefer2024testpilot`.

### Dakhel et al. (2024)

**Effective Test Generation Using Pre-trained Large Language Models and Mutation Testing.** Information and Software Technology, 171, 107468. DOI: 10.1016/j.infsof.2024.107468.

Uso: sustenta a discussão de que aprovação ou cobertura, isoladamente, não representa necessariamente capacidade de revelar defeitos. O trabalho utiliza mutation testing para avaliar e melhorar testes produzidos com LLMs.

Também fundamenta a proposta de utilizar mutation score como trabalho futuro.

Chave: `dakhel2024mutap`.

### Tasarsu, Tokmak e Catal (2026)

**Test Case Generation Using Large Language Models: A Systematic Literature Review.** Cluster Computing, 29(4), artigo 227. DOI: 10.1007/s10586-026-06021-z.

Uso: referência de estado da arte para Introdução e Discussão. A revisão sistemática analisou 38 artigos revisados por pares publicados entre 2020 e 2025 sobre geração de casos de teste utilizando LLMs.

Chave: `tasarsu2026slr`.

### Kitchenham e Madeyski (2024)

**Recommendations for Analysing and Meta-analysing Small Sample Size Software Engineering Experiments.** Empirical Software Engineering, 29, artigo 137. DOI: 10.1007/s10664-024-10504-1.

Uso: fundamentação metodológica contemporânea para análise de experimentos de Engenharia de Software com amostras pequenas, possíveis distribuições não normais, medidas relacionadas e métodos robustos/não paramétricos.

A referência sustenta a estratégia geral de análise; não deve ser apresentada como se fosse a publicação original dos testes Q de Cochran, McNemar, Friedman ou Wilcoxon.

Chave: `kitchenham2024small`.

## 3. Distribuição recomendada das citações

**Introdução:** `tasarsu2026slr`, `schaefer2024testpilot`, `lima2026llms` e `oliveira2025qualidade`.

**Materiais e Métodos:** `kitchenham2024small`, além das referências diretamente relacionadas ao desenho experimental quando necessário.

**Discussão:** `schaefer2024testpilot`, `dakhel2024mutap`, `tasarsu2026slr`, `lima2026llms` e `oliveira2025qualidade`.

**Trabalhos futuros:** `dakhel2024mutap` para justificar a inclusão futura de mutation testing/mutation score.

## 4. Observações para o relatório final

O arquivo `referencias.bib` consolidado contém somente referências dentro do intervalo de 2021 a 2026.

O arquivo antigo `referencias_estatisticas.bib`, com publicações históricas anteriores a 2021, não deverá ser incluído no documento final.

As referências de Jest e Node.js podem ser acrescentadas posteriormente apenas se houver necessidade real de citar formalmente a documentação dessas tecnologias. Elas não devem ser adicionadas apenas para aumentar a bibliografia.

A bibliografia deve permanecer enxuta e relacionada às afirmações efetivamente realizadas no relatório.
