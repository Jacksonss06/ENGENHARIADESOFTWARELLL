const mockAggregate = jest.fn()
const mockObjectId = jest.fn()
const mockGetTimeRange = jest.fn()

jest.mock('../model/Devices', () => ({
    aggregate: mockAggregate
}))

jest.mock('mongoose', () => ({
    Types: {
        ObjectId: mockObjectId
    }
}))

jest.mock('../utils/timeRange', () => ({
    getTimeRange: mockGetTimeRange
}))

const { getMeasuresByCustomPeriod } = require('./graphicsService')

describe('getMeasuresByCustomPeriod', () => {
    let consoleErrorSpy

    beforeEach(() => {
        jest.clearAllMocks()
        mockObjectId.mockImplementation(value => ({
            value,
            _bsontype: 'ObjectId'
        }))
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        consoleErrorSpy.mockRestore()
    })

    test('agrega medidas no período informado com os campos personalizados', async () => {
        const aggregateResult = [
            {
                temperature: 25,
                ph: 7,
                timestamp: new Date('2024-01-15T12:00:00.000Z')
            }
        ]
        mockAggregate.mockResolvedValue(aggregateResult)

        const result = await getMeasuresByCustomPeriod(
            '507f1f77bcf86cd799439011',
            '2024-01-01T00:00:00.000Z',
            '2024-01-31T23:59:59.999Z',
            ' temperature, ph '
        )

        expect(mockObjectId).toHaveBeenCalledTimes(1)
        expect(mockObjectId).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
        expect(mockAggregate).toHaveBeenCalledTimes(1)
        expect(mockAggregate).toHaveBeenCalledWith([
            {
                $match: {
                    _id: {
                        value: '507f1f77bcf86cd799439011',
                        _bsontype: 'ObjectId'
                    }
                }
            },
            { $unwind: '$measures' },
            {
                $match: {
                    'measures.timestamp': {
                        $gte: new Date('2024-01-01T00:00:00.000Z'),
                        $lte: new Date('2024-01-31T23:59:59.999Z')
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    measures: {
                        'measures.temperature': 1,
                        'measures.ph': 1,
                        'measures.timestamp': 1
                    }
                }
            },
            { $sort: { 'measures.timestamp': -1 } },
            { $replaceRoot: { newRoot: '$measures' } }
        ])
        expect(result).toBe(aggregateResult)
    })

    test.each([undefined, null, ''])(
        'utiliza temperatura e umidade como projeção padrão quando fields é %p',
        async fields => {
            mockAggregate.mockResolvedValue([])

            const result = await getMeasuresByCustomPeriod(
                '507f191e810c19729de860ea',
                '2024-02-01',
                '2024-02-29',
                fields
            )

            const pipeline = mockAggregate.mock.calls[0][0]

            expect(pipeline[3]).toEqual({
                $project: {
                    _id: 0,
                    measures: {
                        'measures.temperature': 1,
                        'measures.humidity': 1,
                        'measures.timestamp': 1
                    }
                }
            })
            expect(pipeline[4]).toEqual({
                $sort: { 'measures.timestamp': -1 }
            })
            expect(pipeline[5]).toEqual({
                $replaceRoot: { newRoot: '$measures' }
            })
            expect(result).toEqual([])
        }
    )

    test('converte as datas de início e fim em objetos Date', async () => {
        mockAggregate.mockResolvedValue([])

        await getMeasuresByCustomPeriod(
            '507f1f77bcf86cd799439011',
            '2024-03-10T08:30:00.000Z',
            '2024-03-11T18:45:00.000Z',
            'humidity'
        )

        const pipeline = mockAggregate.mock.calls[0][0]
        const range = pipeline[2].$match['measures.timestamp']

        expect(range.$gte).toBeInstanceOf(Date)
        expect(range.$lte).toBeInstanceOf(Date)
        expect(range.$gte.toISOString()).toBe('2024-03-10T08:30:00.000Z')
        expect(range.$lte.toISOString()).toBe('2024-03-11T18:45:00.000Z')
    })

    test('propaga erros da agregação e registra a mensagem', async () => {
        const error = new Error('Falha ao agregar medidas')
        mockAggregate.mockRejectedValue(error)

        await expect(
            getMeasuresByCustomPeriod(
                '507f1f77bcf86cd799439011',
                '2024-01-01',
                '2024-01-31',
                'temperature'
            )
        ).rejects.toBe(error)

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error: Falha ao agregar medidas'
        )
    })

    test('propaga erro ao criar o ObjectId sem executar a agregação', async () => {
        const error = new Error('Identificador inválido')
        mockObjectId.mockImplementation(() => {
            throw error
        })

        await expect(
            getMeasuresByCustomPeriod(
                'invalid-id',
                '2024-01-01',
                '2024-01-31',
                'temperature'
            )
        ).rejects.toBe(error)

        expect(mockAggregate).not.toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error: Identificador inválido'
        )
    })
})
