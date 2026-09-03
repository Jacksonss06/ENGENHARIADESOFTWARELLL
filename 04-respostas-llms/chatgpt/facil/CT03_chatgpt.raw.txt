const {
  calculateDaysPassed,
  canAdvanceCycle,
  advanceCycle
} = require('../src/utils/cycleUtils')

describe('cycleUtils', () => {
  const currentDate = new Date(2024, 5, 20, 12, 0, 0)

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(currentDate)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('calculateDaysPassed', () => {
    it('calcula a quantidade de dias completos desde a data inicial', () => {
      const startDate = new Date(2024, 5, 10, 23, 59, 59)

      expect(calculateDaysPassed(startDate)).toBe(10)
    })

    it('retorna zero quando a data inicial é o dia atual', () => {
      expect(calculateDaysPassed(currentDate)).toBe(0)
    })

    it('retorna valor negativo para uma data futura', () => {
      const futureDate = new Date(2024, 5, 21, 12, 0, 0)

      expect(calculateDaysPassed(futureDate)).toBe(-1)
    })
  })

  describe('canAdvanceCycle', () => {
    it('retorna false quando o ciclo ainda não atingiu o mínimo padrão de dias', () => {
      const cycle = {
        startDate: new Date(2024, 5, 6, 12, 0, 0)
      }

      expect(canAdvanceCycle(cycle)).toBe(false)
    })

    it('retorna true quando o ciclo atinge exatamente o mínimo padrão de dias', () => {
      const cycle = {
        startDate: new Date(2024, 5, 5, 12, 0, 0)
      }

      expect(canAdvanceCycle(cycle)).toBe(true)
    })

    it('retorna true quando o ciclo ultrapassa o mínimo padrão de dias', () => {
      const cycle = {
        startDate: new Date(2024, 5, 1, 12, 0, 0)
      }

      expect(canAdvanceCycle(cycle)).toBe(true)
    })

    it('respeita um número mínimo de dias personalizado', () => {
      const cycle = {
        startDate: new Date(2024, 5, 10, 12, 0, 0)
      }

      expect(canAdvanceCycle(cycle, 11)).toBe(false)
      expect(canAdvanceCycle(cycle, 10)).toBe(true)
    })

    it('retorna false para uma data inicial inválida', () => {
      const cycle = {
        startDate: 'data-invalida'
      }

      expect(canAdvanceCycle(cycle)).toBe(false)
    })
  })

  describe('advanceCycle', () => {
    it('avança e reinicia os dados do ciclo', () => {
      const cycle = {
        currentCycle: 2,
        startDate: new Date(2024, 5, 1),
        daysPassed: 19,
        manualAdvance: false
      }

      const result = advanceCycle(cycle)

      expect(result).toBe(cycle)
      expect(result).toEqual({
        currentCycle: 3,
        startDate: currentDate,
        daysPassed: 0,
        manualAdvance: true
      })
    })
  })
})
