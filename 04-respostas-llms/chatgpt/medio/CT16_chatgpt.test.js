const {
  validateRegister,
  validateLogin,
} = require('./validationMiddleware');

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

  test('chama next quando os dados de cadastro são válidos', () => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@email.com',
        password: 'Senha123',
        confirmPassword: 'Senha123',
      },
    };

    validateRegister(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('aceita senha válida com caracteres especiais permitidos', () => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@email.com',
        password: 'Senha1@!',
        confirmPassword: 'Senha1@!',
      },
    };

    validateRegister(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test.each([
    {
      body: {
        email: 'usuario@email.com',
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
        email: 'usuario@email.com',
        confirmPassword: 'Senha123',
      },
      message: 'A senha é obrigatória!',
    },
    {
      body: {
        username: 'usuario',
        email: 'usuario@email.com',
        password: 'Senha123',
        confirmPassword: 'Outra123',
      },
      message: 'As senhas não conferem!',
    },
  ])('retorna 422 quando o cadastro é inválido: $message', ({ body, message }) => {
    validateRegister({ body }, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ msg: message });
    expect(next).not.toHaveBeenCalled();
  });

  test.each([
    'Senha1',
    'SomenteLetras',
    '12345678',
    'Senha 123',
    'Senha1#abc',
  ])('rejeita a senha inválida "%s"', (password) => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@email.com',
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
});

describe('validateLogin', () => {
  let res;
  let next;

  beforeEach(() => {
    res = createResponse();
    next = jest.fn();
  });

  test('chama next quando email e senha são informados', () => {
    const req = {
      body: {
        email: 'usuario@email.com',
        password: 'Senha123',
      },
    };

    validateLogin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('retorna 422 quando o email não é informado', () => {
    const req = {
      body: {
        password: 'Senha123',
      },
    };

    validateLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'O email é obrigatório!',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna 422 quando a senha não é informada', () => {
    const req = {
      body: {
        email: 'usuario@email.com',
      },
    };

    validateLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'A senha é obrigatória!',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
