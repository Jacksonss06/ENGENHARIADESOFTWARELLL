const mongoose = require('mongoose')
const Measure = require('../model/Devices')
const { getTimeRange } = require('../utils/timeRange')
const graphicsService = require('./graphicsService')

jest.mock('../model/Devices', () => ({
    aggregate: jest.fn()
}))

jest.mock('../utils/timeRange', () => ({
    getTimeRange: jest.fn()
}))

describe('graphicsService', () => {
    const mockDeviceId = '507f1f77bcf86cd799439011'
    const mockObjectId = new mongoose.Types.ObjectId(mockDeviceId)

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        console.error.mockRestore()
    })

    describe('getMeasuresByPeriod', () => {
        const mockTargetDate = '2023-10-10'
        const mockPeriod = 'day'
        const mockStart = new Date('2023-10-10T00:00:00.000Z')
        const mockEnd = new Date('2023-10-10T23:59:59.999Z')

        beforeEach(() => {
            getTimeRange.mockReturnValue({ start: mockStart, end: mockEnd })
        })

        it('should execute aggregation pipeline with default fields when fields parameter is omitted', async () => {
            const mockResult = [{ temperature: 25, timestamp: mockStart }]
            Measure.aggregate.mockResolvedValueOnce(mockResult)

            const result = await graphicsService.getMeasuresByPeriod(mockDeviceId, mockPeriod, mockTargetDate)

            expect(getTimeRange).toHaveBeenCalledWith(mockPeriod, mockTargetDate)
            expect(Measure.aggregate).toHaveBeenCalledTimes(1)
            expect(Measure.aggregate).toHaveBeenCalledWith([
                { $match: { _id: mockObjectId } },
                { $unwind: "$measures" },
                { $match: { "measures.timestamp": { $gte: mockStart, $lte: mockEnd } } },
                {
                    $project: {
                        _id: 0,
                        temperature: "$measures.temperature",
                        humidity: "$measures.humidity",
                        ph: "$measures.ph",
                        uv: "$measures.uv",
                        conductivity: "$measures.conductivity",
                        timestamp: "$measures.timestamp"
                    }
                },
                { $sort: { timestamp: -1 } }
            ])
            expect(result).toEqual(mockResult)
        })

        it('should execute aggregation pipeline with custom fields when fields parameter is provided', async () => {
            const customFields = ' temperature, ph, uv '
            const mockResult = [{ temperature: 25, ph: 7, uv: 2, timestamp: mockStart }]
            Measure.aggregate.mockResolvedValueOnce(mockResult)

            const result = await graphicsService.getMeasuresByPeriod(mockDeviceId, mockPeriod, mockTargetDate, customFields)

            expect(Measure.aggregate).toHaveBeenCalledWith([
                { $match: { _id: mockObjectId } },
                { $unwind: "$measures" },
                { $match: { "measures.timestamp": { $gte: mockStart, $lte: mockEnd } } },
                {
                    $project: {
                        _id: 0,
                        temperature: "$measures.temperature",
                        ph: "$measures.ph",
                        uv: "$measures.uv",
                        timestamp: "$measures.timestamp"
                    }
                },
                { $sort: { timestamp: -1 } }
            ])
            expect(result).toEqual(mockResult)
        })

        it('should log and rethrow an error if the aggregation fails', async () => {
            const errorMessage = 'Database connection failed'
            Measure.aggregate.mockRejectedValueOnce(new Error(errorMessage))

            await expect(graphicsService.getMeasuresByPeriod(mockDeviceId, mockPeriod, mockTargetDate))
                .rejects
                .toThrow(errorMessage)

            expect(console.error).toHaveBeenCalledWith(`Error: ${errorMessage}`)
        })
    })

    describe('getMeasuresByCustomPeriod', () => {
        const mockStartDate = '2023-10-01T00:00:00Z'
        const mockEndDate = '2023-10-10T23:59:59Z'
        const start = new Date(mockStartDate)
        const end = new Date(mockEndDate)

        it('should execute aggregation pipeline with default fields when fields parameter is omitted', async () => {
            const mockResult = [{ temperature: 25, humidity: 50, timestamp: start }]
            Measure.aggregate.mockResolvedValueOnce(mockResult)

            const result = await graphicsService.getMeasuresByCustomPeriod(mockDeviceId, mockStartDate, mockEndDate)

            expect(Measure.aggregate).toHaveBeenCalledTimes(1)
            expect(Measure.aggregate).toHaveBeenCalledWith([
                { $match: { _id: mockObjectId } },
                { $unwind: "$measures" },
                { $match: { "measures.timestamp": { $gte: start, $lte: end } } },
                {
                    $project: {
                        _id: 0,
                        measures: {
                            "measures.temperature": 1,
                            "measures.humidity": 1,
                            "measures.timestamp": 1
                        }
                    }
                },
                { $sort: { "measures.timestamp": -1 } },
                { $replaceRoot: { newRoot: "$measures" } }
            ])
            expect(result).toEqual(mockResult)
        })

        it('should execute aggregation pipeline with custom fields when fields parameter is provided', async () => {
            const customFields = 'ph, conductivity '
            const mockResult = [{ ph: 7, conductivity: 1.5, timestamp: start }]
            Measure.aggregate.mockResolvedValueOnce(mockResult)

            const result = await graphicsService.getMeasuresByCustomPeriod(mockDeviceId, mockStartDate, mockEndDate, customFields)

            expect(Measure.aggregate).toHaveBeenCalledWith([
                { $match: { _id: mockObjectId } },
                { $unwind: "$measures" },
                { $match: { "measures.timestamp": { $gte: start, $lte: end } } },
                {
                    $project: {
                        _id: 0,
                        measures: {
                            "measures.ph": 1,
                            "measures.conductivity": 1,
                            "measures.timestamp": 1
                        }
                    }
                },
                { $sort: { "measures.timestamp": -1 } },
                { $replaceRoot: { newRoot: "$measures" } }
            ])
            expect(result).toEqual(mockResult)
        })

        it('should log and rethrow an error if the aggregation fails', async () => {
            const errorMessage = 'Pipeline failed'
            Measure.aggregate.mockRejectedValueOnce(new Error(errorMessage))

            await expect(graphicsService.getMeasuresByCustomPeriod(mockDeviceId, mockStartDate, mockEndDate))
                .rejects
                .toThrow(errorMessage)

            expect(console.error).toHaveBeenCalledWith(`Error: ${errorMessage}`)
        })
    })
})
