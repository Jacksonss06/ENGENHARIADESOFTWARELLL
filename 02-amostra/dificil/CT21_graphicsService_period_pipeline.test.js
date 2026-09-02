/** CT21 | Difícil | graphicsService.getMeasuresByPeriod */
jest.mock('../../hidroWebnia_API-main/src/model/Devices', () => ({ aggregate: jest.fn() }))
jest.mock('../../hidroWebnia_API-main/src/utils/timeRange', () => ({
  getTimeRange: jest.fn(() => ({ start: new Date('2026-09-02T00:00:00Z'), end: new Date('2026-09-02T23:59:59Z') }))
}))
const Measure = require('../../hidroWebnia_API-main/src/model/Devices')
const service = require('../../hidroWebnia_API-main/src/services/graphicsService')

describe('getMeasuresByPeriod', () => {
  test('monta pipeline com projeção customizada e ordenação decrescente', async () => {
    Measure.aggregate.mockResolvedValue([{ temperature: 25 }])
    const result = await service.getMeasuresByPeriod('507f1f77bcf86cd799439011', 'dia', '2026-09-02', 'temperature, ph')
    expect(result).toEqual([{ temperature: 25 }])
    const pipeline = Measure.aggregate.mock.calls[0][0]
    expect(pipeline[1]).toEqual({ $unwind: '$measures' })
    expect(pipeline[3].$project).toMatchObject({ _id: 0, temperature: '$measures.temperature', ph: '$measures.ph', timestamp: '$measures.timestamp' })
    expect(pipeline[4]).toEqual({ $sort: { timestamp: -1 } })
  })
})
