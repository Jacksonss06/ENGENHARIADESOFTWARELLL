const mongoose = require('mongoose');
const Measure = require('../model/Devices');
const { getTimeRange } = require('../utils/timeRange');
const { getMeasuresByPeriod, getMeasuresByCustomPeriod } = require('./graphicsService');

jest.mock('../model/Devices', () => ({
    aggregate: jest.fn()
}));

jest.mock('../utils/timeRange', () => ({
    getTimeRange: jest.fn()
}));

describe('graphicsService', () => {
    let consoleSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('getMeasuresByCustomPeriod', () => {
        const deviceId = new mongoose.Types.ObjectId().toString();
        const startDate = '2023-10-01T00:00:00Z';
        const endDate = '2023-10-31T23:59:59Z';

        it('should return aggregated measures with default fields when no fields are provided', async () => {
            const mockResult = [{ temperature: 25, humidity: 60, timestamp: new Date(startDate) }];
            Measure.aggregate.mockResolvedValue(mockResult);

            const result = await getMeasuresByCustomPeriod(deviceId, startDate, endDate);

            expect(result).toEqual(mockResult);
            expect(Measure.aggregate).toHaveBeenCalledTimes(1);

            const pipeline = Measure.aggregate.mock.calls[0][0];
            expect(pipeline[0].$match._id.toString()).toBe(deviceId);
            expect(pipeline[1]).toEqual({ $unwind: "$measures" });
            expect(pipeline[2]).toEqual({
                $match: {
                    "measures.timestamp": {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            });
            expect(pipeline[3]).toEqual({
                $project: {
                    _id: 0,
                    measures: {
                        "measures.temperature": 1,
                        "measures.humidity": 1,
                        "measures.timestamp": 1
                    }
                }
            });
            expect(pipeline[4]).toEqual({ $sort: { "measures.timestamp": -1 } });
            expect(pipeline[5]).toEqual({ $replaceRoot: { newRoot: "$measures" } });
        });

        it('should return aggregated measures with custom projected fields correctly trimmed', async () => {
            const mockResult = [{ ph: 7.2, uv: 3, timestamp: new Date(startDate) }];
            Measure.aggregate.mockResolvedValue(mockResult);
            
            const fields = ' ph, uv ';
            const result = await getMeasuresByCustomPeriod(deviceId, startDate, endDate, fields);

            expect(result).toEqual(mockResult);
            
            const pipeline = Measure.aggregate.mock.calls[0][0];
            expect(pipeline[3]).toEqual({
                $project: {
                    _id: 0,
                    measures: {
                        "measures.ph": 1,
                        "measures.uv": 1,
                        "measures.timestamp": 1
                    }
                }
            });
        });

        it('should log and throw an error when the aggregation pipeline fails', async () => {
            const errorMessage = 'Database timeout';
            Measure.aggregate.mockRejectedValue(new Error(errorMessage));

            await expect(getMeasuresByCustomPeriod(deviceId, startDate, endDate)).rejects.toThrow(errorMessage);
            expect(consoleSpy).toHaveBeenCalledWith(`Error: ${errorMessage}`);
        });
    });

    describe('getMeasuresByPeriod', () => {
        const deviceId = new mongoose.Types.ObjectId().toString();
        const period = 'weekly';
        const targetDate = '2023-10-15T00:00:00Z';
        const mockTimeRange = {
            start: new Date('2023-10-08T00:00:00Z'),
            end: new Date('2023-10-15T23:59:59Z')
        };

        beforeEach(() => {
            getTimeRange.mockReturnValue(mockTimeRange);
        });

        it('should return aggregated measures for a predefined period with default fields', async () => {
            const mockResult = [{ temperature: 22, timestamp: mockTimeRange.start }];
            Measure.aggregate.mockResolvedValue(mockResult);

            const result = await getMeasuresByPeriod(deviceId, period, targetDate);

            expect(result).toEqual(mockResult);
            expect(getTimeRange).toHaveBeenCalledWith(period, targetDate);
            
            const pipeline = Measure.aggregate.mock.calls[0][0];
            expect(pipeline[0].$match._id.toString()).toBe(deviceId);
            expect(pipeline[2]).toEqual({
                $match: {
                    "measures.timestamp": {
                        $gte: mockTimeRange.start,
                        $lte: mockTimeRange.end
                    }
                }
            });
            expect(pipeline[3]).toEqual({
                $project: {
                    _id: 0,
                    temperature: "$measures.temperature",
                    humidity: "$measures.humidity",
                    ph: "$measures.ph",
                    uv: "$measures.uv",
                    conductivity: "$measures.conductivity",
                    timestamp: "$measures.timestamp"
                }
            });
        });

        it('should return aggregated measures for a predefined period with custom fields', async () => {
            const mockResult = [{ conductivity: 1.5, timestamp: mockTimeRange.start }];
            Measure.aggregate.mockResolvedValue(mockResult);

            const fields = 'conductivity, uv';
            const result = await getMeasuresByPeriod(deviceId, period, targetDate, fields);

            expect(result).toEqual(mockResult);
            const pipeline = Measure.aggregate.mock.calls[0][0];
            expect(pipeline[3]).toEqual({
                $project: {
                    _id: 0,
                    conductivity: "$measures.conductivity",
                    uv: "$measures.uv",
                    timestamp: "$measures.timestamp"
                }
            });
        });

        it('should log and throw an error when the aggregation pipeline fails in predefined period', async () => {
            const errorMessage = 'Invalid device ID format';
            Measure.aggregate.mockRejectedValue(new Error(errorMessage));

            await expect(getMeasuresByPeriod(deviceId, period, targetDate)).rejects.toThrow(errorMessage);
            expect(consoleSpy).toHaveBeenCalledWith(`Error: ${errorMessage}`);
        });
    });
});
