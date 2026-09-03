const { validateLogin, validateRegister } = require('./validationMiddleware');

describe('Validation Middlewares', () => {
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

  describe('validateRegister', () => {
    it('deve retornar erro 422 se o username não for fornecido', () => {
      req.body = { email: 'teste@teste.com', password: 'Password1!', confirmPassword: 'Password1!' };
      
      validateRegister(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'O nome é obrigatório!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar erro 422 se o email não for fornecido', () => {
      req.body = { username: 'João', password: 'Password1!', confirmPassword: 'Password1!' };
      
      validateRegister(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'O email é obrigatório!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar erro 422 se a senha não for fornecida', () => {
      req.body = { username: 'João', email: 'teste@teste.com', confirmPassword: 'Password1!' };
      
      validateRegister(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'A senha é obrigatória!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar erro 422 se as senhas não conferirem', () => {
      req.body = { 
        username: 'João', 
        email: 'teste@teste.com', 
        password: 'Password1!', 
        confirmPassword: 'Password2@' 
      };
      
      validateRegister(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'As senhas não conferem!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar erro 422 se a senha for muito curta (menos de 8 caracteres)', () => {
      req.body = { 
        username: 'João', 
        email: 'teste@teste.com', 
        password: 'Pass1', 
        confirmPassword: 'Pass1' 
      };
      
      validateRegister(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar erro 422 se a senha não contiver números', () => {
      req.body = { 
        username: 'João', 
        email: 'teste@teste.com', 
        password: 'Password!', 
        confirmPassword: 'Password!' 
      };
      
      validateRegister(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar erro 422 se a senha não contiver letras', () => {
      req.body = { 
        username: 'João', 
        email: 'teste@teste.com', 
        password: '123456789!', 
        confirmPassword: '123456789!' 
      };
      
      validateRegister(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve chamar next() se todos os dados do registro forem válidos', () => {
      req.body = { 
        username: 'João', 
        email: 'teste@teste.com', 
        password: 'Password1!', 
        confirmPassword: 'Password1!' 
      };
      
      validateRegister(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('validateLogin', () => {
    it('deve retornar erro 422 se o email não for fornecido no login', () => {
      req.body = { password: 'Password1!' };
      
      validateLogin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'O email é obrigatório!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar erro 422 se a senha não for fornecida no login', () => {
      req.body = { email: 'teste@teste.com' };
      
      validateLogin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ msg: 'A senha é obrigatória!' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve chamar next() se as credenciais de login forem válidas', () => {
      req.body = { email: 'teste@teste.com', password: 'Password1!' };
      
      validateLogin(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
