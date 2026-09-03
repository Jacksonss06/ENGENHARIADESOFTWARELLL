const { getTimeRange } = require('./timeRange')

describe('getTimeRange', () => {
    test.each([
        undefined,
        null,
        '',
        'ano',
        'Dia',
        'mes',
        ' mês ',
        0,
        {},
    ])('lança erro para período não suportado: %p', (period) => {
        expect(() => getTimeRange(period, '2024-06-15T12:00:00.000Z'))
            .toThrow('Período inválido')
    })

    test('prioriza o erro de data inválida antes de validar o período', () => {
        expect(() => getTimeRange('ano', 'data-inválida'))
            .toThrow('Data inválida')
    })

    test('retorna o intervalo UTC do dia', () => {
        expect(getTimeRange('dia', '2024-06-15T12:30:45.000Z')).toEqual({
            start: new Date('2024-06-15T00:00:00.000Z'),
            end: new Date('2024-06-15T23:59:59.000Z'),
        })
    })

    test('retorna o intervalo UTC da semana, de segunda a domingo', () => {
        expect(getTimeRange('semana', '2024-06-16T12:00:00.000Z')).toEqual({
            start: new Date('2024-06-10T00:00:00.000Z'),
            end: new Date('2024-06-16T23:59:59.000Z'),
        })
    })

    test('retorna o intervalo UTC do mês', () => {
        expect(getTimeRange('mês', '2024-02-15T12:00:00.000Z')).toEqual({
            start: new Date('2024-02-01T00:00:00.000Z'),
            end: new Date('2024-02-29T23:59:59.000Z'),
        })
    })
})
