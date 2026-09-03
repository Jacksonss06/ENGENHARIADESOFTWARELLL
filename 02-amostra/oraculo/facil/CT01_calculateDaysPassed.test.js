/** CT01 | Fácil | cycleUtils.calculateDaysPassed */
const { calculateDaysPassed } = require('../../hidroWebnia_API-main/src/utils/cycleUtils')

describe('calculateDaysPassed', () => {
  afterEach(() => jest.useRealTimers())

  test('retorna 10 dias para uma data iniciada dez dias antes', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-02T12:00:00Z'))
    expect(calculateDaysPassed('2026-08-23T18:45:00Z')).toBe(10)
  })
})
