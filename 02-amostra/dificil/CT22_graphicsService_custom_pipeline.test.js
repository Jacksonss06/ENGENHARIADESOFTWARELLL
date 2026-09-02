/** CT22 | Difícil | graphicsService.getMeasuresByCustomPeriod */
jest.mock('../../hidroWebnia_API-main/src/model/Devices', () => ({ aggregate: jest.fn() }))
const Measure = require('../../hidroWebnia_API-main/src/model/Devices')
const service = require('../../hidroWebnia_API-main/src/services/graphicsService')

describe('getMeasuresByCustomPeriod', () => {
  test('filtra intervalo, projeta campos e substitui a raiz por measures', async () => {
    Measure.aggregate.mockResolvedValue([{ humidity: 70 }])
    await service.getMeasuresByCustomPeriod('507f1f77bcf86cd799439011', '2026-09-01', '2026-09-02', 'humidity,ph')
    const pipeline = Measure.aggregate.mock.calls[0][0]
    expect(pipeline[2].$match['measures.timestamp'].$gte).toEqual(new Date('2026-09-01'))
    expect(pipeline[3].$project.measures).toMatchObject({ 'measures.humidity': 1, 'measures.ph': 1, 'measures.timestamp': 1 })
    expect(pipeline[5]).toEqual({ $replaceRoot: { newRoot: '$measures' } })
  })
})
