jest.mock('../../src/model/User')
jest.mock('bcryptjs')
jest.mock('jsonwebtoken')
jest.mock('crypto')
jest.mock('../../src/config/nodemail')
jest.mock('../../src/middlewares/authMiddleware', () => ({
  blacklist: []
}))

const User = require('../../src/model/User')
const authController = require('../../src/controllers/authController')

describe('authController.register', () => {
  let req, res

  beforeEach(() => {
    jest.clearAllMocks()
    req = {
      body: {
        username: 'existingUser',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      }
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })

  test('deve retornar 422 quando o username já existe', async () => {
    User.findOne = jest.fn().mockResolvedValueOnce({ username: 'existingUser' })

    await authController.register(req, res)

    expect(User.findOne).toHaveBeenCalledWith({ username: 'existingUser' })
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Por favor, utilize outro nome de Usuário' })
  })

  test('não deve verificar email quando username já existe', async () => {
    User.findOne = jest.fn().mockResolvedValueOnce({ username: 'existingUser' })

    await authController.register(req, res)

    expect(User.findOne).toHaveBeenCalledTimes(1)
  })

  test('deve interromper o fluxo sem chamar user.save quando username duplicado', async () => {
    User.findOne = jest.fn().mockResolvedValueOnce({ username: 'existingUser' })
    const saveSpy = jest.fn()
    User.mockImplementation(() => ({
      save: saveSpy
    }))

    await authController.register(req, res)

    expect(saveSpy).not.toHaveBeenCalled()
  })

  test('deve retornar 422 quando o email já existe (username não duplicado)', async () => {
    User.findOne = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ email: 'test@example.com' })

    await authController.register(req, res)

    expect(User.findOne).toHaveBeenNthCalledWith(1, { username: 'existingUser' })
    expect(User.findOne).toHaveBeenNthCalledWith(2, { email: 'test@example.com' })
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Por favor, utilize outro e-mail' })
  })

  test('deve criar usuário com sucesso quando username e email não existem', async () => {
    const bcrypt = require('bcryptjs')
    User.findOne = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
    bcrypt.genSalt = jest.fn().mockResolvedValue('salt123')
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword')

    const saveSpy = jest.fn().mockResolvedValue(true)
    User.mockImplementation(() => ({
      save: saveSpy
    }))

    await authController.register(req, res)

    expect(bcrypt.genSalt).toHaveBeenCalledWith(12)
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt123')
    expect(saveSpy).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Usuário criado com sucesso!' })
  })

  test('deve retornar 500 quando ocorrer erro ao salvar usuário', async () => {
    const bcrypt = require('bcryptjs')
    User.findOne = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
    bcrypt.genSalt = jest.fn().mockResolvedValue('salt123')
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword')

    const saveSpy = jest.fn().mockRejectedValue(new Error('DB error'))
    User.mockImplementation(() => ({
      save: saveSpy
    }))

    console.log = jest.fn()

    await authController.register(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Erro no servidor, tente novamente mais tarde!' })
  })

  test('deve usar role padrão "user" quando role não for fornecido', async () => {
    const bcrypt = require('bcryptjs')
    req.body.role = undefined
    User.findOne = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
    bcrypt.genSalt = jest.fn().mockResolvedValue('salt123')
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword')

    const saveSpy = jest.fn().mockResolvedValue(true)
    let constructorArgs
    User.mockImplementation((args) => {
      constructorArgs = args
      return { save: saveSpy }
    })

    await authController.register(req, res)

    expect(constructorArgs.role).toBe('user')
  })

  test('deve manter role customizado quando fornecido', async () => {
    const bcrypt = require('bcryptjs')
    req.body.role = 'admin'
    User.findOne = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
    bcrypt.genSalt = jest.fn().mockResolvedValue('salt123')
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword')

    const saveSpy = jest.fn().mockResolvedValue(true)
    let constructorArgs
    User.mockImplementation((args) => {
      constructorArgs = args
      return { save: saveSpy }
    })

    await authController.register(req, res)

    expect(constructorArgs.role).toBe('admin')
  })
})
