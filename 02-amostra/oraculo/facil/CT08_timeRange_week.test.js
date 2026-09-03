/** CT08 | Fácil | getTimeRange(semana) */
const { getTimeRange } = require('../../hidroWebnia_API-main/src/utils/timeRange')

describe('getTimeRange - semana', () => {
  test('considera semana de segunda a domingo', () => {
    const { start, end } = getTimeRange('semana', '2026-09-02T14:30:00Z')
    expect(start.toISOString()).toBe('2026-08-31T00:00:00.000Z')
    expect(end.toISOString()).toBe('2026-09-06T23:59:59.000Z')
  })
})
