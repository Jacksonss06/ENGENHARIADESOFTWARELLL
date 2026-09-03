const path = require('path');

const {
  validateRegister,
  validateLogin,
} = require(path.join(
  process.cwd(),
  'src',
  'middlewares',
  'validationMiddleware'
));

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('validateRegister', () => {
  let res;
  let next;

  beforeEach(() => {
    res = createResponse();
    next = jest.fn();
  });

  test('retorna erro 422 quando password e confirmPassword são diferentes', () => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@example.com',
        password: 'Senha123',
        confirmPassword: 'Outra123',
      },
    };

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'As senhas não conferem!',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna erro quando confirmPassword não é informado', () => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@example.com',
        password: 'Senha123',
      },
    };

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'As senhas não conferem!',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test.each([
    {
      body: {
        email: 'usuario@example.com',
        password: 'Senha123',
        confirmPassword: 'Senha123',
      },
      message: 'O nome é obrigatório!',
    },
    {
      body: {
        username: 'usuario',
        password: 'Senha123',
        confirmPassword: 'Senha123',
      },
      message: 'O email é obrigatório!',
    },
    {
      body: {
        username: 'usuario',
        email: 'usuario@example.com',
        confirmPassword: 'Senha123',
      },
      message: 'A senha é obrigatória!',
    },
  ])('retorna erro para campo obrigatório ausente', ({ body, message }) => {
    validateRegister({ body }, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ msg: message });
    expect(next).not.toHaveBeenCalled();
  });

  test.each([
    'senhafraca',
    '12345678',
    'Senha1',
    'Senha_123',
  ])('rejeita senha inválida: %s', (password) => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@example.com',
        password,
        confirmPassword: password,
      },
    };

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('chama next quando os dados são válidos', () => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@example.com',
        password: 'Senha123',
        confirmPassword: 'Senha123',
      },
    };

    validateRegister(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe('validateLogin', () => {
  let res;
  let next;

  beforeEach(() => {
    res = createResponse();
    next = jest.fn();
  });

  test('retorna erro quando o email não é informado', () => {
    validateLogin({ body: { password: 'Senha123' } }, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'O email é obrigatório!',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna erro quando a senha não é informada', () => {
    validateLogin(
      { body: { email: 'usuario@example.com' } },
      res,
      next
    );

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'A senha é obrigatória!',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('chama next quando email e senha são informados', () => {
    validateLogin(
      {
        body: {
          email: 'usuario@example.com',
          password: 'Senha123',
        },
      },
      res,
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
