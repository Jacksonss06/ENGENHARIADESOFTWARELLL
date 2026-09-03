jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}))

jest.mock('../model/Devices', () => ({
  findById: jest.fn()
}))

jest.mock('../utils/timeRange', () => ({
  getTimeRange: jest.fn()
}))

jest.mock('../services/csvGenerator', () => ({
  generateCsv: jest.fn()
}))

jest.mock('../services/pdfGenarator', () => jest.fn())

const mongoose = require('mongoose')
const Devices = require('../model/Devices')
const { getTimeRange } = require('../utils/timeRange')
const { generateCsv } = require('../services/csvGenerator')
const generatePdf = require('../services/pdfGenarator')
const exportController = require('./exportController')

describe('exportController.csvDay', () => {
  const deviceId = '507f1f77bcf86cd799439011'
  let req
  let res
  let consoleErrorSpy

  beforeEach(() => {
    jest.clearAllMocks()

    req = {
      params: { deviceId },
      query: { date: '2024-05-15' }
    }

    res = {
      status: jest.fn(),
      json: jest.fn()
    }
    res.status.mockReturnValue(res)

    mongoose.Types.ObjectId.isValid.mockReturnValue(true)
    Devices.findById.mockResolvedValue({ measures: [] })
    getTimeRange.mockReturnValue({
      start: new Date('2024-05-15T00:00:00.000Z'),
      end: new Date('2024-05-15T23:59:59.999Z')
    })
    generateCsv.mockImplementation(() => undefined)

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('envia ao gerador CSV apenas as medições dentro do intervalo diário', async () => {
    const before = {
      timestamp: '2024-05-14T23:59:59.999Z',
      value: 1
    }
    const atStart = {
      timestamp: '2024-05-15T00:00:00.000Z',
      value: 2
    }
    const duringDay = {
      timestamp: '2024-05-15T12:30:00.000Z',
      value: 3
    }
    const atEnd = {
      timestamp: '2024-05-15T23:59:59.999Z',
      value: 4
    }
    const after = {
      timestamp: '2024-05-16T00:00:00.000Z',
      value: 5
    }
    const invalidTimestamp = {
      timestamp: 'data-inválida',
      value: 6
    }

    Devices.findById.mockResolvedValue({
      measures: [before, atStart, duringDay, atEnd, after, invalidTimestamp]
    })

    await exportController.csvDay(req, res)

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(deviceId)
    expect(Devices.findById).toHaveBeenCalledWith(deviceId)
    expect(getTimeRange).toHaveBeenCalledWith('dia', '2024-05-15')
    expect(generateCsv).toHaveBeenCalledTimes(1)
    expect(generateCsv).toHaveBeenCalledWith(
      res,
      deviceId,
      [atStart, duringDay, atEnd],
      'dia'
    )
    expect(generatePdf).not.toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('envia uma lista vazia quando o dispositivo não possui medições', async () => {
    Devices.findById.mockResolvedValue({ measures: [] })

    await exportController.csvDay(req, res)

    expect(getTimeRange).toHaveBeenCalledWith('dia', '2024-05-15')
    expect(generateCsv).toHaveBeenCalledWith(res, deviceId, [], 'dia')
  })

  it('envia uma lista vazia quando measures não está definido', async () => {
    Devices.findById.mockResolvedValue({})

    await exportController.csvDay(req, res)

    expect(generateCsv).toHaveBeenCalledWith(res, deviceId, [], 'dia')
  })

  it('repassa undefined como data ao cálculo do intervalo quando a query não contém date', async () => {
    req.query = {}

    await exportController.csvDay(req, res)

    expect(getTimeRange).toHaveBeenCalledWith('dia', undefined)
    expect(generateCsv).toHaveBeenCalledWith(res, deviceId, [], 'dia')
  })

  it('retorna 400 quando o ID do dispositivo é inválido', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false)

    await exportController.csvDay(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'ID do dispositivo inválido'
    })
    expect(Devices.findById).not.toHaveBeenCalled()
    expect(getTimeRange).not.toHaveBeenCalled()
    expect(generateCsv).not.toHaveBeenCalled()
  })

  it('retorna 404 quando o dispositivo não é encontrado', async () => {
    Devices.findById.mockResolvedValue(null)

    await exportController.csvDay(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Dispositivo não encontrado'
    })
    expect(getTimeRange).not.toHaveBeenCalled()
    expect(generateCsv).not.toHaveBeenCalled()
  })

  it('retorna 500 quando ocorre erro ao consultar o dispositivo', async () => {
    Devices.findById.mockRejectedValue(new Error('Falha no banco'))

    await exportController.csvDay(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro ao exportar CSV: Falha no banco'
    })
    expect(generateCsv).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('retorna 500 quando o cálculo do intervalo diário falha', async () => {
    getTimeRange.mockImplementation(() => {
      throw new Error('Data inválida')
    })

    await exportController.csvDay(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro ao exportar CSV: Data inválida'
    })
    expect(generateCsv).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('retorna 500 quando o gerador CSV lança um erro', async () => {
    generateCsv.mockImplementation(() => {
      throw new Error('Falha ao gerar arquivo')
    })

    await exportController.csvDay(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro ao exportar CSV: Falha ao gerar arquivo'
    })
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
