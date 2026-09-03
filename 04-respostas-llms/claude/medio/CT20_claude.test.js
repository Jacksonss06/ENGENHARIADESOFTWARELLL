jest.mock('./time', () => {
  return jest.fn().mockImplementation((ms) => {
    return { ms, id: Math.random() }
  })
})

const Timer = require('./time')

describe('getTimerForDevice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  test('deve criar um novo Timer quando o deviceId não existir ainda', () => {
    const { getTimerForDevice } = require('./timeManager')
    const timer = getTimerForDevice('device1')

    expect(Timer).toHaveBeenCalledTimes(1)
    expect(Timer).toHaveBeenCalledWith(3600 * 1000)
    expect(timer).toBeDefined()
  })

  test('deve reutilizar o mesmo Timer para o mesmo deviceId', () => {
    const { getTimerForDevice } = require('./timeManager')
    const timer1 = getTimerForDevice('device1')
    const timer2 = getTimerForDevice('device1')

    expect(Timer).toHaveBeenCalledTimes(1)
    expect(timer1).toBe(timer2)
  })

  test('deve criar Timers diferentes para deviceIds diferentes', () => {
    const { getTimerForDevice } = require('./timeManager')
    const timer1 = getTimerForDevice('device1')
    const timer2 = getTimerForDevice('device2')

    expect(Timer).toHaveBeenCalledTimes(2)
    expect(timer1).not.toBe(timer2)
  })

  test('deve manter o cache entre múltiplas chamadas com deviceIds distintos e repetidos', () => {
    const { getTimerForDevice } = require('./timeManager')
    const timerA1 = getTimerForDevice('deviceA')
    const timerB1 = getTimerForDevice('deviceB')
    const timerA2 = getTimerForDevice('deviceA')
    const timerB2 = getTimerForDevice('deviceB')

    expect(Timer).toHaveBeenCalledTimes(2)
    expect(timerA1).toBe(timerA2)
    expect(timerB1).toBe(timerB2)
    expect(timerA1).not.toBe(timerB1)
  })

  test('deve lidar com deviceId undefined criando um Timer para essa chave', () => {
    const { getTimerForDevice } = require('./timeManager')
    const timer1 = getTimerForDevice(undefined)
    const timer2 = getTimerForDevice(undefined)

    expect(Timer).toHaveBeenCalledTimes(1)
    expect(timer1).toBe(timer2)
  })

  test('deve lidar com deviceId numérico e string separadamente', () => {
    const { getTimerForDevice } = require('./timeManager')
    const timerNum = getTimerForDevice(123)
    const timerStr = getTimerForDevice('123')

    expect(Timer).toHaveBeenCalledTimes(2)
    expect(timerNum).not.toBe(timerStr)
  })

  test('deve chamar o construtor Timer sempre com o mesmo valor de tempo (3600000 ms)', () => {
    const { getTimerForDevice } = require('./timeManager')
    getTimerForDevice('deviceX')
    getTimerForDevice('deviceY')

    expect(Timer).toHaveBeenNthCalledWith(1, 3600000)
    expect(Timer).toHaveBeenNthCalledWith(2, 3600000)
  })
})
