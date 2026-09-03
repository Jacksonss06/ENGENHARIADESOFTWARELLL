const mongoose = require('mongoose')
const Devices = require('../model/Devices')
const { getTimeRange } = require('../utils/timeRange')
const { generateCsv } = require('../services/csvGenerator')
const generatePdf = require('../services/pdfGenarator')

jest.mock('../model/Devices')
jest.mock('../utils/timeRange')
jest.mock('../services/csvGenerator')
jest.mock('../services/pdfGenarator')

const exportController = require('../controllers/exportController')

describe('exportController.csvDay', () => {
  let req, res

  beforeEach(() => {
    jest.clearAllMocks()
    req = {
      params: { deviceId: '507f1f77bcf86cd799439011' },
      query: { date: '2023-05-10' }
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  test('deve retornar 400 quando deviceId for inválido', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false)

    await exportController.csvDay(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'ID do dispositivo inválido' })
    expect(Devices.findById).not.toHaveBeenCalled()
  })

  test('deve retornar 404 quando dispositivo não for encontrado', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true)
    Devices.findById.mockResolvedValue(null)

    await exportController.csvDay(req, res)

    expect(Devices.findById).toHaveBeenCalledWith(req.params.deviceId)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Dispositivo não encontrado' })
    expect(generateCsv).not.toHaveBeenCalled()
  })

  test('deve filtrar apenas medições dentro do intervalo do dia e chamar generateCsv', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true)

    const start = new Date('2023-05-10T00:00:00.000Z')
    const end = new Date('2023-05-10T23:59:59.999Z')
    getTimeRange.mockReturnValue({ start, end })

    const measures = [
      { timestamp: '2023-05-10T05:00:00.000Z', value: 1 },
      { timestamp: '2023-05-09T23:59:00.000Z', value: 2 },
      { timestamp: '2023-05-11T00:01:00.000Z', value: 3 },
      { timestamp: '2023-05-10T23:00:00.000Z', value: 4 }
    ]

    Devices.findById.mockResolvedValue({ _id: req.params.deviceId, measures })

    await exportController.csvDay(req, res)

    expect(getTimeRange).toHaveBeenCalledWith('dia', req.query.date)
    expect(generateCsv).toHaveBeenCalledTimes(1)

    const [resArg, deviceIdArg, filteredMeasuresArg, periodArg] = generateCsv.mock.calls[0]
    expect(resArg).toBe(res)
    expect(deviceIdArg).toBe(req.params.deviceId)
    expect(periodArg).toBe('dia')
    expect(filteredMeasuresArg).toEqual([
      { timestamp: '2023-05-10T05:00:00.000Z', value: 1 },
      { timestamp: '2023-05-10T23:00:00.000Z', value: 4 }
    ])
  })

  test('deve retornar lista vazia quando dispositivo não possui measures', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true)

    getTimeRange.mockReturnValue({
      start: new Date('2023-05-10T00:00:00.000Z'),
      end: new Date('2023-05-10T23:59:59.999Z')
    })

    Devices.findById.mockResolvedValue({ _id: req.params.deviceId, measures: [] })

    await exportController.csvDay(req, res)

    expect(generateCsv).toHaveBeenCalledWith(res, req.params.deviceId, [], 'dia')
  })

  test('deve retornar lista vazia quando measures for undefined', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true)

    getTimeRange.mockReturnValue({
      start: new Date('2023-05-10T00:00:00.000Z'),
      end: new Date('2023-05-10T23:59:59.999Z')
    })

    Devices.findById.mockResolvedValue({ _id: req.params.deviceId })

    await exportController.csvDay(req, res)

    expect(generateCsv).toHaveBeenCalledWith(res, req.params.deviceId, [], 'dia')
  })

  test('deve retornar 500 quando Devices.findById lançar erro', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true)
    const errorMessage = 'Erro de conexão com o banco'
    Devices.findById.mockRejectedValue(new Error(errorMessage))

    await exportController.csvDay(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: `Erro ao exportar CSV: ${errorMessage}`
    })
  })

  test('deve retornar 500 quando getTimeRange lançar erro', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true)
    Devices.findById.mockResolvedValue({ _id: req.params.deviceId, measures: [] })

    const errorMessage = 'Período inválido'
    getTimeRange.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await exportController.csvDay(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: `Erro ao exportar CSV: ${errorMessage}`
    })
  })

  test('deve retornar 500 quando generateCsv lançar erro', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true)

    getTimeRange.mockReturnValue({
      start: new Date('2023-05-10T00:00:00.000Z'),
      end: new Date('2023-05-10T23:59:59.999Z')
    })

    Devices.findById.mockResolvedValue({
      _id: req.params.deviceId,
      measures: [{ timestamp: '2023-05-10T05:00:00.000Z', value: 1 }]
    })

    const errorMessage = 'Falha ao gerar arquivo CSV'
    generateCsv.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await exportController.csvDay(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: `Erro ao exportar CSV: ${errorMessage}`
    })
  })

  test('não deve chamar generatePdf ao executar csvDay', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true)

    getTimeRange.mockReturnValue({
      start: new Date('2023-05-10T00:00:00.000Z'),
      end: new Date('2023-05-10T23:59:59.999Z')
    })

    Devices.findById.mockResolvedValue({ _id: req.params.deviceId, measures: [] })

    await exportController.csvDay(req, res)

    expect(generatePdf).not.toHaveBeenCalled()
  })
})
