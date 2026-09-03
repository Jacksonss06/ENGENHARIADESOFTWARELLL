/** CT28 | Difícil | exportController.csvDay */
jest.mock('../../hidroWebnia_API-main/src/model/Devices', () => ({ findById: jest.fn() }))
jest.mock('../../hidroWebnia_API-main/src/services/csvGenerator', () => ({ generateCsv: jest.fn() }))
jest.mock('../../hidroWebnia_API-main/src/services/pdfGenarator', () => jest.fn())
const controller = require('../../hidroWebnia_API-main/src/controllers/exportController')

describe('exportController.csvDay', () => {
  test('retorna 400 para ObjectId inválido antes de consultar banco', async () => {
    const req = { params: { deviceId: 'id-invalido' }, query: {} }
    const json = jest.fn()
    const res = { status: jest.fn(() => ({ json })) }
    await controller.csvDay(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'ID do dispositivo inválido' })
  })
})
