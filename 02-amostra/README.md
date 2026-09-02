# HidroWebnia — 30 unidades de código de casos de teste

Amostra criada a partir do código real da API HidroWebnia fornecida no projeto.

## Distribuição
- 10 casos fáceis (CT01–CT10)
- 10 casos médios (CT11–CT20)
- 10 casos difíceis (CT21–CT30)

## Critério de dificuldade
- **Fácil:** função determinística, uma dependência ou nenhuma, poucas asserções.
- **Médio:** middleware/estado simples, objetos `req/res/next`, validações e mocks pontuais.
- **Difícil:** controllers/services assíncronos, múltiplas dependências, mocks de banco/JWT, pipelines MongoDB, streams e filtros temporais.

## Framework
Os testes foram escritos para **Jest** em JavaScript/CommonJS, compatível com o estilo da API original.

## Preparação sugerida da API
Na raiz da API:

```bash
npm install --save-dev jest
```

Depois, copie esta pasta para dentro da raiz do projeto da API como `tests_ai/` ou ajuste os caminhos relativos dos `require`.

Exemplo de script no `package.json`:

```json
"scripts": {
  "test": "jest --runInBand"
}
```

## Uso experimental com LLMs
Para comparação entre ChatGPT, Claude e Gemini, mantenha constantes:
1. o mesmo código-fonte de produção;
2. o mesmo caso de teste;
3. o mesmo prompt de avaliação;
4. apenas a primeira resposta da LLM;
5. nenhum refinamento antes da coleta do resultado.

O arquivo `manifesto.csv` identifica cada unidade, dificuldade, alvo e tipo de teste.
