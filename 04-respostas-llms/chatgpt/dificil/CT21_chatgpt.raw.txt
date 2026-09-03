jest.mock('../model/Devices', () => ({
    aggregate: jest.fn()
}))

jest.mock('../utils/timeRange', () => ({
    getTimeRange: jest.fn()
}))

jest.mock('mongoose', () => ({
    Types: {
        ObjectId: jest.fn()
    }
}))

const Measure = require('../model/Devices')
const mongoose = require('mongoose')
const { getTimeRange } = require('../utils/timeRange')
const { getMeasuresByPeriod } = require('./graphicsService')

describe('getMeasuresByPeriod', () => {
    const deviceId = '507f1f77bcf86cd799439011'
    const targetDate = new Date('2024-05-10T12:00:00.000Z')
    const start = new Date('2024-05-10T00:00:00.000Z')
    const end = new Date('2024-05-10T23:59:59.999Z')

    beforeEach(() => {
        jest.clearAllMocks()

        mongoose.Types.ObjectId.mockImplementation(function (value) {
            return { objectId: value }
        })

        getTimeRange.mockReturnValue({ start, end })
    })

    test('monta o pipeline com os campos padrão e retorna o resultado da agregação', async () => {
        const aggregateResult = [
            {
                temperature: 25,
                humidity: 70,
                ph: 6.5,
                uv: 4,
                conductivity: 300,
                timestamp: targetDate
            }
        ]

        Measure.aggregate.mockResolvedValue(aggregateResult)

        const result = await getMeasuresByPeriod(deviceId, 'day', targetDate)

        expect(getTimeRange).toHaveBeenCalledTimes(1)
        expect(getTimeRange).toHaveBeenCalledWith('day', targetDate)
        expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(deviceId)
        expect(Measure.aggregate).toHaveBeenCalledTimes(1)
        expect(Measure.aggregate).toHaveBeenCalledWith([
            { $match: { _id: { objectId: deviceId } } },
            { $unwind: '$measures' },
            {
                $match: {
                    'measures.timestamp': {
                        $gte: start,
                        $lte: end
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    temperature: '$measures.temperature',
                    humidity: '$measures.humidity',
                    ph: '$measures.ph',
                    uv: '$measures.uv',
                    conductivity: '$measures.conductivity',
                    timestamp: '$measures.timestamp'
                }
            },
            { $sort: { timestamp: -1 } }
        ])
        expect(result).toBe(aggregateResult)
    })

    test('monta a projeção somente com os campos selecionados e remove espaços', async () => {
        Measure.aggregate.mockResolvedValue([])

        await getMeasuresByPeriod(
            deviceId,
            'month',
            targetDate,
            ' temperature, ph , uv '
        )

        expect(getTimeRange).toHaveBeenCalledWith('month', targetDate)
        expect(Measure.aggregate).toHaveBeenCalledWith([
            { $match: { _id: { objectId: deviceId } } },
            { $unwind: '$measures' },
            {
                $match: {
                    'measures.timestamp': {
                        $gte: start,
                        $lte: end
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    temperature: '$measures.temperature',
                    ph: '$measures.ph',
                    uv: '$measures.uv',
                    timestamp: '$measures.timestamp'
                }
            },
            { $sort: { timestamp: -1 } }
        ])
    })

    test('propaga erros da agregação e registra a mensagem no console', async () => {
        const error = new Error('aggregation failed')
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        Measure.aggregate.mockRejectedValue(error)

        await expect(
            getMeasuresByPeriod(deviceId, 'week', targetDate, 'humidity')
        ).rejects.toBe(error)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error: aggregation failed'
        )

        consoleErrorSpy.mockRestore()
    })

    test('propaga erros ao calcular o período sem executar a agregação', async () => {
        const error = new Error('invalid period')
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        getTimeRange.mockImplementation(() => {
            throw error
        })

        await expect(
            getMeasuresByPeriod(deviceId, 'invalid', targetDate)
        ).rejects.toBe(error)

        expect(mongoose.Types.ObjectId).not.toHaveBeenCalled()
        expect(Measure.aggregate).not.toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error: invalid period')

        consoleErrorSpy.mockRestore()
    })
})
