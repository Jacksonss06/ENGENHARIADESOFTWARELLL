/** CT24 | Difícil | authController.login */
jest.mock('../../hidroWebnia_API-main/src/model/User', () => ({ findOne: jest.fn() }))
jest.mock('bcryptjs', () => ({ compare: jest.fn(), genSalt: jest.fn(), hash: jest.fn() }))
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(), verify: jest.fn() }))
jest.mock('../../hidroWebnia_API-main/src/config/nodemail', () => jest.fn())
const User = require('../../hidroWebnia_API-main/src/model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const controller = require('../../hidroWebnia_API-main/src/controllers/authController')

describe('authController.login', () => {
  test('retorna token para credenciais válidas', async () => {
    process.env.SECRET = 'secret'
    User.findOne.mockResolvedValue({ _id: 'u1', role: 'user', password: 'hash' })
    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue('jwt-token')
    const req = { body: { email: 'user@test.com', password: 'abc12345' } }
    const json = jest.fn()
    const res = { status: jest.fn(() => ({ json })) }
    await controller.login(req, res)
    expect(jwt.sign).toHaveBeenCalledWith({ id: 'u1', role: 'user' }, 'secret')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ msg: 'Autenticação realizada com sucesso!', token: 'jwt-token' })
  })
})
