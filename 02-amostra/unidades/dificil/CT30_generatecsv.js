/**
 * CT30 | Nível: Dificil
 * Projeto-base: HidroWebnia API
 * Arquivo original: src/services/csvGenerator.js
 * Alvo experimental: generateCsv
 *
 * Objetivo da unidade:
 * Verificar geração de CSV por stream, cabeçalhos, normalização e finalização.
 *
 * IMPORTANTE:
 * - Este arquivo contém o CÓDIGO-FONTE a ser apresentado à LLM.
 * - Não contém casos de teste nem respostas esperadas.
 * - A geração dos testes será solicitada pelo prompt padronizado do experimento.
 */

const fastCsv = require('fast-csv')

const normalizeMeasures = (measures) => {
    if (!Array.isArray(measures)) return []

    return measures.map(measure => ({
        temperature: typeof measure.temperature === 'number' ? `${measure.temperature.toFixed(1)} °C` : 'N/A',
        waterTemperature: typeof measure.waterTemperature === 'number' ? `${measure.waterTemperature.toFixed(1)} °C` : 'N/A',
        waterFlux: measure.waterFlux === true ? 'Ativo' : measure.waterFlux === false ? 'Inativo' : 'N/A',
        containerLevel: measure.containerLevel ?? 'N/A',
        conductivity: typeof measure.conductivity === 'number' ? `${measure.conductivity.toFixed(2)} µS/cm` : 'N/A',
        humidity: typeof measure.humidity === 'number' ? `${measure.humidity.toFixed(1)} %` : 'N/A',
        luminosity: typeof measure.luminosity === 'number' ? `${measure.luminosity.toFixed(0)} lux` : 'N/A',
        ph: typeof measure.ph === 'number' ? measure.ph.toFixed(2) : 'N/A',
        uv: typeof measure.uv === 'number' ? measure.uv.toFixed(2) : 'N/A',
        timestamp: measure.timestamp ?? null,
        onlineTime: measure.onlineTime ?? 'N/A',
        engineStatus: measure.engineStatus === true ? 'Ligado' : measure.engineStatus === false ? 'Desligado' : 'N/A'
    }))
}

const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(new Date(timestamp).getTime())) {
        return 'N/A'
    }
    return new Date(timestamp).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    })
}

const generateCsv = (res, deviceId, measures, period) => {
    const csvStream = fastCsv.format({ headers: true })
    res.setHeader('Content-Disposition', `attachment; filename=medicoes_${deviceId}_${period}.csv`)
    res.setHeader('Content-Type', 'text/csv')

    csvStream.pipe(res)

    const normalizedMeasures = normalizeMeasures(measures)

    if (normalizedMeasures.length > 0) {
        normalizedMeasures.forEach(measure => {
            csvStream.write({
                Temperatura: measure.temperature,
                'Temp. Água': measure.waterTemperature,
                'Fluxo Água': measure.waterFlux,
                'Nível Contêiner': measure.containerLevel,
                Condutividade: measure.conductivity,
                Umidade: measure.humidity,
                Luminosidade: measure.luminosity,
                pH: measure.ph,
                UV: measure.uv,
                'Data/Hora': formatTimestamp(measure.timestamp),
                'Tempo Online': measure.onlineTime,
                Bomba: measure.engineStatus
            })
        })
    } else {
        csvStream.write({ Mensagem: `Nenhuma medição encontrada para o ${period}` })
    }

    csvStream.end()
}

module.exports = { generateCsv }