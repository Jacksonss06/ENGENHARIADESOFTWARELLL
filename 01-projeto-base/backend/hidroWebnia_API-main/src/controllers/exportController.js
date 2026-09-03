const mongoose = require('mongoose')
const Devices = require('../model/Devices')
const { getTimeRange } = require('../utils/timeRange')
const { generateCsv } = require('../services/csvGenerator')
const generatePdf = require('../services/pdfGenarator') 

const exportData = async (req, res, format, period) => {
  const { deviceId } = req.params
  const { date } = req.query

  if (!mongoose.Types.ObjectId.isValid(deviceId)) {
    return res.status(400).json({ error: 'ID do dispositivo inválido' })
  }

  try {
    const device = await Devices.findById(deviceId)
    if (!device) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' })
    }

    let filteredMeasures = []
    
    if (period) {
      const { start, end } = getTimeRange(period, date)
      filteredMeasures = device.measures?.length > 0
        ? device.measures.filter(measure => {
            const timestamp = new Date(measure.timestamp)
            return timestamp >= start && timestamp <= end
          })
        : []
    } else {
      filteredMeasures = device.measures || []
    }

    if (format === 'csv') {
      generateCsv(res, deviceId, filteredMeasures, period)
    } else if (format === 'pdf') {
      generatePdf(res, deviceId, filteredMeasures, period)
    } else {
      throw new Error('Formato inválido. Use "csv" ou "pdf".')
    }
  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    return res.status(500).json({ error: `Erro ao exportar ${format.toUpperCase()}: ${error.message}` })
  }
}

module.exports = {
  csvDay: async (req, res) => exportData(req, res, 'csv', 'dia'),
  csvWeek: async (req, res) => exportData(req, res, 'csv', 'semana'),
  csvMonth: async (req, res) => exportData(req, res, 'csv', 'mês'),
  pdfDay: async (req, res) => exportData(req, res, 'pdf', 'dia'),
  pdfWeek: async (req, res) => exportData(req, res, 'pdf', 'semana'),
  pdfMonth: async (req, res) => exportData(req, res, 'pdf', 'mês'),
  csvAll: async (req, res) => exportData(req, res, 'csv', null),
  pdfAll: async (req, res) => exportData(req, res, 'pdf', null)
}