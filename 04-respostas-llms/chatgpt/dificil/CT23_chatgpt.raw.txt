jest.mock('../services/graphicsService', () => ({
    getMeasuresByCustomPeriod: jest.fn()
}))

const graphicsService = require('../services/graphicsService')
const { getCustomPeriodMeasures } = require('./graphicsController')

describe('getCustomPeriodMeasures', () => {
    let req
    let res

    beforeEach(() => {
        jest.clearAllMocks()

        req = {
            params: { id: 'station-123' },
            query: {}
        }

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
    })

    test.each([
        ['startDate ausente', { endDate: '2024-01-31' }],
        ['endDate ausente', { startDate: '2024-01-01' }],
        ['ambas as datas ausentes', {}],
        ['startDate vazio', { startDate: '', endDate: '2024-01-31' }],
        ['endDate vazio', { startDate: '2024-01-01', endDate: '' }],
        ['startDate nulo', { startDate: null, endDate: '2024-01-31' }],
        ['endDate nulo', { startDate: '2024-01-01', endDate: null }]
    ])('retorna 400 quando %s', async (_scenario, query) => {
        req.query = query

        await getCustomPeriodMeasures(req, res)

        expect(res.status).toHaveBeenCalledTimes(1)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({
            error: 'startDate e endDate são obrigatórios'
        })
        expect(graphicsService.getMeasuresByCustomPeriod).not.toHaveBeenCalled()
    })

    it('busca e retorna as medidas quando as datas são informadas', async () => {
        const measures = [{ date: '2024-01-10', value: 42 }]

        req.query = {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            fields: 'level,rainfall'
        }
        graphicsService.getMeasuresByCustomPeriod.mockResolvedValue(measures)

        await getCustomPeriodMeasures(req, res)

        expect(graphicsService.getMeasuresByCustomPeriod).toHaveBeenCalledTimes(1)
        expect(graphicsService.getMeasuresByCustomPeriod).toHaveBeenCalledWith(
            'station-123',
            '2024-01-01',
            '2024-01-31',
            'level,rainfall'
        )
        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith(measures)
    })

    it('encaminha fields como undefined quando não informado', async () => {
        req.query = {
            startDate: '2024-01-01',
            endDate: '2024-01-31'
        }
        graphicsService.getMeasuresByCustomPeriod.mockResolvedValue([])

        await getCustomPeriodMeasures(req, res)

        expect(graphicsService.getMeasuresByCustomPeriod).toHaveBeenCalledWith(
            'station-123',
            '2024-01-01',
            '2024-01-31',
            undefined
        )
        expect(res.json).toHaveBeenCalledWith([])
    })

    it('retorna 400 quando o serviço lança um erro', async () => {
        req.query = {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            fields: 'level'
        }
        graphicsService.getMeasuresByCustomPeriod.mockRejectedValue(
            new Error('Falha no serviço')
        )

        await getCustomPeriodMeasures(req, res)

        expect(graphicsService.getMeasuresByCustomPeriod).toHaveBeenCalledWith(
            'station-123',
            '2024-01-01',
            '2024-01-31',
            'level'
        )
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erro ao buscar dados do período'
        })
    })
})
