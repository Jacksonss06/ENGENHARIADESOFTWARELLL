const { getTimeRange } = require('./timeRange')

describe('getTimeRange - semana', () => {
    test.each([
        [
            'uma quarta-feira',
            '2024-05-15T12:30:00.000Z',
            '2024-05-13T00:00:00.000Z',
            '2024-05-19T23:59:59.000Z'
        ],
        [
            'uma segunda-feira',
            '2024-05-13T00:00:00.000Z',
            '2024-05-13T00:00:00.000Z',
            '2024-05-19T23:59:59.000Z'
        ],
        [
            'um domingo',
            '2024-05-19T23:59:59.000Z',
            '2024-05-13T00:00:00.000Z',
            '2024-05-19T23:59:59.000Z'
        ],
        [
            'uma semana que atravessa a mudança de mês',
            '2024-05-01T10:00:00.000Z',
            '2024-04-29T00:00:00.000Z',
            '2024-05-05T23:59:59.000Z'
        ],
        [
            'uma semana que atravessa a mudança de ano',
            '2025-01-01T10:00:00.000Z',
            '2024-12-30T00:00:00.000Z',
            '2025-01-05T23:59:59.000Z'
        ]
    ])(
        'retorna o intervalo de segunda-feira a domingo para %s',
        (_, targetDate, expectedStart, expectedEnd) => {
            const result = getTimeRange('semana', targetDate)

            expect(result.start).toBeInstanceOf(Date)
            expect(result.end).toBeInstanceOf(Date)
            expect(result.start.toISOString()).toBe(expectedStart)
            expect(result.end.toISOString()).toBe(expectedEnd)
        }
    )

    test('usa a data atual quando targetDate não é informado', () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-05-16T18:45:00.000Z'))

        const result = getTimeRange('semana')

        expect(result.start.toISOString()).toBe('2024-05-13T00:00:00.000Z')
        expect(result.end.toISOString()).toBe('2024-05-19T23:59:59.000Z')

        jest.useRealTimers()
    })

    test('lança erro quando a data é inválida', () => {
        expect(() => getTimeRange('semana', 'data-inválida')).toThrow('Data inválida')
    })

    test('lança erro quando o período é inválido', () => {
        expect(() => getTimeRange('ano', '2024-05-15T12:00:00.000Z')).toThrow(
            'Período inválido'
        )
    })
})
