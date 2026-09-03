/** CT14 | Médio | validateRegister */
const { validateRegister } = require('../../hidroWebnia_API-main/src/middlewares/validationMiddleware')

describe('validateRegister', () => {
  test('rejeita confirmação de senha diferente', () => {
    const req = { body: { username: 'joao', email: 'a@b.com', password: 'abc12345', confirmPassword: 'abc99999' } }
    const json = jest.fn()
    const res = { status: jest.fn(() => ({ json })) }
    validateRegister(req, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(422)
    expect(json).toHaveBeenCalledWith({ msg: 'As senhas não conferem!' })
  })
})
