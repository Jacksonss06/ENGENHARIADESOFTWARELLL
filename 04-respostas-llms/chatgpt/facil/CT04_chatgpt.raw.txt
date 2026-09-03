const { advanceCycle } = require('./cycleUtils')

describe('advanceCycle', () => {
  const now = new Date('2024-06-20T14:30:00.000Z')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('avança o ciclo e atualiza seus atributos', () => {
    const cycle = {
      currentCycle: 2,
      startDate: new Date('2024-05-01T00:00:00.000Z'),
      daysPassed: 50,
      manualAdvance: false
    }

    const result = advanceCycle(cycle)

    expect(result.currentCycle).toBe(3)
    expect(result.startDate).toEqual(now)
    expect(result.daysPassed).toBe(0)
    expect(result.manualAdvance).toBe(true)
  })

  test('altera e retorna a mesma instância recebida', () => {
    const cycle = {
      currentCycle: 1,
      startDate: new Date('2024-06-01T00:00:00.000Z'),
      daysPassed: 19,
      manualAdvance: false
    }

    const result = advanceCycle(cycle)

    expect(result).toBe(cycle)
  })

  test('preserva atributos não relacionados ao avanço do ciclo', () => {
    const cycle = {
      currentCycle: 0,
      startDate: null,
      daysPassed: -1,
      manualAdvance: false,
      id: 'cycle-123',
      status: 'active'
    }

    const result = advanceCycle(cycle)

    expect(result).toEqual({
      currentCycle: 1,
      startDate: now,
      daysPassed: 0,
      manualAdvance: true,
      id: 'cycle-123',
      status: 'active'
    })
  })

  test('sobrescreve valores anteriores de controle do ciclo', () => {
    const oldStartDate = new Date('2020-01-01T00:00:00.000Z')
    const cycle = {
      currentCycle: -1,
      startDate: oldStartDate,
      daysPassed: 999,
      manualAdvance: false
    }

    advanceCycle(cycle)

    expect(cycle.currentCycle).toBe(0)
    expect(cycle.startDate).not.toBe(oldStartDate)
    expect(cycle.startDate).toEqual(now)
    expect(cycle.daysPassed).toBe(0)
    expect(cycle.manualAdvance).toBe(true)
  })
})
