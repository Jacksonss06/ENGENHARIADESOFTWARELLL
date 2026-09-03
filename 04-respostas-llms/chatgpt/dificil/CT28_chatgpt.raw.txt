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
const { csvDay } = require('./exportController')

const createResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('exportController.csvDay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    'id-invalido',
    '',
    '123',
    'zzzzzzzzzzzzzzzzzzzzzzzz',
    null,
    undefined
  ])('retorna 400 para ObjectId inválido (%p) sem consultar o banco', async deviceId => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false)

    const req = {
      params: { deviceId },
      query: { date: '2024-01-10' }
    }
    const res = createResponse()

    await csvDay(req, res)

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(deviceId)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'ID do dispositivo inválido'
    })
    expect(Devices.findById).not.toHaveBeenCalled()
    expect(getTimeRange).not.toHaveBeenCalled()
    expect(generateCsv).not.toHaveBeenCalled()
  })

  test('retorna 404 quando o dispositivo não é encontrado', async () => {
    const deviceId = '507f1f77bcf86cd799439011'
    mongoose.Types.ObjectId.isValid.mockReturnValue(true)
    Devices.findById.mockResolvedValue(null)

    const req = {
      params: { deviceId },
      query: { date: '2024-01-10' }
    }
    const res = createResponse()

    await csvDay(req, res)

    expect(Devices.findById).toHaveBeenCalledTimes(1)
    expect(Devices.findById).toHaveBeenCalledWith(deviceId)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Dispositivo não encontrado'
    })
    expect(getTimeRange).not.toHaveBeenCalled()
    expect(generateCsv).not.toHaveBeenCalled()
  })

  test('filtra as medidas do dia e gera o CSV', async () => {
    const deviceId = '507f1f77bcf86cd799439011'
    const start = new Date('2024-01-10T00:00:00.000Z')
    const end = new Date('2024-01-10T23:59:59.999Z')
    const measureBefore = {
      timestamp: '2024-01-09T23:59:59.999Z',
      value: 1
    }
    const measureAtStart = {
      timestamp: '2024-01-10T00:00:00.000Z',
      value: 2
    }
    const measureInside = {
      timestamp: '2024-01-10T12:00:00.000Z',
      value: 3
    }
    const measureAtEnd = {
      timestamp: '2024-01-10T23:59:59.999Z',
      value: 4
    }
    const measureAfter = {
      timestamp: '2024-01-11T00:00:00.000Z',
      value: 5
    }

    mongoose.Types.ObjectId.isValid.mockReturnValue(true)
    Devices.findById.mockResolvedValue({
      measures: [
        measureBefore,
        measureAtStart,
        measureInside,
        measureAtEnd,
        measureAfter
      ]
    })
    getTimeRange.mockReturnValue({ start, end })

    const req = {
      params: { deviceId },
      query: { date: '2024-01-10' }
    }
    const res = createResponse()

    await csvDay(req, res)

    expect(getTimeRange).toHaveBeenCalledWith('dia', '2024-01-10')
    expect(generateCsv).toHaveBeenCalledTimes(1)
    expect(generateCsv).toHaveBeenCalledWith(
      res,
      deviceId,
      [measureAtStart, measureInside, measureAtEnd],
      'dia'
    )
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  test('gera CSV com lista vazia quando o dispositivo não possui medidas', async () => {
    const deviceId = '507f1f77bcf86cd799439011'

    mongoose.Types.ObjectId.isValid.mockReturnValue(true)
    Devices.findById.mockResolvedValue({})
    getTimeRange.mockReturnValue({
      start: new Date('2024-01-10T00:00:00.000Z'),
      end: new Date('2024-01-10T23:59:59.999Z')
    })

    const req = {
      params: { deviceId },
      query: { date: '2024-01-10' }
    }
    const res = createResponse()

    await csvDay(req, res)

    expect(generateCsv).toHaveBeenCalledWith(res, deviceId, [], 'dia')
  })

  test('retorna 500 quando ocorre erro na consulta ao banco', async () => {
    const deviceId = '507f1f77bcf86cd799439011'
    const error = new Error('Falha no banco')
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    mongoose.Types.ObjectId.isValid.mockReturnValue(true)
    Devices.findById.mockRejectedValue(error)

    const req = {
      params: { deviceId },
      query: { date: '2024-01-10' }
    }
    const res = createResponse()

    await csvDay(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro ao exportar CSV: Falha no banco'
    })
    expect(generateCsv).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro ao exportar dados:',
      error
    )

    consoleErrorSpy.mockRestore()
  })
})
