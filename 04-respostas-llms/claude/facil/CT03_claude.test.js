const {
  calculateDaysPassed,
  canAdvanceCycle,
  advanceCycle
} = require('../src/utils/cycleUtils')

describe('calculateDaysPassed', () => {
  test('deve retornar 0 quando a data inicial é hoje', () => {
    const today = new Date()
    expect(calculateDaysPassed(today)).toBe(0)
  })

  test('deve retornar o número correto de dias passados para uma data no passado', () => {
    const daysAgo = 10
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - daysAgo)
    expect(calculateDaysPassed(pastDate)).toBe(daysAgo)
  })

  test('deve retornar valor negativo quando a data inicial é no futuro', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 5)
    expect(calculateDaysPassed(futureDate)).toBe(-5)
  })

  test('deve aceitar string de data como entrada', () => {
    const daysAgo = 3
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - daysAgo)
    const isoString = pastDate.toISOString()
    expect(calculateDaysPassed(isoString)).toBe(daysAgo)
  })
})

describe('canAdvanceCycle', () => {
  test('deve retornar false quando o mínimo de dias não foi atingido (padrão minDays=15)', () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 10)
    const cycle = { startDate }
    expect(canAdvanceCycle(cycle)).toBe(false)
  })

  test('deve retornar true quando o número de dias passados é igual ao mínimo padrão (15)', () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 15)
    const cycle = { startDate }
    expect(canAdvanceCycle(cycle)).toBe(true)
  })

  test('deve retornar true quando o número de dias passados é maior que o mínimo padrão', () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 20)
    const cycle = { startDate }
    expect(canAdvanceCycle(cycle)).toBe(true)
  })

  test('deve retornar false quando faltar exatamente 1 dia para o mínimo', () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 14)
    const cycle = { startDate }
    expect(canAdvanceCycle(cycle)).toBe(false)
  })

  test('deve respeitar um valor customizado de minDays', () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 5)
    const cycle = { startDate }
    expect(canAdvanceCycle(cycle, 5)).toBe(true)
    expect(canAdvanceCycle(cycle, 6)).toBe(false)
  })

  test('deve retornar false quando o ciclo começou hoje e minDays é maior que 0', () => {
    const cycle = { startDate: new Date() }
    expect(canAdvanceCycle(cycle, 1)).toBe(false)
  })

  test('deve retornar true quando minDays é 0, independente da data inicial', () => {
    const cycle = { startDate: new Date() }
    expect(canAdvanceCycle(cycle, 0)).toBe(true)
  })
})

describe('advanceCycle', () => {
  test('deve incrementar currentCycle em 1', () => {
    const cycle = { currentCycle: 2, startDate: new Date('2020-01-01'), daysPassed: 30, manualAdvance: false }
    const result = advanceCycle(cycle)
    expect(result.currentCycle).toBe(3)
  })

  test('deve resetar daysPassed para 0', () => {
    const cycle = { currentCycle: 1, startDate: new Date('2020-01-01'), daysPassed: 20 }
    const result = advanceCycle(cycle)
    expect(result.daysPassed).toBe(0)
  })

  test('deve definir manualAdvance como true', () => {
    const cycle = { currentCycle: 1, startDate: new Date('2020-01-01'), daysPassed: 20, manualAdvance: false }
    const result = advanceCycle(cycle)
    expect(result.manualAdvance).toBe(true)
  })

  test('deve atualizar startDate para a data atual', () => {
    const cycle = { currentCycle: 1, startDate: new Date('2020-01-01'), daysPassed: 20 }
    const before = new Date()
    const result = advanceCycle(cycle)
    const after = new Date()
    expect(result.startDate.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(result.startDate.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  test('deve retornar o mesmo objeto de ciclo (mutação in-place)', () => {
    const cycle = { currentCycle: 1, startDate: new Date('2020-01-01'), daysPassed: 20 }
    const result = advanceCycle(cycle)
    expect(result).toBe(cycle)
  })
})
