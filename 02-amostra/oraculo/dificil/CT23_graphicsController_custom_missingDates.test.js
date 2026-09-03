/** CT23 | Difícil | graphicsController.getCustomPeriodMeasures */
jest.mock('../../hidroWebnia_API-main/src/services/graphicsService', () => ({ getMeasuresByCustomPeriod: jest.fn() }))
const controller = require('../../hidroWebnia_API-main/src/controllers/graphicsController')

describe('getCustomPeriodMeasures', () => {
  test('retorna 400 sem startDate ou endDate e não chama serviço', async () => {
    const req = { params: { id: 'd1' }, query: { startDate: '2026-09-01' } }
    const json = jest.fn()
    const res = { status: jest.fn(() => ({ json })) }
    await controller.getCustomPeriodMeasures(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'startDate e endDate são obrigatórios' })
  })
})
