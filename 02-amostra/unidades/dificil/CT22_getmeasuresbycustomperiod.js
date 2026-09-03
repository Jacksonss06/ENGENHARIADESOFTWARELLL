/**
 * CT22 | Nível: Dificil
 * Projeto-base: HidroWebnia API
 * Arquivo original: src/services/graphicsService.js
 * Alvo experimental: getMeasuresByCustomPeriod
 *
 * Objetivo da unidade:
 * Verificar o pipeline de agregação para intervalo personalizado e projeção de campos.
 *
 * IMPORTANTE:
 * - Este arquivo contém o CÓDIGO-FONTE a ser apresentado à LLM.
 * - Não contém casos de teste nem respostas esperadas.
 * - A geração dos testes será solicitada pelo prompt padronizado do experimento.
 */

const Measure = require('../model/Devices')
const mongoose = require('mongoose')
const { getTimeRange } = require('../utils/timeRange')

exports.getMeasuresByPeriod = async (deviceId, period, targetDate, fields) => {
    try {
        const { start, end } = getTimeRange(period, targetDate)
        const projectionFields = fields ? fields.split(',').map(f => f.trim()) : ['temperature', 'humidity', 'ph', 'uv', 'conductivity']
        const projection = projectionFields.reduce((acc, field) => ({ ...acc, [field]: `$measures.${field}` }), {})
        projection.timestamp = "$measures.timestamp"

        return await Measure.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(deviceId) } },
            { $unwind: "$measures" },
            { $match: { "measures.timestamp": { $gte: start, $lte: end } } },
            { $project: { _id: 0, ...projection } },
            { $sort: { timestamp: -1 } }
        ])
    } catch (error) {
        console.error(`Error: ${error.message}`)
        throw error
    }
}

exports.getMeasuresByCustomPeriod = async (deviceId, startDate, endDate, fields) => {
    try {
        const projectionFields = fields ? fields.split(',').map(f => `measures.${f.trim()}`) : []
        const projection = projectionFields.length > 0 
            ? projectionFields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {})
            : { "measures.temperature": 1, "measures.humidity": 1 }

        projection["measures.timestamp"] = 1

        return await Measure.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(deviceId) } },
            { $unwind: "$measures" },
            { $match: { "measures.timestamp": { $gte: new Date(startDate), $lte: new Date(endDate) } } },
            { $project: { _id: 0, measures: projection } },
            { $sort: { "measures.timestamp": -1 } },
            { $replaceRoot: { newRoot: "$measures" } }
        ])
    } catch (error) {
        console.error(`Error: ${error.message}`)
        throw error
    }
}
