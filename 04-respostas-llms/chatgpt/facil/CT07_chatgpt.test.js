const { getTimeRange } = require('./timeRange')

describe('getTimeRange - dia', () => {
    test('retorna o início e o fim UTC do dia informado', () => {
        const result = getTimeRange('dia', '2024-05-15T14:30:45.123Z')

        expect(result.start).toEqual(new Date('2024-05-15T00:00:00.000Z'))
        expect(result.end).toEqual(new Date('2024-05-15T23:59:59.000Z'))
    })

    test('considera o dia correspondente em UTC quando a data possui deslocamento de fuso horário', () => {
        const result = getTimeRange('dia', '2024-05-15T23:30:00-03:00')

        expect(result.start.toISOString()).toBe('2024-05-16T00:00:00.000Z')
        expect(result.end.toISOString()).toBe('2024-05-16T23:59:59.000Z')
    })

    test('calcula corretamente o intervalo de um dia em ano bissexto', () => {
        const result = getTimeRange('dia', '2024-02-29T12:00:00Z')

        expect(result.start.toISOString()).toBe('2024-02-29T00:00:00.000Z')
        expect(result.end.toISOString()).toBe('2024-02-29T23:59:59.000Z')
    })

    test('usa a data atual quando targetDate não é informado', () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2025-01-10T18:45:30.000Z'))

        const result = getTimeRange('dia')

        expect(result.start.toISOString()).toBe('2025-01-10T00:00:00.000Z')
        expect(result.end.toISOString()).toBe('2025-01-10T23:59:59.000Z')

        jest.useRealTimers()
    })

    test('lança erro para uma data inválida', () => {
        expect(() => getTimeRange('dia', 'data-invalida')).toThrow('Data inválida')
    })

    test('lança erro para um período inválido', () => {
        expect(() => getTimeRange('hora', '2024-05-15T12:00:00Z')).toThrow('Período inválido')
    })
})
