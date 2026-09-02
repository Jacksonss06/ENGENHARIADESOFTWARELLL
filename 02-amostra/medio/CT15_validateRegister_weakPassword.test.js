/** CT15 | Médio | validateRegister */
const { validateRegister } = require('../../hidroWebnia_API-main/src/middlewares/validationMiddleware')

describe('validateRegister', () => {
  test('rejeita senha sem letra e número com tamanho mínimo', () => {
    const req = { body: { username: 'joao', email: 'a@b.com', password: 'abcdefgh', confirmPassword: 'abcdefgh' } }
    const json = jest.fn()
    const res = { status: jest.fn(() => ({ json })) }
    validateRegister(req, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(422)
    expect(json).toHaveBeenCalledWith({ msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.' })
  })
})
