jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}))

const jwt = require('jsonwebtoken')
const { authMiddleware, blacklist } = require('./authMiddleware')

describe('authMiddleware', () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = {
      header: jest.fn(),
      user: undefined
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    next = jest.fn()
    blacklist.length = 0
    jest.clearAllMocks()
    process.env.SECRET = 'test-secret'
  })

  afterAll(() => {
    delete process.env.SECRET
  })

  test.each([
    ['cabeçalho ausente', undefined],
    ['cabeçalho nulo', null],
    ['cabeçalho vazio', ''],
    ['Bearer sem token', 'Bearer ']
  ])('retorna 401 quando o token está ausente: %s', (_, authorization) => {
    req.header.mockReturnValue(authorization)

    authMiddleware(req, res, next)

    expect(req.header).toHaveBeenCalledWith('Authorization')
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Acesso negado!' })
    expect(jwt.verify).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  test('retorna 401 quando o token está na blacklist', () => {
    req.header.mockReturnValue('Bearer blocked-token')
    blacklist.push('blocked-token')

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido!' })
    expect(jwt.verify).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  test('atribui o usuário decodificado e chama next para um token válido', () => {
    const decoded = { id: 'user-id', role: 'user' }

    req.header.mockReturnValue('Bearer valid-token')
    jwt.verify.mockReturnValue(decoded)

    authMiddleware(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret')
    expect(req.user).toEqual(decoded)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  test('retorna 401 quando a verificação do token falha', () => {
    req.header.mockReturnValue('Bearer invalid-token')
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token')
    })

    authMiddleware(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test-secret')
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido!' })
    expect(next).not.toHaveBeenCalled()
    expect(req.user).toBeUndefined()
  })
})
