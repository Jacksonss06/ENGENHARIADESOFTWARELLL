const { validateRegister, validateLogin } = require('./validationMiddleware');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('validateRegister', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = mockResponse();
    next = jest.fn();
  });

  test('deve retornar 422 se username não for informado', () => {
    req.body = { email: 'test@test.com', password: 'Senha123', confirmPassword: 'Senha123' };
    validateRegister(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ msg: 'O nome é obrigatório!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve retornar 422 se email não for informado', () => {
    req.body = { username: 'user', password: 'Senha123', confirmPassword: 'Senha123' };
    validateRegister(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ msg: 'O email é obrigatório!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve retornar 422 se password não for informado', () => {
    req.body = { username: 'user', email: 'test@test.com', confirmPassword: 'Senha123' };
    validateRegister(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ msg: 'A senha é obrigatória!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve retornar 422 se as senhas não conferem', () => {
    req.body = {
      username: 'user',
      email: 'test@test.com',
      password: 'Senha123',
      confirmPassword: 'Senha1234',
    };
    validateRegister(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ msg: 'As senhas não conferem!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve retornar 422 se a senha for fraca - somente letras', () => {
    req.body = {
      username: 'user',
      email: 'test@test.com',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    };
    validateRegister(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve retornar 422 se a senha for fraca - somente números', () => {
    req.body = {
      username: 'user',
      email: 'test@test.com',
      password: '12345678',
      confirmPassword: '12345678',
    };
    validateRegister(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve retornar 422 se a senha for menor que 8 caracteres', () => {
    req.body = {
      username: 'user',
      email: 'test@test.com',
      password: 'Abc123',
      confirmPassword: 'Abc123',
    };
    validateRegister(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve chamar next() quando todos os dados forem válidos', () => {
    req.body = {
      username: 'user',
      email: 'test@test.com',
      password: 'Senha123',
      confirmPassword: 'Senha123',
    };
    validateRegister(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('deve aceitar senha com caracteres especiais permitidos', () => {
    req.body = {
      username: 'user',
      email: 'test@test.com',
      password: 'Senha1@23',
      confirmPassword: 'Senha1@23',
    };
    validateRegister(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('validateLogin', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = mockResponse();
    next = jest.fn();
  });

  test('deve retornar 422 se email não for informado', () => {
    req.body = { password: 'Senha123' };
    validateLogin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ msg: 'O email é obrigatório!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve retornar 422 se password não for informado', () => {
    req.body = { email: 'test@test.com' };
    validateLogin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ msg: 'A senha é obrigatória!' });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve chamar next() quando email e password forem informados', () => {
    req.body = { email: 'test@test.com', password: 'Senha123' };
    validateLogin(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
