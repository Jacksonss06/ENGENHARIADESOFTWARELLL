cat > 08-documentacao/ambiente_experimental.md <<'EOF'
# Ambiente Experimental

## 1. Visão Geral

O experimento foi conduzido sobre unidades de código-fonte JavaScript extraídas de uma aplicação real, denominada HidroWebnia API. O ambiente experimental foi preparado para permitir a geração, execução e avaliação automatizada de casos de teste produzidos por diferentes Large Language Models (LLMs), utilizando Jest como framework de testes.

Foram avaliadas três LLMs:

- ChatGPT, utilizando o modelo `gpt-5.6-sol`;
- Claude, utilizando o modelo `claude-sonnet-5`;
- Gemini, utilizando o modelo `gemini-3.1-pro-preview`.

Cada modelo recebeu as mesmas 30 unidades de código e o mesmo prompt padronizado, resultando em 90 suítes de teste geradas.

## 2. Hardware e Sistema Operacional

A execução do experimento foi realizada em uma estação de trabalho com a seguinte configuração:

| Componente | Configuração |
|---|---|
| Sistema operacional | Microsoft Windows 11 Pro |
| Versão do sistema | 10.0.26200 |
| Build | 26200 |
| Processador | 13th Gen Intel(R) Core(TM) i5-13400 |
| Memória RAM | 15,78 GB |
| Fabricante da placa/sistema | BIOSTAR Group |
| Modelo | H610MHC 2.0 |

O Git Bash foi utilizado como terminal para execução dos comandos e scripts auxiliares.

## 3. Ambiente de Execução

As versões das principais ferramentas utilizadas na etapa final do experimento foram:

| Ferramenta | Versão |
|---|---|
| Node.js | 24.15.0 |
| Jest | 30.5.0 |

O projeto avaliado utiliza Node.js e módulos CommonJS.

As dependências originais do backend foram instaladas a partir do arquivo de lock do próprio projeto por meio do comando:

```bash
npm ci --prefix 01-projeto-base/backend/hidroWebnia_API-main