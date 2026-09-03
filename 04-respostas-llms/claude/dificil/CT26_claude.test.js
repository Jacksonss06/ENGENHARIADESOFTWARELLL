const devicesController = require('../controllers/devicesController');
const Devices = require('../model/Devices');

jest.mock('../model/Devices');
jest.mock('../utils/time');
jest.mock('../utils/timeManager');
jest.mock('../utils/cycleUtils');
jest.mock('fs');
jest.mock('../config/cloudinary');

describe('devicesController.getOneDevice', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { id: 'user123', role: 'user' },
            params: { id: 'device123' }
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    it('deve restringir busca ao próprio user.id quando role não é admin', async () => {
        const mockDevice = { _id: 'device123', user: 'user123', name: 'Device Teste' };
        Devices.findOne.mockResolvedValue(mockDevice);

        await devicesController.getOneDevice(req, res);

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device123',
            user: 'user123'
        });
        expect(res.json).toHaveBeenCalledWith(mockDevice);
    });

    it('deve permitir busca sem filtro de user quando role é admin', async () => {
        req.user.role = 'admin';
        const mockDevice = { _id: 'device123', user: 'outroUser', name: 'Device Admin' };
        Devices.findOne.mockResolvedValue(mockDevice);

        await devicesController.getOneDevice(req, res);

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device123'
        });
        expect(res.json).toHaveBeenCalledWith(mockDevice);
    });

    it('deve retornar 404 quando dispositivo não é encontrado para usuário comum', async () => {
        Devices.findOne.mockResolvedValue(null);

        await devicesController.getOneDevice(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Dispositivo não encontrado!' });
    });

    it('deve retornar 404 quando dispositivo pertence a outro usuário e não é admin', async () => {
        Devices.findOne.mockResolvedValue(null);

        await devicesController.getOneDevice(req, res);

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device123',
            user: 'user123'
        });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Dispositivo não encontrado!' });
    });

    it('deve retornar 500 quando ocorre erro no banco de dados', async () => {
        const dbError = new Error('Erro de conexão com o banco');
        Devices.findOne.mockRejectedValue(dbError);

        await devicesController.getOneDevice(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(dbError);
    });

    it('deve tratar corretamente quando req.user.role é undefined (tratado como não-admin)', async () => {
        req.user.role = undefined;
        const mockDevice = { _id: 'device123', user: 'user123' };
        Devices.findOne.mockResolvedValue(mockDevice);

        await devicesController.getOneDevice(req, res);

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device123',
            user: 'user123'
        });
        expect(res.json).toHaveBeenCalledWith(mockDevice);
    });

    it('deve chamar console.log com os dados do dispositivo encontrado', async () => {
        const mockDevice = { _id: 'device123', user: 'user123', name: 'Device Log Test' };
        Devices.findOne.mockResolvedValue(mockDevice);

        await devicesController.getOneDevice(req, res);

        expect(console.log).toHaveBeenCalledWith('Dados do dispositivo em getOneDevice:', mockDevice);
    });

    it('deve chamar console.error quando ocorre exceção', async () => {
        const dbError = new Error('Falha inesperada');
        Devices.findOne.mockRejectedValue(dbError);

        await devicesController.getOneDevice(req, res);

        expect(console.error).toHaveBeenCalledWith(dbError);
    });
});
