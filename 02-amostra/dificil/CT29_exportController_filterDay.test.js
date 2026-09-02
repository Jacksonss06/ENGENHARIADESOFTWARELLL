/** CT29 | Difícil | exportController.csvDay + filtro temporal */
jest.mock('../../hidroWebnia_API-main/src/model/Devices', () => ({ findById: jest.fn() }))
jest.mock('../../hidroWebnia_API-main/src/services/csvGenerator', () => ({ generateCsv: jest.fn() }))
jest.mock('../../hidroWebnia_API-main/src/services/pdfGenarator', () => jest.fn())
const Devices = require('../../hidroWebnia_API-main/src/model/Devices')
const { generateCsv } = require('../../hidroWebnia_API-main/src/services/csvGenerator')
const controller = require('../../hidroWebnia_API-main/src/controllers/exportController')

describe('exportController.csvDay', () => {
  test('envia ao gerador CSV apenas medições dentro do dia solicitado', async () => {
    const id = '507f1f77bcf86cd799439011'
    Devices.findById.mockResolvedValue({ measures: [
      { temperature: 20, timestamp: new Date('2026-09-02T10:00:00Z') },
      { temperature: 30, timestamp: new Date('2026-09-03T10:00:00Z') }
    ] })
    const req = { params: { deviceId: id }, query: { date: '2026-09-02' } }
    const res = { status: jest.fn(), json: jest.fn() }
    await controller.csvDay(req, res)
    expect(generateCsv).toHaveBeenCalledWith(res, id, [expect.objectContaining({ temperature: 20 })], 'dia')
  })
})
