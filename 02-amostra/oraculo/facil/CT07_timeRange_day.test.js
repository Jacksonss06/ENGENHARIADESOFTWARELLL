/** CT07 | Fácil | getTimeRange(dia) */
const { getTimeRange } = require('../../hidroWebnia_API-main/src/utils/timeRange')

describe('getTimeRange - dia', () => {
  test('retorna início e fim UTC do mesmo dia', () => {
    const { start, end } = getTimeRange('dia', '2026-09-02T14:30:00Z')
    expect(start.toISOString()).toBe('2026-09-02T00:00:00.000Z')
    expect(end.toISOString()).toBe('2026-09-02T23:59:59.000Z')
  })
})
