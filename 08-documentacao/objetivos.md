# Objetivos

## 1. Objetivo Geral

Avaliar comparativamente a capacidade de três Modelos de Linguagem de Grande Porte (Large Language Models — LLMs), ChatGPT, Claude e Gemini, na geração automatizada de testes em Jest para unidades de código JavaScript pertencentes a uma aplicação real, considerando a executabilidade e o sucesso das suítes produzidas sob um protocolo experimental padronizado.

## 2. Objetivos Específicos

- Selecionar 30 unidades de código JavaScript de uma aplicação real e organizá-las em níveis de dificuldade fácil, médio e difícil.

- Submeter as mesmas unidades experimentais ao ChatGPT, Claude e Gemini utilizando um prompt padronizado e condições controladas de geração.

- Preservar a primeira resposta válida produzida por cada LLM, sem correção, refinamento ou alteração manual das suítes geradas antes da avaliação.

- Executar automaticamente as suítes de testes produzidas pelas LLMs em ambiente Jest configurado para reproduzir as dependências necessárias da aplicação original.

- Validar previamente as unidades selecionadas e o ambiente experimental por meio de um conjunto independente de testes de referência utilizado como oráculo.

- Mensurar a executabilidade das suítes, o sucesso integral, a quantidade de casos Jest executados e a taxa de aprovação dos casos de teste.

- Comparar descritivamente o desempenho das três LLMs no conjunto total de unidades e nos diferentes níveis de dificuldade.

- Aplicar métodos estatísticos adequados ao desenho pareado do experimento para investigar diferenças entre os modelos quanto ao sucesso integral das suítes e à quantidade de casos Jest executados.

- Identificar e analisar os principais tipos de falha observados nos testes gerados, incluindo divergências de expectativas, problemas relacionados a mocks, dependências, tratamento de exceções e manipulação de dados.

- Discutir as possibilidades, limitações e implicações do uso de LLMs como ferramentas de apoio à geração automatizada de testes de software.
