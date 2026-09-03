/** CT13 | Médio | validateRegister */
const { validateRegister } = require('../../hidroWebnia_API-main/src/middlewares/validationMiddleware')

describe('validateRegister', () => {
  test('rejeita cadastro sem username', () => {
    const req = { body: { email: 'a@b.com', password: 'abc12345', confirmPassword: 'abc12345' } }
    const json = jest.fn()
    const res = { status: jest.fn(() => ({ json })) }
    validateRegister(req, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(422)
    expect(json).toHaveBeenCalledWith({ msg: 'O nome é obrigatório!' })
  })
})
