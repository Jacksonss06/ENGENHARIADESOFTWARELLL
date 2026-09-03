jest.mock('../model/Devices', () => ({
    findById: jest.fn(),
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
const { cycleDevices } = require('./devicesController')

describe('devicesController.cycleDevices', () => {
    const fixedDate = new Date('2024-06-15T10:30:00.000Z')
    let req
    let res
    let consoleLogSpy
    let consoleErrorSpy

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        jest.setSystemTime(fixedDate)

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

        req = {
            user: {
                id: 'user-123',
                role: 'user'
            },
            params: {
                deviceId: 'device-123'
            }
        }

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
    })

    afterEach(() => {
        jest.useRealTimers()
        consoleLogSpy.mockRestore()
        consoleErrorSpy.mockRestore()
    })

    it('inicia o primeiro ciclo para um dispositivo pertencente ao usuário', async () => {
        const device = {
            cycles: [],
            lastCycleUpdate: null,
            save: jest.fn().mockResolvedValue(undefined)
        }
        Devices.findOne.mockResolvedValue(device)

        await cycleDevices(req, res)

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device-123',
            user: 'user-123'
        })
        expect(Devices.findById).not.toHaveBeenCalled()
        expect(device.cycles).toHaveLength(1)
        expect(device.cycles[0]).toEqual({
            startDate: fixedDate,
            currentCycle: 1,
            daysPassed: 0,
            manualAdvance: true
        })
        expect(device.lastCycleUpdate).toBe(device.cycles[0].startDate)
        expect(device.save).toHaveBeenCalledTimes(1)
        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({
            message: 'Novo ciclo iniciado com sucesso',
            cycle: device.cycles[0]
        })
    })

    it('inicia um novo ciclo com sequência baseada no último ciclo existente', async () => {
        req.user.role = 'admin'

        const device = {
            cycles: [
                { currentCycle: 1 },
                { currentCycle: 4 }
            ],
            lastCycleUpdate: new Date('2024-01-01T00:00:00.000Z'),
            save: jest.fn().mockResolvedValue(undefined)
        }
        Devices.findById.mockResolvedValue(device)

        await cycleDevices(req, res)

        expect(Devices.findById).toHaveBeenCalledWith('device-123')
        expect(Devices.findOne).not.toHaveBeenCalled()
        expect(device.cycles).toHaveLength(3)
        expect(device.cycles[2]).toEqual({
            startDate: fixedDate,
            currentCycle: 5,
            daysPassed: 0,
            manualAdvance: true
        })
        expect(device.lastCycleUpdate).toBe(device.cycles[2].startDate)
        expect(device.save).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Novo ciclo iniciado com sucesso',
            cycle: device.cycles[2]
        })
    })

    it('permite que administrador consulte o dispositivo sem filtro de usuário', async () => {
        req.user = {
            id: 'admin-1',
            role: 'admin'
        }

        const device = {
            cycles: [],
            save: jest.fn().mockResolvedValue(undefined)
        }
        Devices.findById.mockResolvedValue(device)

        await cycleDevices(req, res)

        expect(Devices.findById).toHaveBeenCalledWith('device-123')
        expect(Devices.findOne).not.toHaveBeenCalled()
        expect(device.save).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Novo ciclo iniciado com sucesso',
            cycle: expect.objectContaining({
                currentCycle: 1,
                daysPassed: 0,
                manualAdvance: true
            })
        })
    })

    it('retorna 404 quando o dispositivo não existe ou não pertence ao usuário', async () => {
        Devices.findOne.mockResolvedValue(null)

        await cycleDevices(req, res)

        expect(Devices.findOne).toHaveBeenCalledWith({
            _id: 'device-123',
            user: 'user-123'
        })
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Dispositivo não encontrado ou você não tem permissão.'
        })
    })

    it('retorna 404 quando administrador não encontra o dispositivo', async () => {
        req.user.role = 'admin'
        Devices.findById.mockResolvedValue(null)

        await cycleDevices(req, res)

        expect(Devices.findById).toHaveBeenCalledWith('device-123')
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Dispositivo não encontrado ou você não tem permissão.'
        })
    })

    it('retorna 500 quando ocorre erro ao buscar o dispositivo', async () => {
        const error = new Error('Falha na consulta')
        Devices.findOne.mockRejectedValue(error)

        await cycleDevices(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erro ao iniciar novo ciclo',
            details: 'Falha na consulta'
        })
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Erro ao iniciar novo ciclo:',
            error
        )
    })

    it('retorna 500 quando ocorre erro ao persistir o novo ciclo', async () => {
        const error = new Error('Falha ao salvar')
        const device = {
            cycles: [{ currentCycle: 2 }],
            lastCycleUpdate: null,
            save: jest.fn().mockRejectedValue(error)
        }
        Devices.findOne.mockResolvedValue(device)

        await cycleDevices(req, res)

        expect(device.cycles).toHaveLength(2)
        expect(device.cycles[1].currentCycle).toBe(3)
        expect(device.lastCycleUpdate).toBe(fixedDate)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erro ao iniciar novo ciclo',
            details: 'Falha ao salvar'
        })
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Erro ao iniciar novo ciclo:',
            error
        )
    })
})
