const mongoose = require('mongoose');
const Devices = require('../model/Devices');
const { getTimeRange } = require('../utils/timeRange');
const { generateCsv } = require('../services/csvGenerator');
const generatePdf = require('../services/pdfGenarator');
const exportController = require('./exportController');

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}));
jest.mock('../model/Devices');
jest.mock('../utils/timeRange');
jest.mock('../services/csvGenerator');
jest.mock('../services/pdfGenarator');

describe('exportController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    req = {
      params: { deviceId: 'mock-device-id' },
      query: { date: '2023-10-15' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  describe('csvDay', () => {
    it('deve retornar erro 400 se o deviceId for inválido', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await exportController.csvDay(req, res);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('mock-device-id');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID do dispositivo inválido' });
      expect(Devices.findById).not.toHaveBeenCalled();
    });

    it('deve retornar erro 404 se o dispositivo não for encontrado', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Devices.findById.mockResolvedValue(null);

      await exportController.csvDay(req, res);

      expect(Devices.findById).toHaveBeenCalledWith('mock-device-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Dispositivo não encontrado' });
    });

    it('deve filtrar as medições corretamente e gerar o CSV para o dia especificado (casos dentro e fora do limite)', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      
      const mockStart = new Date('2023-10-15T00:00:00Z');
      const mockEnd = new Date('2023-10-15T23:59:59Z');
      
      const mockMeasures = [
        { timestamp: '2023-10-14T23:59:59Z', value: 10 }, 
        { timestamp: '2023-10-15T00:00:00Z', value: 20 }, 
        { timestamp: '2023-10-15T12:00:00Z', value: 30 }, 
        { timestamp: '2023-10-15T23:59:59Z', value: 40 }, 
        { timestamp: '2023-10-16T00:00:00Z', value: 50 }  
      ];

      Devices.findById.mockResolvedValue({ measures: mockMeasures });
      getTimeRange.mockReturnValue({ start: mockStart, end: mockEnd });

      await exportController.csvDay(req, res);

      expect(getTimeRange).toHaveBeenCalledWith('dia', '2023-10-15');
      
      const expectedFilteredMeasures = [
        mockMeasures[1], 
        mockMeasures[2], 
        mockMeasures[3]  
      ];
      
      expect(generateCsv).toHaveBeenCalledWith(res, 'mock-device-id', expectedFilteredMeasures, 'dia');
      expect(generatePdf).not.toHaveBeenCalled();
    });

    it('deve passar um array vazio para o gerador se o dispositivo não possuir medições no período', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      
      Devices.findById.mockResolvedValue({ 
        measures: [{ timestamp: '2023-10-14T12:00:00Z' }] 
      });
      
      getTimeRange.mockReturnValue({ 
        start: new Date('2023-10-15T00:00:00Z'), 
        end: new Date('2023-10-15T23:59:59Z') 
      });

      await exportController.csvDay(req, res);

      expect(generateCsv).toHaveBeenCalledWith(res, 'mock-device-id', [], 'dia');
    });

    it('deve passar um array vazio se device.measures for inexistente (undefined)', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Devices.findById.mockResolvedValue({});
      getTimeRange.mockReturnValue({ 
        start: new Date('2023-10-15T00:00:00Z'), 
        end: new Date('2023-10-15T23:59:59Z') 
      });

      await exportController.csvDay(req, res);

      expect(generateCsv).toHaveBeenCalledWith(res, 'mock-device-id', [], 'dia');
    });

    it('deve retornar erro 500 se ocorrer uma exceção interna no banco de dados', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      const dbError = new Error('Database connection lost');
      Devices.findById.mockRejectedValue(dbError);

      await exportController.csvDay(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao exportar dados:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao exportar CSV: Database connection lost' });
    });
  });

  describe('Outros fluxos de exportação (csvAll, pdfDay)', () => {
    it('csvAll deve retornar todas as medições sem filtragem de período temporal', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      const mockMeasures = [{ timestamp: '2023-01-01T10:00:00Z' }];
      Devices.findById.mockResolvedValue({ measures: mockMeasures });

      await exportController.csvAll(req, res);

      expect(getTimeRange).not.toHaveBeenCalled();
      expect(generateCsv).toHaveBeenCalledWith(res, 'mock-device-id', mockMeasures, null);
    });

    it('pdfDay deve encaminhar as medições filtradas para o gerador de PDF', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Devices.findById.mockResolvedValue({ measures: [] });
      getTimeRange.mockReturnValue({ 
        start: new Date('2023-10-15T00:00:00Z'), 
        end: new Date('2023-10-15T23:59:59Z') 
      });

      await exportController.pdfDay(req, res);

      expect(generatePdf).toHaveBeenCalledWith(res, 'mock-device-id', [], 'dia');
      expect(generateCsv).not.toHaveBeenCalled();
    });
  });
});
