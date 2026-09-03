/** CT26 | Difícil | devicesController.getOneDevice */
jest.mock('../../hidroWebnia_API-main/src/model/Devices', () => ({ findOne: jest.fn() }))
jest.mock('../../hidroWebnia_API-main/src/config/cloudinary', () => ({ uploader: { upload: jest.fn() } }))
const Devices = require('../../hidroWebnia_API-main/src/model/Devices')
const controller = require('../../hidroWebnia_API-main/src/controllers/devicesController')

describe('devicesController.getOneDevice', () => {
  test('restringe busca de usuário comum ao próprio user.id', async () => {
    const device = { _id: 'd1', name: 'Hidro 1' }
    Devices.findOne.mockResolvedValue(device)
    const req = { user: { id: 'u1', role: 'user' }, params: { id: 'd1' } }
    const res = { json: jest.fn(), status: jest.fn() }
    await controller.getOneDevice(req, res)
    expect(Devices.findOne).toHaveBeenCalledWith({ _id: 'd1', user: 'u1' })
    expect(res.json).toHaveBeenCalledWith(device)
  })
})
