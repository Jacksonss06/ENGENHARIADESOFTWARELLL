/** CT19 | Médio | authMiddleware com mock de JWT */
jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }))
const jwt = require('jsonwebtoken')
const { authMiddleware } = require('../../hidroWebnia_API-main/src/middlewares/authMiddleware')

describe('authMiddleware', () => {
  test('decodifica token, popula req.user e chama next', () => {
    process.env.SECRET = 'segredo'
    jwt.verify.mockReturnValue({ id: 'u1', role: 'admin' })
    const req = { header: jest.fn(() => 'Bearer token-valido') }
    const next = jest.fn()
    authMiddleware(req, {}, next)
    expect(jwt.verify).toHaveBeenCalledWith('token-valido', 'segredo')
    expect(req.user).toEqual({ id: 'u1', role: 'admin' })
    expect(next).toHaveBeenCalledTimes(1)
  })
})
