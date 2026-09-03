/** CT20 | Médio | timeManager */
const { getTimerForDevice } = require('../../hidroWebnia_API-main/src/utils/timeManager')

describe('getTimerForDevice', () => {
  test('reutiliza a mesma instância de Timer para o mesmo dispositivo', () => {
    const first = getTimerForDevice('device-123')
    const second = getTimerForDevice('device-123')
    const other = getTimerForDevice('device-456')
    expect(first).toBe(second)
    expect(first).not.toBe(other)
  })
})
