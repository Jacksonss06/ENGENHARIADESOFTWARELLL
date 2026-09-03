const PDFMake = require('pdfmake/build/pdfmake')
const { vfs } = require('pdfmake/build/vfs_fonts')

PDFMake.vfs = vfs

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

const buildTableContent = (measures) => {
    const headers = [
        { text: 'Temperatura', style: 'tableHeader' },
        { text: 'Temp. Água', style: 'tableHeader' },
        { text: 'Fluxo Água', style: 'tableHeader' },
        { text: 'Nível Contêiner', style: 'tableHeader' },
        { text: 'Condutividade', style: 'tableHeader' },
        { text: 'Umidade', style: 'tableHeader' },
        { text: 'Luminosidade', style: 'tableHeader' },
        { text: 'pH', style: 'tableHeader' },
        { text: 'UV', style: 'tableHeader' },
        { text: 'Data/Hora', style: 'tableHeader' },
        { text: 'Tempo Online', style: 'tableHeader' },
        { text: 'Bomba', style: 'tableHeader' }
    ]

    const body = [headers]

    measures.forEach((measure) => {
        const row = [
            measure.temperature,
            measure.waterTemperature,
            measure.waterFlux,
            measure.containerLevel,
            measure.conductivity,
            measure.humidity,
            measure.luminosity,
            measure.ph,
            measure.uv,
            formatTimestamp(measure.timestamp),
            measure.onlineTime,
            measure.engineStatus
        ]
        body.push(row)
    })

    return body
}

const generatePdf = (res, hidroponiaId, measures, period) => {
    try {
        if (!hidroponiaId || typeof hidroponiaId !== 'string') {
            console.error('Erro: hidroponiaId inválido', { hidroponiaId })
            res.status(400).send('ID da hidroponia inválido')
            return
        }

        const normalizedMeasures = normalizeMeasures(measures)

        const documentDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 80, 40, 60],
            header: {
                stack: [
                    {
                        text: 'Sistema de Hidroponia',
                        alignment: 'center',
                        fontSize: 20,
                        bold: true,
                        color: '#1B5E20',
                        margin: [0, 20, 0, 10]
                    },
                    {
                        text: `Relatório - Hidroponia ${hidroponiaId}`,
                        alignment: 'center',
                        fontSize: 14,
                        color: '#388E3C',
                        margin: [0, 0, 0, 10]
                    }
                ],
                fillColor: '#E8F5E9'
            },
            content: [
                {
                    text: `Período: ${period === 'dia' ? 'Diário' : period === 'semana' ? 'Semanal' : period === 'mês' ? 'Mensal' : period === 'all' ? 'Completo' : 'Total'}`,
                    alignment: 'center',
                    fontSize: 10,
                    color: '#455A64',
                    margin: [0, 10, 0, 5]
                },
                {
                    text: `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
                    alignment: 'center',
                    fontSize: 8,
                    color: '#455A64',
                    margin: [0, 5, 0, 20]
                },
                normalizedMeasures.length > 0 ? {
                    margin: [0, 0, 0, 0],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
                        body: buildTableContent(normalizedMeasures)
                    },
                    layout: {
                        fillColor: (rowIndex) => rowIndex === 0 ? '#388E3C' : (rowIndex % 2 === 0 ? '#F1F8E9' : '#FFFFFF'),
                        hLineColor: () => '#C8E6C9',
                        vLineColor: () => '#C8E6C9',
                        paddingTop: () => 3,
                        paddingBottom: () => 3,
                        paddingLeft: () => 4,
                        paddingRight: () => 4,
                        noWrap: false
                    }
                } : {
                    text: 'Nenhuma medição disponível para o período.',
                    alignment: 'center',
                    fontSize: 10,
                    color: '#D32F2F',
                    margin: [0, 20, 0, 0]
                }
            ],
            footer: (currentPage) => ({
                text: `Hidroponia: ${hidroponiaId} | Página ${currentPage}`,
                alignment: 'center',
                fontSize: 6,
                color: '#616161',
                margin: [0, 0, 0, 20]
            }),
            styles: {
                tableHeader: {
                    bold: true,
                    fontSize: 6.5,
                    color: '#FFFFFF',
                    alignment: 'center',
                    margin: [0, 2, 0, 2]
                }
            },
            defaultStyle: {
                fontSize: 5.5,
                alignment: 'center',
                color: '#212121'
            }
        }

        const pdfDoc = PDFMake.createPdf(documentDefinition)

        res.setHeader('Content-Disposition', `attachment; filename=measures_hydro_${hidroponiaId}.pdf`)
        res.setHeader('Content-Type', 'application/pdf')

        pdfDoc.getBuffer((buffer) => {
            res.write(buffer)
            res.end()
        })

        console.log('PDF gerado com sucesso para hidroponia:', hidroponiaId)
    } catch (error) {
        console.error('Erro ao gerar PDF:', error.message, error.stack)
        if (!res.headersSent) {
            res.status(500).send('Erro ao gerar o PDF')
        }
    }
}

module.exports = generatePdf