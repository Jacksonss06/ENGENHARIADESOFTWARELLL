/** CT30 | Difícil | csvGenerator.generateCsv */
const { PassThrough } = require('stream')
const { generateCsv } = require('../../hidroWebnia_API-main/src/services/csvGenerator')

describe('generateCsv', () => {
  test('gera CSV normalizado com cabeçalho de download e valores formatados', done => {
    const res = new PassThrough()
    res.setHeader = jest.fn()
    let output = ''
    res.on('data', chunk => { output += chunk.toString() })
    res.on('end', () => {
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=medicoes_dev1_dia.csv')
      expect(output).toContain('Temperatura')
      expect(output).toContain('25.4 °C')
      expect(output).toContain('Ligado')
      done()
    })
    generateCsv(res, 'dev1', [{ temperature: 25.44, engineStatus: true, waterFlux: false, timestamp: '2026-09-02T12:00:00Z' }], 'dia')
  })
})
