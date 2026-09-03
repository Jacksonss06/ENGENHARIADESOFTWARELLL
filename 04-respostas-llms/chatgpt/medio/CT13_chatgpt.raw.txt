const { validateRegister } = require('../src/middlewares/validationMiddleware');

describe('validateRegister', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            body: {
                username: 'usuario',
                email: 'usuario@email.com',
                password: 'senha123',
                confirmPassword: 'senha123'
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
    });

    test('retorna status 422 quando o username está ausente', () => {
        delete req.body.username;

        validateRegister(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'O nome é obrigatório!'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test.each([undefined, null, '', false])(
        'rejeita username com valor inválido: %p',
        (username) => {
            req.body.username = username;

            validateRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'O nome é obrigatório!'
            });
            expect(next).not.toHaveBeenCalled();
        }
    );

    test('retorna status 422 quando o email está ausente', () => {
        delete req.body.email;

        validateRegister(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'O email é obrigatório!'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('retorna status 422 quando a senha está ausente', () => {
        delete req.body.password;

        validateRegister(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'A senha é obrigatória!'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('retorna status 422 quando as senhas não conferem', () => {
        req.body.confirmPassword = 'outraSenha123';

        validateRegister(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'As senhas não conferem!'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test.each([
        '12345678',
        'abcdefgh',
        'abc123',
        'abc_12345'
    ])('rejeita senha fora dos requisitos: %s', (password) => {
        req.body.password = password;
        req.body.confirmPassword = password;

        validateRegister(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('chama next quando todos os dados são válidos', () => {
        validateRegister(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
