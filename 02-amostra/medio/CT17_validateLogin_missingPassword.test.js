/** CT17 | Médio | validateLogin */
const { validateLogin } = require('../../hidroWebnia_API-main/src/middlewares/validationMiddleware')

describe('validateLogin', () => {
  test('rejeita login sem senha', () => {
    const req = { body: { email: 'a@b.com' } }
    const json = jest.fn()
    const res = { status: jest.fn(() => ({ json })) }
    validateLogin(req, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(422)
    expect(json).toHaveBeenCalledWith({ msg: 'A senha é obrigatória!' })
  })
})
