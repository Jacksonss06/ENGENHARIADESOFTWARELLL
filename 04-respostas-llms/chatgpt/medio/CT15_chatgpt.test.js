const path = require('path');

const {
  validateRegister,
} = require(path.join(
  process.cwd(),
  'src/middlewares/validationMiddleware'
));

const createResponseMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('validateRegister', () => {
  let res;
  let next;

  beforeEach(() => {
    res = createResponseMock();
    next = jest.fn();
  });

  test.each([
    ['não contém número', 'abcdefgh'],
    ['não contém letra', '12345678'],
    ['possui menos de 8 caracteres', 'Abc1234'],
    ['contém caractere não permitido', 'Abcdef1_'],
    ['contém espaço', 'Abc def1'],
    ['contém somente números e caracteres especiais', '1234567!'],
  ])('rejeita senha fraca quando %s', (_, password) => {
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

  test('aceita senha com exatamente 8 caracteres, letra, número e caractere especial permitido', () => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@email.com',
        password: 'Abcdef1!',
        confirmPassword: 'Abcdef1!',
      },
    };

    validateRegister(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('aceita senha válida sem caractere especial', () => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@email.com',
        password: 'Abcdef12',
        confirmPassword: 'Abcdef12',
      },
    };

    validateRegister(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('rejeita senha não informada antes de verificar a complexidade', () => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@email.com',
        password: '',
        confirmPassword: '',
      },
    };

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'A senha é obrigatória!',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejeita senhas diferentes antes de verificar a complexidade', () => {
    const req = {
      body: {
        username: 'usuario',
        email: 'usuario@email.com',
        password: 'senha',
        confirmPassword: 'outraSenha',
      },
    };

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'As senhas não conferem!',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
