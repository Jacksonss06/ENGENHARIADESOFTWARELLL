/** CT05 | Fácil | Timer.formatTime */
const Timer = require('../../hidroWebnia_API-main/src/utils/time')

describe('Timer.formatTime', () => {
  test('formata segundos em HH:MM:SS', () => {
    const timer = new Timer()
    expect(timer.formatTime(3661)).toBe('01:01:01')
  })
})
