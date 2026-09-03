jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    genSalt: jest.fn(),
    hash: jest.fn()
}))

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}))

jest.mock('../model/User', () => ({
    findOne: jest.fn()
}))

jest.mock('../config/nodemail', () => jest.fn())

jest.mock('../middlewares/authMiddleware', () => ({
    blacklist: []
}))

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../model/User')
const { login } = require('./authController')

describe('authController.login', () => {
    const originalSecret = process.env.SECRET

    const createResponse = () => {
        const res = {
            status: jest.fn(),
            json: jest.fn()
        }

        res.status.mockReturnValue(res)
        res.json.mockReturnValue(res)

        return res
    }

    beforeEach(() => {
        jest.clearAllMocks()
        process.env.SECRET = 'test-secret'
    })

    afterAll(() => {
        if (originalSecret === undefined) {
            delete process.env.SECRET
        } else {
            process.env.SECRET = originalSecret
        }
    })

    it('autentica o usuário e retorna um token JWT', async () => {
        const user = {
            _id: 'user-id-123',
            email: 'usuario@example.com',
            password: 'hashed-password',
            role: 'admin'
        }
        const req = {
            body: {
                email: 'usuario@example.com',
                password: 'valid-password'
            }
        }
        const res = createResponse()

        User.findOne.mockResolvedValue(user)
        bcrypt.compare.mockResolvedValue(true)
        jwt.sign.mockReturnValue('generated-jwt-token')

        await login(req, res)

        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({
            email: 'usuario@example.com'
        })
        expect(bcrypt.compare).toHaveBeenCalledTimes(1)
        expect(bcrypt.compare).toHaveBeenCalledWith(
            'valid-password',
            'hashed-password'
        )
        expect(jwt.sign).toHaveBeenCalledTimes(1)
        expect(jwt.sign).toHaveBeenCalledWith(
            {
                id: 'user-id-123',
                role: 'admin'
            },
            'test-secret'
        )
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Autenticação realizada com sucesso!',
            token: 'generated-jwt-token'
        })
    })

    it('retorna 404 quando o email não é encontrado', async () => {
        const req = {
            body: {
                email: 'inexistente@example.com',
                password: 'password'
            }
        }
        const res = createResponse()

        User.findOne.mockResolvedValue(null)

        await login(req, res)

        expect(User.findOne).toHaveBeenCalledWith({
            email: 'inexistente@example.com'
        })
        expect(bcrypt.compare).not.toHaveBeenCalled()
        expect(jwt.sign).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Email não encontrado!'
        })
    })

    it('retorna 422 quando a senha é inválida', async () => {
        const user = {
            _id: 'user-id-123',
            password: 'hashed-password',
            role: 'user'
        }
        const req = {
            body: {
                email: 'usuario@example.com',
                password: 'invalid-password'
            }
        }
        const res = createResponse()

        User.findOne.mockResolvedValue(user)
        bcrypt.compare.mockResolvedValue(false)

        await login(req, res)

        expect(bcrypt.compare).toHaveBeenCalledWith(
            'invalid-password',
            'hashed-password'
        )
        expect(jwt.sign).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(422)
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Senha Inválida!'
        })
    })

    it('retorna 500 quando ocorre erro ao gerar o token', async () => {
        const error = new Error('JWT generation failed')
        const user = {
            _id: 'user-id-123',
            password: 'hashed-password',
            role: 'user'
        }
        const req = {
            body: {
                email: 'usuario@example.com',
                password: 'valid-password'
            }
        }
        const res = createResponse()
        const consoleSpy = jest
            .spyOn(console, 'log')
            .mockImplementation(() => {})

        User.findOne.mockResolvedValue(user)
        bcrypt.compare.mockResolvedValue(true)
        jwt.sign.mockImplementation(() => {
            throw error
        })

        await login(req, res)

        expect(consoleSpy).toHaveBeenCalledWith(error)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Erro no servidor, tente novamente mais tarde!'
        })

        consoleSpy.mockRestore()
    })
})
