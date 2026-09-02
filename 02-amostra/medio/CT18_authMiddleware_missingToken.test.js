/** CT18 | Médio | authMiddleware */
const { authMiddleware } = require('../../hidroWebnia_API-main/src/middlewares/authMiddleware')

describe('authMiddleware', () => {
  test('retorna 401 quando Authorization não existe', () => {
    const req = { header: jest.fn(() => undefined) }
    const json = jest.fn()
    const res = { status: jest.fn(() => ({ json })) }
    authMiddleware(req, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ msg: 'Acesso negado!' })
  })
})
