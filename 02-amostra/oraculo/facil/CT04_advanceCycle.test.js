/** CT04 | Fácil | cycleUtils.advanceCycle */
const { advanceCycle } = require('../../hidroWebnia_API-main/src/utils/cycleUtils')

describe('advanceCycle', () => {
  afterEach(() => jest.useRealTimers())

  test('incrementa ciclo, zera dias e marca avanço manual', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-02T12:00:00Z'))
    const cycle = { currentCycle: 2, startDate: new Date('2026-08-01'), daysPassed: 32, manualAdvance: false }
    const result = advanceCycle(cycle)
    expect(result.currentCycle).toBe(3)
    expect(result.daysPassed).toBe(0)
    expect(result.manualAdvance).toBe(true)
    expect(result.startDate).toEqual(new Date('2026-09-02T12:00:00Z'))
  })
})
