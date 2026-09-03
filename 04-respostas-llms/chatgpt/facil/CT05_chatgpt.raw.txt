const Timer = require('../src/utils/time')

describe('Timer.formatTime', () => {
    let timer

    beforeEach(() => {
        timer = new Timer()
    })

    test.each([
        [0, '00:00:00'],
        [1, '00:00:01'],
        [9, '00:00:09'],
        [59, '00:00:59'],
        [60, '00:01:00'],
        [61, '00:01:01'],
        [3599, '00:59:59'],
        [3600, '01:00:00'],
        [3661, '01:01:01'],
        [86399, '23:59:59'],
        [86400, '24:00:00'],
        [90061, '25:01:01']
    ])('converte %s segundos para %s', (seconds, expected) => {
        expect(timer.formatTime(seconds)).toBe(expected)
    })

    it('descarta frações de segundo', () => {
        expect(timer.formatTime(3661.999)).toBe('01:01:01')
    })

    it('mantém horas com mais de dois dígitos', () => {
        expect(timer.formatTime(360000)).toBe('100:00:00')
    })
})
