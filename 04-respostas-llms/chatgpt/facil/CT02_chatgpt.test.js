const { canAdvanceCycle } = require('../src/utils/cycleUtils')

describe('canAdvanceCycle', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2024, 0, 16, 12, 0, 0))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('retorna true quando o ciclo atingiu exatamente o mínimo padrão de 15 dias', () => {
    const cycle = {
      startDate: new Date(2024, 0, 1, 23, 59, 59)
    }

    expect(canAdvanceCycle(cycle)).toBe(true)
  })

  test('retorna true quando o ciclo ultrapassou o mínimo de dias', () => {
    const cycle = {
      startDate: new Date(2023, 11, 31)
    }

    expect(canAdvanceCycle(cycle)).toBe(true)
  })

  test('retorna false quando o ciclo ainda não atingiu o mínimo de dias', () => {
    const cycle = {
      startDate: new Date(2024, 0, 2)
    }

    expect(canAdvanceCycle(cycle)).toBe(false)
  })

  test('considera um número mínimo de dias personalizado', () => {
    const cycle = {
      startDate: new Date(2024, 0, 6)
    }

    expect(canAdvanceCycle(cycle, 10)).toBe(true)
    expect(canAdvanceCycle(cycle, 11)).toBe(false)
  })

  test('retorna true para ciclo iniciado no dia atual quando o mínimo é zero', () => {
    const cycle = {
      startDate: new Date(2024, 0, 16, 23, 59, 59)
    }

    expect(canAdvanceCycle(cycle, 0)).toBe(true)
  })

  test('ignora o horário e compara dias de calendário', () => {
    const cycle = {
      startDate: new Date(2024, 0, 1, 23, 59, 59)
    }

    expect(canAdvanceCycle(cycle, 15)).toBe(true)
  })
})
