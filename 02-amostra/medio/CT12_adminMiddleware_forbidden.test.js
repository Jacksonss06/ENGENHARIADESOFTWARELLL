/** CT12 | Médio | adminMiddleware */
const adminMiddleware = require('../../hidroWebnia_API-main/src/middlewares/adminMiddleware')

describe('adminMiddleware', () => {
  test('retorna 403 para usuário não administrador', () => {
    const req = { user: { role: 'user' } }
    const json = jest.fn()
    const res = { status: jest.fn(() => ({ json })) }
    adminMiddleware(req, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ message: 'Acesso negado: Admins apenas.' })
  })
})
