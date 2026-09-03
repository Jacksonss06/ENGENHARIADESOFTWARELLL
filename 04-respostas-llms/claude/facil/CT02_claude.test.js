const {
  calculateDaysPassed,
  canAdvanceCycle,
  advanceCycle
} = require('../src/utils/cycleUtils')

describe('cycleUtils', () => {
  describe('calculateDaysPassed', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-20T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('deve calcular corretamente o número de dias passados', () => {
      const startDate = '2024-01-10T00:00:00Z'
      const result = calculateDaysPassed(startDate)
      expect(result).toBe(10)
    })

    test('deve retornar 0 quando a data de início é hoje', () => {
      const startDate = '2024-01-20T00:00:00Z'
      const result = calculateDaysPassed(startDate)
      expect(result).toBe(0)
    })

    test('deve retornar valor negativo quando a data de início é futura', () => {
      const startDate = '2024-01-25T00:00:00Z'
      const result = calculateDaysPassed(startDate)
      expect(result).toBe(-5)
    })

    test('deve ignorar horas, minutos e segundos ao calcular a diferença', () => {
      const startDate = '2024-01-10T23:59:59Z'
      const result = calculateDaysPassed(startDate)
      expect(result).toBe(10)
    })
  })

  describe('canAdvanceCycle', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-20T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('deve retornar true quando os dias passados são exatamente iguais ao mínimo padrão (15)', () => {
      const cycle = { startDate: '2024-01-05T00:00:00Z' }
      const result = canAdvanceCycle(cycle)
      expect(result).toBe(true)
    })

    test('deve retornar true quando os dias passados excedem o mínimo padrão (15)', () => {
      const cycle = { startDate: '2024-01-01T00:00:00Z' }
      const result = canAdvanceCycle(cycle)
      expect(result).toBe(true)
    })

    test('deve retornar false quando os dias passados são menores que o mínimo padrão (15)', () => {
      const cycle = { startDate: '2024-01-10T00:00:00Z' }
      const result = canAdvanceCycle(cycle)
      expect(result).toBe(false)
    })

    test('deve retornar true quando os dias passados são exatamente iguais ao mínimo customizado', () => {
      const cycle = { startDate: '2024-01-15T00:00:00Z' }
      const result = canAdvanceCycle(cycle, 5)
      expect(result).toBe(true)
    })

    test('deve retornar false quando os dias passados são menores que o mínimo customizado', () => {
      const cycle = { startDate: '2024-01-18T00:00:00Z' }
      const result = canAdvanceCycle(cycle, 5)
      expect(result).toBe(false)
    })

    test('deve retornar true quando minDays é 0', () => {
      const cycle = { startDate: '2024-01-20T00:00:00Z' }
      const result = canAdvanceCycle(cycle, 0)
      expect(result).toBe(true)
    })

    test('deve retornar false quando a data de início é futura', () => {
      const cycle = { startDate: '2024-01-25T00:00:00Z' }
      const result = canAdvanceCycle(cycle)
      expect(result).toBe(false)
    })
  })

  describe('advanceCycle', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-20T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('deve incrementar currentCycle em 1', () => {
      const cycle = { currentCycle: 1, startDate: '2024-01-01T00:00:00Z' }
      const result = advanceCycle(cycle)
      expect(result.currentCycle).toBe(2)
    })

    test('deve atualizar startDate para a data atual', () => {
      const cycle = { currentCycle: 1, startDate: '2024-01-01T00:00:00Z' }
      const result = advanceCycle(cycle)
      expect(result.startDate).toEqual(new Date('2024-01-20T12:00:00Z'))
    })

    test('deve resetar daysPassed para 0', () => {
      const cycle = { currentCycle: 1, startDate: '2024-01-01T00:00:00Z', daysPassed: 20 }
      const result = advanceCycle(cycle)
      expect(result.daysPassed).toBe(0)
    })

    test('deve marcar manualAdvance como true', () => {
      const cycle = { currentCycle: 1, startDate: '2024-01-01T00:00:00Z' }
      const result = advanceCycle(cycle)
      expect(result.manualAdvance).toBe(true)
    })

    test('deve retornar o mesmo objeto de ciclo mutado', () => {
      const cycle = { currentCycle: 3, startDate: '2024-01-01T00:00:00Z' }
      const result = advanceCycle(cycle)
      expect(result).toBe(cycle)
    })

    test('deve funcionar corretamente quando currentCycle é 0', () => {
      const cycle = { currentCycle: 0, startDate: '2024-01-01T00:00:00Z' }
      const result = advanceCycle(cycle)
      expect(result.currentCycle).toBe(1)
    })
  })
})
