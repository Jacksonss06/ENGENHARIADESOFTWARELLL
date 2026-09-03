const { validateLogin, validateRegister } = require('./validationMiddleware');

describe('Validation Middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateLogin', () => {
        it('deve chamar next() quando email e senha são fornecidos', () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            validateLogin(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('deve retornar erro 422 quando o email estiver ausente', () => {
            req.body = {
                password: 'password123'
            };

            validateLogin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({ msg: 'O email é obrigatório!' });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar erro 422 quando a senha estiver ausente (Alvo experimental)', () => {
            req.body = {
                email: 'test@example.com'
            };

            validateLogin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({ msg: 'A senha é obrigatória!' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('validateRegister', () => {
        it('deve chamar next() quando todos os dados válidos são fornecidos', () => {
            req.body = {
                username: 'user123',
                email: 'test@example.com',
                password: 'Password123',
                confirmPassword: 'Password123'
            };

            validateRegister(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('deve retornar erro 422 quando o username estiver ausente', () => {
            req.body = {
                email: 'test@example.com',
                password: 'Password123',
                confirmPassword: 'Password123'
            };

            validateRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({ msg: 'O nome é obrigatório!' });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar erro 422 quando o email estiver ausente', () => {
            req.body = {
                username: 'user123',
                password: 'Password123',
                confirmPassword: 'Password123'
            };

            validateRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({ msg: 'O email é obrigatório!' });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar erro 422 quando a senha estiver ausente', () => {
            req.body = {
                username: 'user123',
                email: 'test@example.com',
                confirmPassword: 'Password123'
            };

            validateRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({ msg: 'A senha é obrigatória!' });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar erro 422 quando password e confirmPassword não conferem', () => {
            req.body = {
                username: 'user123',
                email: 'test@example.com',
                password: 'Password123',
                confirmPassword: 'Password321'
            };

            validateRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({ msg: 'As senhas não conferem!' });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar erro 422 quando a senha for fraca (sem número)', () => {
            req.body = {
                username: 'user123',
                email: 'test@example.com',
                password: 'PasswordWeak',
                confirmPassword: 'PasswordWeak'
            };

            validateRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({ msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.' });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar erro 422 quando a senha for curta (< 8 caracteres)', () => {
            req.body = {
                username: 'user123',
                email: 'test@example.com',
                password: 'Pass1',
                confirmPassword: 'Pass1'
            };

            validateRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({ msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.' });
            expect(next).not.toHaveBeenCalled();
        });
    });
});
