const { getOneDevice } = require('./devicesController');
const Devices = require('../model/Devices');

jest.mock('../model/Devices');

describe('devicesController.getOneDevice', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            params: {
                id: 'device-123'
            },
            user: {
                id: 'user-456',
                role: 'user' // Escopo de usuário comum
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };

        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    it('deve consultar o dispositivo com restrição ao user.id do usuário comum e retornar o dispositivo', async () => {
        const mockDevice = { _id: 'device-123', user: 'user-456', name: 'Meu Dispositivo' };
        Devices.findOne.mockResolvedValue(mockDevice);

        await getOneDevice(req, res);

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device-123',
            user: 'user-456'
        });
        expect(res.json).toHaveBeenCalledWith(mockDevice);
    });

    it('deve retornar status 404 caso o dispositivo não seja encontrado (ou não pertença ao usuário)', async () => {
        Devices.findOne.mockResolvedValue(null);

        await getOneDevice(req, res);

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device-123',
            user: 'user-456'
        });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Dispositivo não encontrado!' });
    });

    it('deve retornar status 500 caso ocorra um erro na consulta ao banco de dados', async () => {
        const mockError = new Error('Erro de conexão');
        Devices.findOne.mockRejectedValue(mockError);

        await getOneDevice(req, res);

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device-123',
            user: 'user-456'
        });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(mockError);
    });
});
