const adminMiddleware = require('./adminMiddleware')

describe('adminMiddleware', () => {
    let req
    let res
    let next

    beforeEach(() => {
        req = {}
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
        next = jest.fn()
    })

    test('deve chamar next quando o usuário for administrador', () => {
        req.user = { role: 'admin' }

        const result = adminMiddleware(req, res, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).not.toHaveBeenCalled()
        expect(result).toBeUndefined()
    })

    test('deve negar acesso quando o usuário não estiver presente', () => {
        const result = adminMiddleware(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Acesso negado: Admins apenas.'
        })
        expect(result).toBe(res)
    })

    test('deve negar acesso quando o usuário não for administrador', () => {
        req.user = { role: 'user' }

        adminMiddleware(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledTimes(1)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Acesso negado: Admins apenas.'
        })
    })

    test.each([
        undefined,
        null,
        '',
        'Admin',
        'ADMIN',
        false,
        0
    ])('deve negar acesso para o papel %p', role => {
        req.user = { role }

        adminMiddleware(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Acesso negado: Admins apenas.'
        })
    })
})
