/** CT10 | Fácil | getTimeRange - validação */
const { getTimeRange } = require('../../hidroWebnia_API-main/src/utils/timeRange')

describe('getTimeRange - entradas inválidas', () => {
  test('lança erro para período não suportado', () => {
    expect(() => getTimeRange('ano', '2026-09-02')).toThrow('Período inválido')
  })
})
