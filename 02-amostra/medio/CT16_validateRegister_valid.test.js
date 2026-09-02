/** CT16 | Médio | validateRegister */
const { validateRegister } = require('../../hidroWebnia_API-main/src/middlewares/validationMiddleware')

describe('validateRegister', () => {
  test('chama next para cadastro válido', () => {
    const req = { body: { username: 'joao', email: 'a@b.com', password: 'abc12345', confirmPassword: 'abc12345' } }
    const next = jest.fn()
    validateRegister(req, {}, next)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
