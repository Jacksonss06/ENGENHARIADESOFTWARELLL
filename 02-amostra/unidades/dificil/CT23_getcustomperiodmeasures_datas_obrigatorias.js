/**
 * CT23 | Nível: Dificil
 * Projeto-base: HidroWebnia API
 * Arquivo original: src/controllers/graphicsController.js
 * Alvo experimental: getCustomPeriodMeasures - datas obrigatórias
 *
 * Objetivo da unidade:
 * Verificar o controller quando startDate ou endDate não é informado.
 *
 * IMPORTANTE:
 * - Este arquivo contém o CÓDIGO-FONTE a ser apresentado à LLM.
 * - Não contém casos de teste nem respostas esperadas.
 * - A geração dos testes será solicitada pelo prompt padronizado do experimento.
 */

const graphicsService = require('../services/graphicsService')

exports.getDayMeasures = async (req, res) => {
    try {
        const { id } = req.params
        const { targetDate, fields } = req.query
        const measures = await graphicsService.getMeasuresByPeriod(id, 'dia', targetDate, fields)
        res.json(measures)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.getWeekMeasures = async (req, res) => {
    try {
        const { id } = req.params
        const { targetDate, fields } = req.query
        const measures = await graphicsService.getMeasuresByPeriod(id, 'semana', targetDate, fields)
        res.json(measures)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.getMonthMeasures = async (req, res) => {
    try {
        const { id } = req.params
        const { targetDate, fields } = req.query
        const measures = await graphicsService.getMeasuresByPeriod(id, 'mês', targetDate, fields)
        res.json(measures)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.getCustomPeriodMeasures = async (req, res) => {
    try {
        const { id } = req.params
        const { startDate, endDate, fields } = req.query
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate e endDate são obrigatórios' })
        }
        const measures = await graphicsService.getMeasuresByCustomPeriod(id, startDate, endDate, fields)
        res.json(measures)
    } catch (error) {
        res.status(400).json({ error: 'Erro ao buscar dados do período' })
    }
}
