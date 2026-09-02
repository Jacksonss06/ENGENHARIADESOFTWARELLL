/** CT11 | Médio | adminMiddleware */
const adminMiddleware = require('../../hidroWebnia_API-main/src/middlewares/adminMiddleware')

describe('adminMiddleware', () => {
  test('permite acesso para usuário admin', () => {
    const req = { user: { role: 'admin' } }
    const res = {}
    const next = jest.fn()
    adminMiddleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
