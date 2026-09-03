describe('getTimerForDevice', () => {
    let Timer
    let getTimerForDevice

    beforeEach(() => {
        jest.resetModules()

        jest.doMock('./time', () =>
            jest.fn().mockImplementation(function TimerMock(duration) {
                this.duration = duration
            })
        )

        Timer = require('./time')
        ;({ getTimerForDevice } = require('./timeManager'))
    })

    afterEach(() => {
        jest.clearAllMocks()
        jest.dontMock('./time')
    })

    test('cria um Timer de uma hora para um novo dispositivo', () => {
        const timer = getTimerForDevice('device-1')

        expect(Timer).toHaveBeenCalledTimes(1)
        expect(Timer).toHaveBeenCalledWith(3600 * 1000)
        expect(timer).toBeInstanceOf(Timer)
        expect(timer.duration).toBe(3600 * 1000)
    })

    test('reutiliza o mesmo Timer para o mesmo identificador de dispositivo', () => {
        const firstTimer = getTimerForDevice('device-2')
        const secondTimer = getTimerForDevice('device-2')

        expect(secondTimer).toBe(firstTimer)
        expect(Timer).toHaveBeenCalledTimes(1)
    })

    test('cria Timers distintos para dispositivos diferentes', () => {
        const firstTimer = getTimerForDevice('device-3')
        const secondTimer = getTimerForDevice('device-4')

        expect(firstTimer).not.toBe(secondTimer)
        expect(Timer).toHaveBeenCalledTimes(2)
        expect(Timer).toHaveBeenNthCalledWith(1, 3600 * 1000)
        expect(Timer).toHaveBeenNthCalledWith(2, 3600 * 1000)
    })

    test('mantém identificadores numéricos distintos armazenados separadamente', () => {
        const firstTimer = getTimerForDevice(1)
        const secondTimer = getTimerForDevice(2)
        const repeatedTimer = getTimerForDevice(1)

        expect(repeatedTimer).toBe(firstTimer)
        expect(secondTimer).not.toBe(firstTimer)
        expect(Timer).toHaveBeenCalledTimes(2)
    })
})
