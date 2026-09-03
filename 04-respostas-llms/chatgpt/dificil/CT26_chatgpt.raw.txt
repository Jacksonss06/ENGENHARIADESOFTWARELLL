jest.mock('../model/Devices', () => ({
    findOne: jest.fn()
}))

jest.mock('../utils/time', () => ({}))
jest.mock('../utils/timeManager', () => ({
    getTimerForDevice: jest.fn()
}))
jest.mock('../utils/cycleUtils', () => ({
    calculateDaysPassed: jest.fn()
}))
jest.mock('../config/cloudinary', () => ({
    uploader: {
        upload: jest.fn()
    }
}))

const Devices = require('../model/Devices')
const { getOneDevice } = require('./devicesController')

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
})

describe('devicesController.getOneDevice', () => {
    let consoleLogSpy
    let consoleErrorSpy

    beforeEach(() => {
        jest.clearAllMocks()
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        consoleLogSpy.mockRestore()
        consoleErrorSpy.mockRestore()
    })

    it('pesquisa o dispositivo pelo id e pelo id do usuário comum', async () => {
        const device = {
            _id: 'device-1',
            user: 'user-1',
            name: 'Dispositivo do usuário'
        }
        const req = {
            params: { id: 'device-1' },
            user: { id: 'user-1', role: 'user' }
        }
        const res = createResponse()

        Devices.findOne.mockResolvedValue(device)

        await getOneDevice(req, res)

        expect(Devices.findOne).toHaveBeenCalledTimes(1)
        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device-1',
            user: 'user-1'
        })
        expect(res.json).toHaveBeenCalledWith(device)
        expect(res.status).not.toHaveBeenCalled()
        expect(res.send).not.toHaveBeenCalled()
    })

    it('não retorna dispositivo fora do escopo do usuário comum', async () => {
        const req = {
            params: { id: 'device-from-another-user' },
            user: { id: 'user-1', role: 'user' }
        }
        const res = createResponse()

        Devices.findOne.mockResolvedValue(null)

        await getOneDevice(req, res)

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device-from-another-user',
            user: 'user-1'
        })
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Dispositivo não encontrado!'
        })
        expect(res.send).not.toHaveBeenCalled()
    })

    it('permite que administrador pesquise somente pelo id do dispositivo', async () => {
        const device = {
            _id: 'device-2',
            user: 'another-user'
        }
        const req = {
            params: { id: 'device-2' },
            user: { id: 'admin-1', role: 'admin' }
        }
        const res = createResponse()

        Devices.findOne.mockResolvedValue(device)

        await getOneDevice(req, res)

        expect(Devices.findOne).toHaveBeenCalledTimes(1)
        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device-2'
        })
        expect(res.json).toHaveBeenCalledWith(device)
        expect(res.status).not.toHaveBeenCalled()
    })

    it('retorna status 404 quando o dispositivo não existe para administrador', async () => {
        const req = {
            params: { id: 'missing-device' },
            user: { id: 'admin-1', role: 'admin' }
        }
        const res = createResponse()

        Devices.findOne.mockResolvedValue(null)

        await getOneDevice(req, res)

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'missing-device'
        })
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Dispositivo não encontrado!'
        })
    })

    it('retorna status 500 quando ocorre erro ao pesquisar o dispositivo', async () => {
        const error = new Error('Falha no banco de dados')
        const req = {
            params: { id: 'device-1' },
            user: { id: 'user-1', role: 'user' }
        }
        const res = createResponse()

        Devices.findOne.mockRejectedValue(error)

        await getOneDevice(req, res)

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device-1',
            user: 'user-1'
        })
        expect(consoleErrorSpy).toHaveBeenCalledWith(error)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(error)
        expect(res.json).not.toHaveBeenCalled()
    })
})
