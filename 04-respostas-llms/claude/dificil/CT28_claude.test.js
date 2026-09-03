jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}))

jest.mock('../model/Devices')
jest.mock('../utils/timeRange')
jest.mock('../services/csvGenerator')
jest.mock('../services/pdfGenarator')

const mongoose = require('mongoose')
const Devices = require('../model/Devices')
const { getTimeRange } = require('../utils/timeRange')
const { generateCsv } = require('../services/csvGenerator')
const generatePdf = require('../services/pdfGenarator')

const exportController = require('../controllers/exportController')

describe('exportController', () => {
  let req, res

  beforeEach(() => {
    jest.clearAllMocks()
    req = {
      params: { deviceId: 'invalidId' },
      query: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('csvDay - validação de ObjectId', () => {
    it('deve retornar 400 quando o deviceId for inválido', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(false)

      await exportController.csvDay(req, res)

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalidId')
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'ID do dispositivo inválido' })
      expect(Devices.findById).not.toHaveBeenCalled()
    })

    it('não deve chamar getTimeRange quando o ID for inválido', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(false)

      await exportController.csvDay(req, res)

      expect(getTimeRange).not.toHaveBeenCalled()
    })

    it('não deve chamar generateCsv quando o ID for inválido', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(false)

      await exportController.csvDay(req, res)

      expect(generateCsv).not.toHaveBeenCalled()
    })
  })

  describe('csvDay - fluxo válido com ObjectId correto', () => {
    beforeEach(() => {
      req.params.deviceId = '507f1f77bcf86cd799439011'
    })

    it('deve retornar 404 quando o dispositivo não for encontrado', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true)
      Devices.findById.mockResolvedValue(null)

      await exportController.csvDay(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Dispositivo não encontrado' })
    })

    it('deve filtrar medições dentro do período e chamar generateCsv', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true)
      const mockDevice = {
        measures: [
          { timestamp: '2024-01-01T10:00:00Z', value: 10 },
          { timestamp: '2024-01-05T10:00:00Z', value: 20 }
        ]
      }
      Devices.findById.mockResolvedValue(mockDevice)
      getTimeRange.mockReturnValue({
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-01T23:59:59Z')
      })

      await exportController.csvDay(req, res)

      expect(getTimeRange).toHaveBeenCalledWith('dia', undefined)
      expect(generateCsv).toHaveBeenCalledWith(
        res,
        '507f1f77bcf86cd799439011',
        [mockDevice.measures[0]],
        'dia'
      )
    })

    it('deve retornar lista vazia quando não houver measures dentro do período', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true)
      const mockDevice = { measures: [] }
      Devices.findById.mockResolvedValue(mockDevice)
      getTimeRange.mockReturnValue({
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-01T23:59:59Z')
      })

      await exportController.csvDay(req, res)

      expect(generateCsv).toHaveBeenCalledWith(res, '507f1f77bcf86cd799439011', [], 'dia')
    })

    it('deve retornar 500 quando ocorrer erro inesperado', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true)
      Devices.findById.mockRejectedValue(new Error('Erro de banco'))

      await exportController.csvDay(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Erro ao exportar CSV: Erro de banco'
      })
    })
  })

  describe('csvAll - sem período', () => {
    it('deve usar todas as measures do dispositivo sem chamar getTimeRange', async () => {
      req.params.deviceId = '507f1f77bcf86cd799439011'
      mongoose.Types.ObjectId.isValid.mockReturnValue(true)
      const mockDevice = {
        measures: [{ timestamp: '2024-01-01T10:00:00Z', value: 10 }]
      }
      Devices.findById.mockResolvedValue(mockDevice)

      await exportController.csvAll(req, res)

      expect(getTimeRange).not.toHaveBeenCalled()
      expect(generateCsv).toHaveBeenCalledWith(
        res,
        '507f1f77bcf86cd799439011',
        mockDevice.measures,
        null
      )
    })
  })

  describe('pdfDay - formato pdf', () => {
    it('deve chamar generatePdf quando format for pdf', async () => {
      req.params.deviceId = '507f1f77bcf86cd799439011'
      mongoose.Types.ObjectId.isValid.mockReturnValue(true)
      const mockDevice = { measures: [] }
      Devices.findById.mockResolvedValue(mockDevice)
      getTimeRange.mockReturnValue({
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-01T23:59:59Z')
      })

      await exportController.pdfDay(req, res)

      expect(generatePdf).toHaveBeenCalledWith(res, '507f1f77bcf86cd799439011', [], 'dia')
    })
  })
})
