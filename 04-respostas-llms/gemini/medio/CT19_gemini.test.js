const jwt = require('jsonwebtoken');
const { authMiddleware, blacklist } = require('./authMiddleware');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    process.env.SECRET = 'test_secret';
    
    // Clear the blacklist before each test
    blacklist.length = 0;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar status 401 e "Acesso negado!" se nenhum token for fornecido', () => {
    req.header.mockReturnValue(undefined);

    authMiddleware(req, res, next);

    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Acesso negado!' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() e preencher req.user quando o token for válido', () => {
    const token = 'token_valido';
    const decodedPayload = { id: 1, email: 'teste@teste.com' };
    
    req.header.mockReturnValue(`Bearer ${token}`);
    jwt.verify.mockReturnValue(decodedPayload);

    authMiddleware(req, res, next);

    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.SECRET);
    expect(req.user).toEqual(decodedPayload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('deve retornar status 401 e "Token inválido!" se o token estiver na blacklist', () => {
    const token = 'token_na_blacklist';
    blacklist.push(token);
    
    req.header.mockReturnValue(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido!' });
    expect(next).not.toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('deve retornar status 401 e "Token inválido!" se a verificação do jwt falhar', () => {
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

  it('deve processar corretamente o token mesmo se o prefixo "Bearer " não estiver presente', () => {
    const token = 'token_sem_prefixo';
    const decodedPayload = { id: 2 };
    
    req.header.mockReturnValue(token);
    jwt.verify.mockReturnValue(decodedPayload);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.SECRET);
    expect(req.user).toEqual(decodedPayload);
    expect(next).toHaveBeenCalled();
  });
});
