const Timer = require('../src/utils/time')

describe('Timer.padTime', () => {
  let timer

  beforeEach(() => {
    timer = new Timer()
  })

  test.each([
    [0, '00'],
    [1, '01'],
    [5, '05'],
    [9, '09'],
  ])('preenche %s com zero à esquerda', (value, expected) => {
    expect(timer.padTime(value)).toBe(expected)
  })

  test.each([
    [10, 10],
    [11, 11],
    [59, 59],
  ])('não altera valores maiores ou iguais a 10: %s', (value, expected) => {
    expect(timer.padTime(value)).toBe(expected)
  })

  test('trata o limite imediatamente abaixo de 10', () => {
    expect(timer.padTime(9)).toBe('09')
  })

  test('trata o limite igual a 10', () => {
    expect(timer.padTime(10)).toBe(10)
  })
})
