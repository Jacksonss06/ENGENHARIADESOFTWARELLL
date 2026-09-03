const { getTimeRange } = require('./timeRange')

describe('getTimeRange - mês', () => {
    test('retorna o primeiro e o último instante de um mês com 31 dias', () => {
        const result = getTimeRange('mês', '2024-01-15T12:30:45.000Z')

        expect(result).toEqual({
            start: new Date('2024-01-01T00:00:00.000Z'),
            end: new Date('2024-01-31T23:59:59.000Z')
        })
    })

    test('retorna corretamente o intervalo de fevereiro em ano bissexto', () => {
        const result = getTimeRange('mês', '2024-02-29T08:00:00.000Z')

        expect(result).toEqual({
            start: new Date('2024-02-01T00:00:00.000Z'),
            end: new Date('2024-02-29T23:59:59.000Z')
        })
    })

    test('retorna corretamente o intervalo de fevereiro em ano não bissexto', () => {
        const result = getTimeRange('mês', '2023-02-10T08:00:00.000Z')

        expect(result).toEqual({
            start: new Date('2023-02-01T00:00:00.000Z'),
            end: new Date('2023-02-28T23:59:59.000Z')
        })
    })

    test('trata corretamente dezembro sem avançar o ano do intervalo', () => {
        const result = getTimeRange('mês', '2024-12-31T23:59:59.999Z')

        expect(result).toEqual({
            start: new Date('2024-12-01T00:00:00.000Z'),
            end: new Date('2024-12-31T23:59:59.000Z')
        })
    })

    test('usa a data atual quando targetDate não é informado', () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2025-04-15T10:20:30.000Z'))

        expect(getTimeRange('mês')).toEqual({
            start: new Date('2025-04-01T00:00:00.000Z'),
            end: new Date('2025-04-30T23:59:59.000Z')
        })

        jest.useRealTimers()
    })

    test('lança erro quando a data é inválida', () => {
        expect(() => getTimeRange('mês', 'data-inválida')).toThrow('Data inválida')
    })

    test('lança erro quando o período é inválido', () => {
        expect(() => getTimeRange('mes', '2024-01-15T00:00:00.000Z')).toThrow('Período inválido')
    })
})
