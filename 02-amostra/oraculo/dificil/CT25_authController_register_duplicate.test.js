/** CT25 | Difícil | authController.register */
jest.mock('../../hidroWebnia_API-main/src/model/User', () => ({ findOne: jest.fn() }))
jest.mock('bcryptjs', () => ({ compare: jest.fn(), genSalt: jest.fn(), hash: jest.fn() }))
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(), verify: jest.fn() }))
jest.mock('../../hidroWebnia_API-main/src/config/nodemail', () => jest.fn())
const User = require('../../hidroWebnia_API-main/src/model/User')
const controller = require('../../hidroWebnia_API-main/src/controllers/authController')

describe('authController.register', () => {
  test('interrompe cadastro quando username já existe', async () => {
    User.findOne.mockResolvedValueOnce({ _id: 'existing' })
    const req = { body: { username: 'joao', email: 'novo@test.com', password: 'abc12345', role: 'user' } }
    const json = jest.fn()
    const res = { status: jest.fn(() => ({ json })) }
    await controller.register(req, res)
    expect(User.findOne).toHaveBeenCalledWith({ username: 'joao' })
    expect(res.status).toHaveBeenCalledWith(422)
    expect(json).toHaveBeenCalledWith({ msg: 'Por favor, utilize outro nome de Usuário' })
  })
})
