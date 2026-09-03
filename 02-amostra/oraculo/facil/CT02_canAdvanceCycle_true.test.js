/** CT02 | Fácil | cycleUtils.canAdvanceCycle */
const { canAdvanceCycle } = require('../../hidroWebnia_API-main/src/utils/cycleUtils')

describe('canAdvanceCycle', () => {
  afterEach(() => jest.useRealTimers())

  test('permite avanço quando o ciclo atingiu o mínimo de 15 dias', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-02T10:00:00Z'))
    expect(canAdvanceCycle({ startDate: '2026-08-18T00:00:00Z' })).toBe(true)
  })
})
