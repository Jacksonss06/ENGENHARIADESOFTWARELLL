/** CT06 | Fácil | Timer.padTime */
const Timer = require('../../hidroWebnia_API-main/src/utils/time')

describe('Timer.padTime', () => {
  test('adiciona zero à esquerda para valores menores que dez', () => {
    const timer = new Timer()
    expect(timer.padTime(7)).toBe('07')
    expect(timer.padTime(12)).toBe(12)
  })
})
