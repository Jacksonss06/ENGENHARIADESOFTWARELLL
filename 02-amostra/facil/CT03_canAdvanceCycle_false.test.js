/** CT03 | Fácil | cycleUtils.canAdvanceCycle */
const { canAdvanceCycle } = require('../../hidroWebnia_API-main/src/utils/cycleUtils')

describe('canAdvanceCycle', () => {
  afterEach(() => jest.useRealTimers())

  test('bloqueia avanço antes do número mínimo de dias', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-02T10:00:00Z'))
    expect(canAdvanceCycle({ startDate: '2026-08-25T00:00:00Z' }, 15)).toBe(false)
  })
})
