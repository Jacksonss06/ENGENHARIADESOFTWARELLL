const { validateLogin } = require('./validationMiddleware');

describe('validateLogin', () => {
    let res;
    let next;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    test('retorna 422 quando a senha está ausente', () => {
        const req = {
            body: {
                email: 'usuario@example.com'
            }
        };

        validateLogin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'A senha é obrigatória!'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test.each([undefined, null, '', false, 0])(
        'retorna 422 quando a senha é %p',
        (password) => {
            const req = {
                body: {
                    email: 'usuario@example.com',
                    password
                }
            };

            validateLogin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'A senha é obrigatória!'
            });
            expect(next).not.toHaveBeenCalled();
        }
    );

    test('prioriza a validação do email quando email e senha estão ausentes', () => {
        const req = { body: {} };

        validateLogin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'O email é obrigatório!'
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('chama next quando email e senha são informados', () => {
        const req = {
            body: {
                email: 'usuario@example.com',
                password: 'senha123'
            }
        };

        validateLogin(req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
    });
});
