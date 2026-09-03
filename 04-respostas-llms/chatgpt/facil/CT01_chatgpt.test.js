const { calculateDaysPassed } = require('./cycleUtils')

describe('calculateDaysPassed', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2024, 0, 15, 12, 30))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('retorna zero quando a data inicial é hoje', () => {
    expect(calculateDaysPassed(new Date(2024, 0, 15, 0, 1))).toBe(0)
  })

  test('calcula os dias transcorridos ignorando os horários', () => {
    expect(calculateDaysPassed(new Date(2024, 0, 5, 23, 59, 59))).toBe(10)
  })

  test('calcula corretamente dias entre anos diferentes', () => {
    expect(calculateDaysPassed(new Date(2023, 11, 31, 10))).toBe(15)
  })

  test('retorna valor negativo para uma data futura', () => {
    expect(calculateDaysPassed(new Date(2024, 0, 18, 8))).toBe(-3)
  })

  test('aceita uma string de data válida', () => {
    expect(calculateDaysPassed('2024-01-10T12:00:00')).toBe(5)
  })

  test('retorna NaN para uma data inválida', () => {
    expect(calculateDaysPassed('data-invalida')).toBeNaN()
  })

  test('não altera o objeto Date recebido', () => {
    const startDate = new Date(2024, 0, 10, 18, 45, 30, 500)
    const originalTime = startDate.getTime()

    calculateDaysPassed(startDate)

    expect(startDate.getTime()).toBe(originalTime)
  })
})
