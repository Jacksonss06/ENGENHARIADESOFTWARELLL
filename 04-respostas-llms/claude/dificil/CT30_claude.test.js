jest.mock('fast-csv', () => ({
  format: jest.fn()
}))

const fastCsv = require('fast-csv')
const { generateCsv } = require('../src/services/csvGenerator')

describe('generateCsv', () => {
  let res
  let csvStreamMock

  beforeEach(() => {
    csvStreamMock = {
      pipe: jest.fn(),
      write: jest.fn(),
      end: jest.fn()
    }
    fastCsv.format.mockReturnValue(csvStreamMock)

    res = {
      setHeader: jest.fn()
    }

    jest.clearAllMocks()
    fastCsv.format.mockReturnValue(csvStreamMock)
  })

  test('deve configurar os headers corretamente', () => {
    generateCsv(res, 'device123', [], 'dia')

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename=medicoes_device123_dia.csv'
    )
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv')
  })

  test('deve chamar fastCsv.format com headers true', () => {
    generateCsv(res, 'device123', [], 'dia')
    expect(fastCsv.format).toHaveBeenCalledWith({ headers: true })
  })

  test('deve chamar pipe com o objeto res', () => {
    generateCsv(res, 'device123', [], 'dia')
    expect(csvStreamMock.pipe).toHaveBeenCalledWith(res)
  })

  test('deve escrever mensagem de "nenhuma medição encontrada" quando measures for array vazio', () => {
    generateCsv(res, 'device123', [], 'semana')

    expect(csvStreamMock.write).toHaveBeenCalledTimes(1)
    expect(csvStreamMock.write).toHaveBeenCalledWith({
      Mensagem: 'Nenhuma medição encontrada para o semana'
    })
    expect(csvStreamMock.end).toHaveBeenCalled()
  })

  test('deve escrever mensagem de "nenhuma medição encontrada" quando measures não for array', () => {
    generateCsv(res, 'device123', null, 'mes')

    expect(csvStreamMock.write).toHaveBeenCalledTimes(1)
    expect(csvStreamMock.write).toHaveBeenCalledWith({
      Mensagem: 'Nenhuma medição encontrada para o mes'
    })
    expect(csvStreamMock.end).toHaveBeenCalled()
  })

  test('deve escrever mensagem de "nenhuma medição encontrada" quando measures for undefined', () => {
    generateCsv(res, 'device123', undefined, 'ano')

    expect(csvStreamMock.write).toHaveBeenCalledTimes(1)
    expect(csvStreamMock.write).toHaveBeenCalledWith({
      Mensagem: 'Nenhuma medição encontrada para o ano'
    })
  })

  test('deve escrever uma linha por medição normalizada com valores completos', () => {
    const measures = [
      {
        temperature: 25.567,
        waterTemperature: 18.234,
        waterFlux: true,
        containerLevel: 80,
        conductivity: 123.456,
        humidity: 55.123,
        luminosity: 300.789,
        ph: 7.123,
        uv: 3.456,
        timestamp: '2023-01-01T10:00:00Z',
        onlineTime: '10h',
        engineStatus: true
      }
    ]

    generateCsv(res, 'device123', measures, 'dia')

    expect(csvStreamMock.write).toHaveBeenCalledTimes(1)
    const writtenData = csvStreamMock.write.mock.calls[0][0]

    expect(writtenData.Temperatura).toBe('25.6 °C')
    expect(writtenData['Temp. Água']).toBe('18.2 °C')
    expect(writtenData['Fluxo Água']).toBe('Ativo')
    expect(writtenData['Nível Contêiner']).toBe(80)
    expect(writtenData.Condutividade).toBe('123.46 µS/cm')
    expect(writtenData.Umidade).toBe('55.1 %')
    expect(writtenData.Luminosidade).toBe('301 lux')
    expect(writtenData.pH).toBe('7.12')
    expect(writtenData.UV).toBe('3.46')
    expect(writtenData['Tempo Online']).toBe('10h')
    expect(writtenData.Bomba).toBe('Ligado')
    expect(writtenData['Data/Hora']).not.toBe('N/A')
  })

  test('deve normalizar corretamente medição com waterFlux false e engineStatus false', () => {
    const measures = [
      {
        temperature: 20,
        waterTemperature: 15,
        waterFlux: false,
        containerLevel: 50,
        conductivity: 100,
        humidity: 60,
        luminosity: 200,
        ph: 6.5,
        uv: 2,
        timestamp: '2023-05-01T12:00:00Z',
        onlineTime: '5h',
        engineStatus: false
      }
    ]

    generateCsv(res, 'device123', measures, 'dia')

    const writtenData = csvStreamMock.write.mock.calls[0][0]
    expect(writtenData['Fluxo Água']).toBe('Inativo')
    expect(writtenData.Bomba).toBe('Desligado')
  })

  test('deve normalizar medição com campos ausentes/indefinidos para N/A', () => {
    const measures = [{}]

    generateCsv(res, 'device123', measures, 'dia')

    const writtenData = csvStreamMock.write.mock.calls[0][0]
    expect(writtenData.Temperatura).toBe('N/A')
    expect(writtenData['Temp. Água']).toBe('N/A')
    expect(writtenData['Fluxo Água']).toBe('N/A')
    expect(writtenData['Nível Contêiner']).toBe('N/A')
    expect(writtenData.Condutividade).toBe('N/A')
    expect(writtenData.Umidade).toBe('N/A')
    expect(writtenData.Luminosidade).toBe('N/A')
    expect(writtenData.pH).toBe('N/A')
    expect(writtenData.UV).toBe('N/A')
    expect(writtenData['Tempo Online']).toBe('N/A')
    expect(writtenData.Bomba).toBe('N/A')
    expect(writtenData['Data/Hora']).toBe('N/A')
  })

  test('deve usar containerLevel igual a 0 corretamente (não deve virar N/A)', () => {
    const measures = [{ containerLevel: 0 }]

    generateCsv(res, 'device123', measures, 'dia')

    const writtenData = csvStreamMock.write.mock.calls[0][0]
    expect(writtenData['Nível Contêiner']).toBe(0)
  })

  test('deve tratar timestamp inválido como N/A', () => {
    const measures = [{ timestamp: 'invalid-date' }]

    generateCsv(res, 'device123', measures, 'dia')

    const writtenData = csvStreamMock.write.mock.calls[0][0]
    expect(writtenData['Data/Hora']).toBe('N/A')
  })

  test('deve tratar timestamp nulo como N/A', () => {
    const measures = [{ timestamp: null }]

    generateCsv(res, 'device123', measures, 'dia')

    const writtenData = csvStreamMock.write.mock.calls[0][0]
    expect(writtenData['Data/Hora']).toBe('N/A')
  })

  test('deve processar múltiplas medições e escrever uma linha para cada', () => {
    const measures = [
      { temperature: 20, timestamp: '2023-01-01T10:00:00Z' },
      { temperature: 25, timestamp: '2023-01-02T10:00:00Z' },
      { temperature: 30, timestamp: '2023-01-03T10:00:00Z' }
    ]

    generateCsv(res, 'device123', measures, 'dia')

    expect(csvStreamMock.write).toHaveBeenCalledTimes(3)
    expect(csvStreamMock.end).toHaveBeenCalled()
  })

  test('deve chamar csvStream.end ao final da execução', () => {
    generateCsv(res, 'device123', [{ temperature: 10 }], 'dia')
    expect(csvStreamMock.end).toHaveBeenCalledTimes(1)
  })

  test('deve gerar nome de arquivo correto com deviceId e period diferentes', () => {
    generateCsv(res, 'sensor-xyz', [], 'mensal')

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename=medicoes_sensor-xyz_mensal.csv'
    )
  })
})
