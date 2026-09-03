const jwt = require('jsonwebtoken');
const { authMiddleware, blacklist } = require('./authMiddleware');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            header: jest.fn()
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        process.env.SECRET = 'test_secret';
        
        blacklist.length = 0;
        jest.clearAllMocks();
    });

    describe('Token ausente ou malformado', () => {
        it('deve retornar status 401 e mensagem "Acesso negado!" quando o cabeçalho Authorization não for enviado', () => {
            req.header.mockReturnValue(undefined);

            authMiddleware(req, res, next);

            expect(req.header).toHaveBeenCalledWith('Authorization');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Acesso negado!' });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar status 401 e mensagem "Acesso negado!" quando o cabeçalho Authorization for uma string vazia', () => {
            req.header.mockReturnValue('');

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Acesso negado!' });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar status 401 e mensagem "Acesso negado!" quando o cabeçalho Authorization contiver apenas "Bearer "', () => {
            req.header.mockReturnValue('Bearer ');

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Acesso negado!' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Validação de blacklist', () => {
        it('deve retornar status 401 e mensagem "Token inválido!" se o token estiver na blacklist', () => {
            const token = 'token_bloqueado';
            req.header.mockReturnValue(`Bearer ${token}`);
            blacklist.push(token);

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido!' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Validação do token com JWT', () => {
        it('deve chamar next() e popular req.user quando o token for válido', () => {
            const token = 'token_valido';
            const decodedPayload = { id: 1, role: 'admin' };
            
            req.header.mockReturnValue(`Bearer ${token}`);
            jwt.verify.mockReturnValue(decodedPayload);

            authMiddleware(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.SECRET);
            expect(req.user).toEqual(decodedPayload);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('deve retornar status 401 e mensagem "Token inválido!" se jwt.verify lançar um erro', () => {
            const token = 'token_invalido';
            
            req.header.mockReturnValue(`Bearer ${token}`);
            jwt.verify.mockImplementation(() => {
                throw new Error('jwt malformed');
            });

            authMiddleware(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.SECRET);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido!' });
            expect(next).not.toHaveBeenCalled();
        });
    });
});
