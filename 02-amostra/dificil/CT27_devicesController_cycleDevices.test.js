/** CT27 | Difícil | devicesController.cycleDevices */
jest.mock('../../hidroWebnia_API-main/src/model/Devices', () => ({ findById: jest.fn(), findOne: jest.fn() }))
jest.mock('../../hidroWebnia_API-main/src/config/cloudinary', () => ({ uploader: { upload: jest.fn() } }))
const Devices = require('../../hidroWebnia_API-main/src/model/Devices')
const controller = require('../../hidroWebnia_API-main/src/controllers/devicesController')

describe('devicesController.cycleDevices', () => {
  afterEach(() => jest.useRealTimers())
  test('cria ciclo subsequente preservando sequência', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-02T12:00:00Z'))
    const device = { cycles: [{ currentCycle: 2 }], save: jest.fn().mockResolvedValue(undefined) }
    device.cycles.push = Array.prototype.push.bind(device.cycles)
    Devices.findById.mockResolvedValue(device)
    const req = { user: { role: 'admin', id: 'u1' }, params: { deviceId: 'd1' } }
    const json = jest.fn()
    const res = { json, status: jest.fn(() => ({ json })) }
    await controller.cycleDevices(req, res)
    expect(device.cycles.at(-1)).toMatchObject({ currentCycle: 3, daysPassed: 0, manualAdvance: true })
    expect(device.lastCycleUpdate).toEqual(new Date('2026-09-02T12:00:00Z'))
    expect(device.save).toHaveBeenCalled()
  })
})
