jest.mock('fast-csv', () => ({
    format: jest.fn()
}))

const fastCsv = require('fast-csv')
const { generateCsv } = require('./csvGenerator')

describe('generateCsv', () => {
    let res
    let csvStream

    beforeEach(() => {
        res = {
            setHeader: jest.fn()
        }

        csvStream = {
            pipe: jest.fn(),
            write: jest.fn(),
            end: jest.fn()
        }

        fastCsv.format.mockReset()
        fastCsv.format.mockReturnValue(csvStream)
    })

    test('gera o CSV com cabeçalhos e medidas normalizadas', () => {
        const timestamp = '2024-01-15T14:30:00.000Z'
        const expectedTimestamp = new Date(timestamp).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        })

        const measures = [{
            temperature: 25.46,
            waterTemperature: 21.04,
            waterFlux: true,
            containerLevel: 80,
            conductivity: 123.456,
            humidity: 67.89,
            luminosity: 456.7,
            ph: 6.987,
            uv: 2.345,
            timestamp,
            onlineTime: '2h 30min',
            engineStatus: false
        }]

        generateCsv(res, 'device-1', measures, 'diario')

        expect(fastCsv.format).toHaveBeenCalledWith({ headers: true })
        expect(res.setHeader).toHaveBeenNthCalledWith(
            1,
            'Content-Disposition',
            'attachment; filename=medicoes_device-1_diario.csv'
        )
        expect(res.setHeader).toHaveBeenNthCalledWith(2, 'Content-Type', 'text/csv')
        expect(csvStream.pipe).toHaveBeenCalledWith(res)
        expect(csvStream.write).toHaveBeenCalledWith({
            Temperatura: '25.5 °C',
            'Temp. Água': '21.0 °C',
            'Fluxo Água': 'Ativo',
            'Nível Contêiner': 80,
            Condutividade: '123.46 µS/cm',
            Umidade: '67.9 %',
            Luminosidade: '457 lux',
            pH: '6.99',
            UV: '2.35',
            'Data/Hora': expectedTimestamp,
            'Tempo Online': '2h 30min',
            Bomba: 'Desligado'
        })
        expect(csvStream.end).toHaveBeenCalledTimes(1)
    })

    test('escreve todas as medidas na ordem recebida', () => {
        const measures = [
            {
                temperature: 10,
                waterFlux: true,
                timestamp: null,
                engineStatus: true
            },
            {
                temperature: 20,
                waterFlux: false,
                timestamp: 'data-invalida',
                engineStatus: false
            }
        ]

        generateCsv(res, '123', measures, 'semanal')

        expect(csvStream.write).toHaveBeenCalledTimes(2)
        expect(csvStream.write.mock.calls[0][0]).toEqual(expect.objectContaining({
            Temperatura: '10.0 °C',
            'Fluxo Água': 'Ativo',
            'Data/Hora': 'N/A',
            Bomba: 'Ligado'
        }))
        expect(csvStream.write.mock.calls[1][0]).toEqual(expect.objectContaining({
            Temperatura: '20.0 °C',
            'Fluxo Água': 'Inativo',
            'Data/Hora': 'N/A',
            Bomba: 'Desligado'
        }))
        expect(csvStream.end).toHaveBeenCalledTimes(1)
    })

    test('normaliza valores ausentes ou de tipos inválidos', () => {
        generateCsv(res, 'device-2', [{
            temperature: '25',
            waterTemperature: undefined,
            waterFlux: 'true',
            containerLevel: null,
            conductivity: null,
            humidity: '60',
            luminosity: false,
            ph: undefined,
            uv: '1.2',
            timestamp: '',
            onlineTime: null,
            engineStatus: 1
        }], 'mensal')

        expect(csvStream.write).toHaveBeenCalledWith({
            Temperatura: 'N/A',
            'Temp. Água': 'N/A',
            'Fluxo Água': 'N/A',
            'Nível Contêiner': 'N/A',
            Condutividade: 'N/A',
            Umidade: 'N/A',
            Luminosidade: 'N/A',
            pH: 'N/A',
            UV: 'N/A',
            'Data/Hora': 'N/A',
            'Tempo Online': 'N/A',
            Bomba: 'N/A'
        })
        expect(csvStream.end).toHaveBeenCalledTimes(1)
    })

    test('preserva valores não nulos de nível e tempo online, incluindo zero e string vazia', () => {
        generateCsv(res, 'device-3', [{
            containerLevel: 0,
            onlineTime: ''
        }], 'hora')

        expect(csvStream.write).toHaveBeenCalledWith(expect.objectContaining({
            'Nível Contêiner': 0,
            'Tempo Online': ''
        }))
    })

    test('gera uma mensagem quando a lista de medidas está vazia', () => {
        generateCsv(res, 'device-4', [], 'anual')

        expect(csvStream.write).toHaveBeenCalledTimes(1)
        expect(csvStream.write).toHaveBeenCalledWith({
            Mensagem: 'Nenhuma medição encontrada para o anual'
        })
        expect(csvStream.end).toHaveBeenCalledTimes(1)
    })

    test.each([
        ['undefined', undefined],
        ['null', null],
        ['objeto', {}],
        ['string', 'medidas']
    ])('gera uma mensagem quando measures é %s', (_, measures) => {
        generateCsv(res, 'device-5', measures, 'diario')

        expect(csvStream.write).toHaveBeenCalledWith({
            Mensagem: 'Nenhuma medição encontrada para o diario'
        })
        expect(csvStream.end).toHaveBeenCalledTimes(1)
    })
})
