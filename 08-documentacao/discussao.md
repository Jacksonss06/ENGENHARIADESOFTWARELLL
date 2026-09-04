# Discussão

## 1. Interpretação Geral dos Resultados

Este estudo avaliou a capacidade de três modelos de linguagem de grande porte — ChatGPT, Claude e Gemini — de gerar suítes de testes automatizados em Jest para 30 unidades de código JavaScript extraídas de uma aplicação real. A execução das 90 suítes produzidas mostrou que as LLMs foram capazes de gerar testes executáveis e integralmente aprovados em grande parte das unidades avaliadas, embora tenham sido observadas diferenças entre os modelos e diferentes tipos de falha.

No conjunto global, 87 das 90 suítes foram executáveis, correspondendo a uma taxa de executabilidade de 96,67%. Destas 90 suítes, 78 apresentaram sucesso integral, resultando em uma taxa global de 86,67%. Foram executados 841 casos Jest, dos quais 814 foram aprovados e 27 falharam.

Esses resultados mostram que a geração automática de testes por LLMs apresentou elevado nível de executabilidade no ambiente estudado. Entretanto, a existência de nove suítes com falhas em testes e três erros de inicialização demonstra que uma resposta sintaticamente plausível ou aparentemente completa não garante sua adequação ao comportamento efetivamente implementado no código-fonte.

A validação prévia do oráculo, com 30 das 30 suítes de referência aprovadas, foi importante para distinguir falhas relacionadas às respostas das LLMs de problemas gerais do ambiente experimental.

---

## 2. Sucesso Integral das Suítes

Na comparação descritiva, o ChatGPT apresentou a maior taxa de sucesso integral, com 29 das 30 suítes aprovadas integralmente (96,67%). O Claude obteve 25 de 30 (83,33%) e o Gemini 24 de 30 (80,00%).

Apesar dessas diferenças percentuais, o teste Q de Cochran não identificou diferença estatisticamente significativa entre os três modelos, com Q(2) = 3,818 e p = 0,148. As comparações pareadas pelo teste exato de McNemar, corrigidas pelo procedimento de Holm, também não apresentaram diferenças estatisticamente significativas.

Portanto, os resultados permitem afirmar que o ChatGPT apresentou o maior desempenho descritivo no desfecho principal desta amostra, mas não fornecem evidência estatística suficiente para concluir que exista superioridade geral desse modelo em relação aos demais.

Essa distinção é importante porque diferenças percentuais observadas em uma amostra relativamente pequena podem não se manter em outros projetos, conjuntos de código, prompts ou versões de modelos. O resultado deve, assim, ser interpretado dentro das condições específicas do protocolo experimental adotado.

---

## 3. Quantidade de Casos de Teste e Qualidade das Suítes

Um dos resultados mais relevantes foi a diferença entre quantidade de casos Jest executados e sucesso das suítes.

O Claude apresentou o maior número de casos executados, totalizando 348, enquanto o ChatGPT apresentou 249 e o Gemini 244. O teste de Friedman identificou diferença estatisticamente significativa entre os modelos para essa variável, com χ²(2) = 21,876 e p = 0,000018. O tamanho de efeito medido por Kendall's W foi de 0,365.

Nas comparações pós-hoc pelo teste de Wilcoxon signed-rank, com aproximação normal e correção de Holm, foram observadas diferenças significativas entre Claude e ChatGPT e entre Claude e Gemini. Não foi identificada diferença significativa entre ChatGPT e Gemini.

Apesar de produzir o maior número de casos executados, o Claude não apresentou a maior taxa de sucesso integral nem a maior taxa de aprovação dos casos. O Claude obteve 93,97% de aprovação dos casos executados, enquanto o ChatGPT obteve 99,60% e o Gemini 97,95%.

Esses resultados mostram que, nesta amostra, maior quantidade de casos de teste não correspondeu necessariamente a maior sucesso das suítes. A quantidade de testes, portanto, não deve ser utilizada isoladamente como indicador de qualidade.

Também é necessário observar que a variável analisada representa casos Jest efetivamente reconhecidos e executados pelo ambiente. Valores iguais a zero nas suítes com erro de inicialização não significam necessariamente que a LLM tenha produzido zero casos no código gerado, mas que nenhum deles chegou a ser executado.

---

## 4. Executabilidade, Dependências e Uso de Mocks

Os resultados evidenciaram que parte das dificuldades das LLMs esteve relacionada não à sintaxe básica do Jest, mas à interação entre os testes, as dependências da aplicação e os mecanismos de mock.

O ChatGPT apresentou 100% de executabilidade, enquanto Claude e Gemini apresentaram, respectivamente, 96,67% e 93,33%. Os três erros de inicialização ocorreram em respostas de Claude e Gemini.

Em CT28, tanto Claude quanto Gemini produziram uma configuração de mock para o módulo `mongoose` que substituiu o módulo de forma incompleta. Como o modelo original da aplicação dependia de `Schema`, a substituição impediu o carregamento do módulo antes da execução dos testes. Em CT29, comportamento semelhante ocorreu na resposta do Gemini.

Também foram observados problemas de mock em suítes que conseguiram inicializar. Em CT20, por exemplo, a suíte do Claude executou sete casos, mas todos falharam devido à forma como o construtor utilizado pela unidade foi mockado. Em CT21, alterações no comportamento de mocks afetaram casos posteriores da própria suíte.

Esses resultados sugerem que a geração de testes para unidades com dependências externas, modelos, construtores e módulos compartilhados exige mais do que a criação de asserções. A LLM precisa reproduzir corretamente o comportamento das dependências e compreender os efeitos do sistema de módulos e do mecanismo de mocks do framework.

---

## 5. Expectativas Divergentes do Código Original

Outra categoria importante de falhas ocorreu quando a LLM criou expectativas consideradas razoáveis, mas que não correspondiam ao comportamento efetivamente implementado.

No ChatGPT, a única falha ocorreu em CT27, em uma comparação entre objetos `Date` equivalentes em valor, mas diferentes em identidade de referência. O uso de uma comparação de identidade resultou na falha de um dos sete casos da suíte.

No Claude, CT01 e CT02 apresentaram expectativas diferentes dos valores retornados pela implementação original. Em CT01, parte da suíte assumiu um tratamento de tempo diferente daquele realizado pela função. Em CT02, alguns valores esperados apresentaram deslocamento em relação aos valores efetivamente retornados.

No Gemini, CT09 e CT10 esperavam que determinadas entradas de data inválidas produzissem uma exceção específica, embora o código original não implementasse esse comportamento. Em CT24, a suíte esperava tratamento interno de uma exceção que, na implementação avaliada, era propagada. Em CT30, uma expectativa sobre valor inválido na geração de CSV também divergiu do resultado produzido pela aplicação.

Esses casos mostram uma limitação relevante: a LLM pode gerar testes baseados no comportamento que considera desejável ou convencional, em vez de restringir as expectativas ao comportamento observável no código fornecido. Isso é particularmente importante neste experimento, pois o prompt determinava explicitamente que o modelo deveria analisar somente a unidade de código apresentada.

Do ponto de vista de engenharia de software, algumas dessas expectativas poderiam inclusive indicar oportunidades de melhoria no código de produção. Entretanto, no protocolo deste estudo, o objetivo não era avaliar se a implementação original representava a melhor regra de negócio possível, mas verificar se os testes gerados eram compatíveis com o comportamento da unidade fornecida.

---

## 6. Influência do Nível de Dificuldade

A análise descritiva por dificuldade não revelou uma redução uniforme de desempenho conforme o aumento da complexidade das unidades.

O ChatGPT apresentou 100% de sucesso integral nas unidades fáceis e médias e 90% nas difíceis. O Claude apresentou 80% nas fáceis, 90% nas médias e 80% nas difíceis. O Gemini apresentou 80% nas fáceis, 100% nas médias e 60% nas difíceis.

Portanto, apenas observar a classificação fácil, média ou difícil não foi suficiente para explicar todas as falhas. O Claude, por exemplo, apresentou desempenho superior nas unidades médias em comparação às fáceis, enquanto o Gemini também obteve seu melhor resultado no grupo médio.

Uma possível interpretação é que a dificuldade para geração de testes não dependa exclusivamente da complexidade geral da unidade. Características específicas, como dependências externas, necessidade de mocks, manipulação de datas, comportamento assíncrono e interpretação de exceções, podem exercer influência relevante.

Como cada nível contém apenas dez unidades e não foi realizada uma análise inferencial específica para dificuldade, essas observações devem permanecer descritivas.

---

## 7. Relação com os Trabalhos da Literatura

Os resultados deste trabalho podem ser discutidos em conjunto com estudos anteriores sobre geração de artefatos de software utilizando LLMs.

O trabalho de avaliação de qualidade de código Java gerado por LLMs adotou um protocolo no qual diferentes modelos foram submetidos a problemas de programação e a primeira solução obtida foi utilizada sem ciclos posteriores de refinamento. Essa característica metodológica se aproxima do protocolo empregado neste estudo, no qual foi utilizada a primeira resposta válida de cada LLM, sem feedback ou correção posterior.

Apesar dessa semelhança, os objetos avaliados são distintos. O estudo anterior concentrou-se na geração de soluções Java para problemas de programação e utilizou mecanismos como execução no LeetCode e análise estática com SonarQube. O presente trabalho, por sua vez, avaliou a geração de testes Jest para unidades JavaScript extraídas de uma aplicação real.

Essa diferença amplia o tipo de problema analisado. Na geração de testes, não basta produzir código executável: as expectativas, mocks e cenários precisam corresponder ao comportamento de uma implementação que já existe.

Outro trabalho utilizado como referência investigou o uso de LLMs na geração de casos de teste a partir de user stories em um contexto educacional. Nesse estudo, casos gerados com apoio do ChatGPT foram avaliados quanto à utilidade, novidade e características de qualidade, mostrando potencial das LLMs para apoiar atividades de teste, mas também a necessidade de avaliação crítica dos artefatos produzidos.

Os resultados do presente experimento são compatíveis com essa necessidade de avaliação crítica. Embora a maioria das suítes tenha sido executável e integralmente aprovada, foram encontrados casos em que os testes continham expectativas incompatíveis com o código original ou mocks incapazes de reproduzir adequadamente as dependências.

O presente estudo acrescenta a esse contexto uma comparação controlada entre três LLMs sobre as mesmas 30 unidades e uma avaliação baseada na execução automatizada dos arquivos Jest gerados. Além da análise descritiva, foram utilizados testes estatísticos pareados para o sucesso integral e para a quantidade de casos Jest executados.

As diferenças de desenho experimental impedem uma comparação direta de percentuais entre os estudos. Entretanto, em conjunto, os trabalhos reforçam a utilidade potencial das LLMs como apoio à engenharia de software, ao mesmo tempo em que indicam que os artefatos produzidos devem ser validados antes de sua incorporação a um processo de desenvolvimento.

---

## 8. Implicações para o Uso de LLMs em Testes de Software

Os resultados apresentam algumas implicações práticas para equipes que pretendam utilizar LLMs na geração automatizada de testes.

Primeiramente, a alta executabilidade observada indica que as LLMs avaliadas conseguem produzir, com frequência, estruturas Jest compatíveis com aplicações Node.js. Isso pode reduzir o esforço inicial necessário para elaboração de suítes de teste, especialmente em funções e componentes com dependências simples.

Entretanto, a ocorrência de falhas relacionadas a mocks, objetos, datas e tratamento de exceções mostra que a execução automatizada deve fazer parte obrigatória do fluxo de utilização desses testes. Um arquivo gerado não deve ser considerado correto apenas porque apresenta sintaxe Jest plausível.

Em segundo lugar, a quantidade de casos produzidos não deve ser utilizada isoladamente para selecionar uma LLM ou avaliar a qualidade de sua resposta. O Claude apresentou maior volume de casos executados, com diferença estatisticamente significativa em relação aos outros modelos, mas não apresentou a maior taxa de sucesso integral.

Outro ponto importante é a preservação do código gerado originalmente. Neste experimento, nenhuma das 90 suítes foi corrigida manualmente antes da avaliação. Em um cenário de desenvolvimento real, os testes gerados poderiam passar por revisão e correção humana. Entretanto, essa intervenção modificaria o artefato originalmente produzido pela LLM e dificultaria a avaliação isolada da capacidade do modelo.

Dessa forma, uma estratégia prática seria utilizar LLMs como ferramentas de apoio para produzir uma primeira versão das suítes, seguida de execução automática, revisão dos resultados e validação por desenvolvedores antes da integração ao repositório principal.

---

## 9. Limitações do Estudo

Os resultados devem ser interpretados considerando as limitações do desenho experimental.

A amostra foi composta por 30 unidades extraídas de uma única aplicação JavaScript. Embora tenha sido utilizada uma aplicação real e unidades de diferentes níveis de dificuldade, os resultados não podem ser generalizados automaticamente para outros sistemas, linguagens, frameworks ou domínios.

Foram avaliados apenas três modelos e uma versão específica de cada modelo. Como serviços de LLM são atualizados ao longo do tempo, execuções futuras podem produzir resultados diferentes mesmo utilizando prompts semelhantes.

Foi utilizada somente a primeira resposta válida de cada modelo. Essa escolha favorece uma comparação controlada da geração inicial, mas não representa fluxos interativos nos quais um desenvolvedor fornece feedback e solicita correções.

O experimento utilizou um único prompt padronizado. Estratégias diferentes de prompting, inclusão de contexto adicional ou exemplos de testes poderiam alterar os resultados.

A classificação das unidades em fácil, médio e difícil foi utilizada principalmente para organização e análise descritiva. Cada grupo continha apenas dez unidades, limitando conclusões estatísticas específicas sobre o efeito da dificuldade.

A taxa de aprovação dos 841 casos Jest foi tratada de forma descritiva. Os casos individuais não foram considerados observações independentes, pois cada LLM produziu quantidades diferentes de testes e vários casos pertenciam à mesma suíte e à mesma unidade experimental.

Na análise da quantidade de casos Jest executados, erros de inicialização resultaram em valor zero para casos efetivamente executados. Esses valores representam o resultado operacional da execução e não permitem concluir que o código gerado pela LLM não continha definições de testes.

A normalização do harness foi necessária para reproduzir o ambiente da aplicação e permitir que testes armazenados fora da árvore original do backend resolvessem dependências legítimas. Embora tenham sido adotadas regras para não corrigir erros inventados pelas LLMs, essa normalização constitui uma decisão experimental que deve ser considerada ao reproduzir o estudo.

Por fim, o estudo concentrou-se principalmente em executabilidade, sucesso integral e aprovação dos casos. Métricas adicionais, como cobertura de código, cobertura de branches, mutation score e capacidade de detecção de defeitos inseridos artificialmente, não foram utilizadas. Assim, uma suíte integralmente aprovada não deve ser interpretada automaticamente como uma suíte completa ou capaz de detectar todos os defeitos possíveis.

---

## 10. Síntese da Discussão

Os resultados demonstraram que as três LLMs foram capazes de produzir suítes Jest executáveis e corretas em grande parte das unidades avaliadas. O ChatGPT apresentou o maior sucesso integral descritivo, mas a diferença entre os três modelos não atingiu significância estatística no desfecho principal.

O Claude apresentou quantidade significativamente maior de casos Jest executados, porém esse maior volume não correspondeu à maior taxa de sucesso integral ou de aprovação dos casos. Esse resultado evidencia que quantidade e correção representam dimensões distintas na avaliação de testes gerados automaticamente.

As falhas observadas estiveram associadas principalmente à interpretação do comportamento do código, configuração de mocks, tratamento de exceções, manipulação de datas e interação com dependências. Dessa forma, os resultados sustentam o uso de LLMs como ferramentas de apoio à geração de testes, mas não eliminam a necessidade de execução automatizada e revisão técnica dos artefatos produzidos.

Considerando as limitações da amostra e do protocolo, os resultados devem ser entendidos como evidências referentes às condições deste experimento, e não como uma classificação universal dos modelos avaliados.
