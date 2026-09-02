/** CT09 | Fácil | getTimeRange(mês) */
const { getTimeRange } = require('../../hidroWebnia_API-main/src/utils/timeRange')

describe('getTimeRange - mês', () => {
  test('retorna primeiro e último instante do mês', () => {
    const { start, end } = getTimeRange('mês', '2026-02-15T12:00:00Z')
    expect(start.toISOString()).toBe('2026-02-01T00:00:00.000Z')
    expect(end.toISOString()).toBe('2026-02-28T23:59:59.000Z')
  })
})
