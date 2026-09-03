const { validateLogin, validateRegister } = require('./validationMiddleware');

describe('Validation Middlewares', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRegister', () => {
    it('deve retornar status 422 e mensagem de erro se o username estiver ausente', () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'O nome é obrigatório!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar status 422 e mensagem de erro se o username for uma string vazia', () => {
      req.body = {
        username: '',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'O nome é obrigatório!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar status 422 e mensagem de erro se o email estiver ausente', () => {
      req.body = {
        username: 'user123',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'O email é obrigatório!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar status 422 e mensagem de erro se a senha estiver ausente', () => {
      req.body = {
        username: 'user123',
        email: 'test@example.com',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'A senha é obrigatória!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar status 422 e mensagem de erro se as senhas não conferem', () => {
      req.body = {
        username: 'user123',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password321',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'As senhas não conferem!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar status 422 e mensagem de erro se a senha for muito curta', () => {
      req.body = {
        username: 'user123',
        email: 'test@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ 
        msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar status 422 e mensagem de erro se a senha não contiver número', () => {
      req.body = {
        username: 'user123',
        email: 'test@example.com',
        password: 'PasswordOnlyLetters',
        confirmPassword: 'PasswordOnlyLetters',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ 
        msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar status 422 e mensagem de erro se a senha não contiver letras', () => {
      req.body = {
        username: 'user123',
        email: 'test@example.com',
        password: '1234567890',
        confirmPassword: '1234567890',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ 
        msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve chamar o next() se todos os campos de registro forem válidos', () => {
      req.body = {
        username: 'user123',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      validateRegister(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateLogin', () => {
    it('deve retornar status 422 e mensagem de erro se o email estiver ausente', () => {
      req.body = {
        password: 'Password123',
      };

      validateLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'O email é obrigatório!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar status 422 e mensagem de erro se a senha estiver ausente', () => {
      req.body = {
        email: 'test@example.com',
      };

      validateLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'A senha é obrigatória!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve chamar o next() se todos os campos de login forem válidos', () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password123',
      };

      validateLogin(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
