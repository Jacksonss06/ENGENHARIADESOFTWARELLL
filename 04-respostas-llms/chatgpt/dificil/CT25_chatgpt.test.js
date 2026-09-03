jest.mock('bcryptjs', () => ({
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn()
}))

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}))

jest.mock('../src/model/User', () => {
    const User = jest.fn()
    User.findOne = jest.fn()
    return User
})

jest.mock('../src/config/nodemail', () => jest.fn())

jest.mock('../src/middlewares/authMiddleware', () => ({
    blacklist: []
}))

const bcrypt = require('bcryptjs')
const User = require('../src/model/User')
const { register } = require('../src/controllers/authController')

describe('authController.register', () => {
    let req
    let res
    let saveMock

    beforeEach(() => {
        jest.clearAllMocks()

        req = {
            body: {
                username: 'usuario',
                email: 'usuario@email.com',
                password: 'senha123',
                role: 'admin'
            }
        }

        res = {
            status: jest.fn(),
            json: jest.fn()
        }
        res.status.mockReturnValue(res)
        res.json.mockReturnValue(res)

        saveMock = jest.fn()
        User.mockImplementation(function (data) {
            Object.assign(this, data)
            this.save = saveMock
        })
    })

    it('interrompe o cadastro quando o username já existe', async () => {
        const existingUser = {
            _id: 'user-id',
            username: 'usuario'
        }
        User.findOne.mockResolvedValue(existingUser)

        await register(req, res)

        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({ username: 'usuario' })
        expect(res.status).toHaveBeenCalledWith(422)
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Por favor, utilize outro nome de Usuário'
        })
        expect(bcrypt.genSalt).not.toHaveBeenCalled()
        expect(bcrypt.hash).not.toHaveBeenCalled()
        expect(User).not.toHaveBeenCalled()
        expect(saveMock).not.toHaveBeenCalled()
    })

    it('interrompe o cadastro quando o email já existe', async () => {
        User.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                _id: 'user-id',
                email: 'usuario@email.com'
            })

        await register(req, res)

        expect(User.findOne).toHaveBeenCalledTimes(2)
        expect(User.findOne).toHaveBeenNthCalledWith(1, {
            username: 'usuario'
        })
        expect(User.findOne).toHaveBeenNthCalledWith(2, {
            email: 'usuario@email.com'
        })
        expect(res.status).toHaveBeenCalledWith(422)
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Por favor, utilize outro e-mail'
        })
        expect(bcrypt.genSalt).not.toHaveBeenCalled()
        expect(bcrypt.hash).not.toHaveBeenCalled()
        expect(User).not.toHaveBeenCalled()
        expect(saveMock).not.toHaveBeenCalled()
    })

    it('cadastra o usuário quando username e email não existem', async () => {
        User.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null)
        bcrypt.genSalt.mockResolvedValue('salt')
        bcrypt.hash.mockResolvedValue('password-hash')
        saveMock.mockResolvedValue(undefined)

        await register(req, res)

        expect(bcrypt.genSalt).toHaveBeenCalledWith(12)
        expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 'salt')
        expect(User).toHaveBeenCalledWith({
            username: 'usuario',
            email: 'usuario@email.com',
            password: 'password-hash',
            role: 'admin'
        })
        expect(saveMock).toHaveBeenCalledTimes(1)
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Usuário criado com sucesso!'
        })
    })

    it('utiliza a role padrão quando ela não é informada', async () => {
        delete req.body.role

        User.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null)
        bcrypt.genSalt.mockResolvedValue('salt')
        bcrypt.hash.mockResolvedValue('password-hash')
        saveMock.mockResolvedValue(undefined)

        await register(req, res)

        expect(User).toHaveBeenCalledWith({
            username: 'usuario',
            email: 'usuario@email.com',
            password: 'password-hash',
            role: 'user'
        })
        expect(res.status).toHaveBeenCalledWith(201)
    })

    it('retorna erro 500 quando não é possível salvar o usuário', async () => {
        const error = new Error('Falha ao salvar')
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

        User.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null)
        bcrypt.genSalt.mockResolvedValue('salt')
        bcrypt.hash.mockResolvedValue('password-hash')
        saveMock.mockRejectedValue(error)

        await register(req, res)

        expect(consoleSpy).toHaveBeenCalledWith(error)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Erro no servidor, tente novamente mais tarde!'
        })

        consoleSpy.mockRestore()
    })
})
