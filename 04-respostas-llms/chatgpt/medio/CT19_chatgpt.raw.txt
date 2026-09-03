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
    blacklist.splice(0, blacklist.length)
    process.env.SECRET = 'test-secret'

    req = {
      header: jest.fn()
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    next = jest.fn()
    jest.clearAllMocks()
  })

  afterAll(() => {
    delete process.env.SECRET
  })

  it('decodifica um token válido, preenche req.user e chama next', () => {
    const decoded = {
      id: 'user-123',
      email: 'user@example.com'
    }

    req.header.mockReturnValue('Bearer valid-token')
    jwt.verify.mockReturnValue(decoded)

    authMiddleware(req, res, next)

    expect(req.header).toHaveBeenCalledWith('Authorization')
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret')
    expect(req.user).toEqual(decoded)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('retorna 401 quando o cabeçalho de autorização não existe', () => {
    req.header.mockReturnValue(undefined)

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Acesso negado!' })
    expect(jwt.verify).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 401 quando o token Bearer está vazio', () => {
    req.header.mockReturnValue('Bearer ')

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Acesso negado!' })
    expect(jwt.verify).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 401 quando o token está na blacklist', () => {
    blacklist.push('blocked-token')
    req.header.mockReturnValue('Bearer blocked-token')

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido!' })
    expect(jwt.verify).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 401 quando a verificação do token lança um erro', () => {
    req.header.mockReturnValue('Bearer invalid-token')
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid signature')
    })

    authMiddleware(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test-secret')
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido!' })
    expect(next).not.toHaveBeenCalled()
    expect(req.user).toBeUndefined()
  })

  it('aceita o token mesmo sem o prefixo Bearer', () => {
    const decoded = { id: 'user-456' }

    req.header.mockReturnValue('raw-token')
    jwt.verify.mockReturnValue(decoded)

    authMiddleware(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith('raw-token', 'test-secret')
    expect(req.user).toBe(decoded)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
