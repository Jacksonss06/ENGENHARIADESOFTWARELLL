const adminMiddleware = require('../src/middlewares/adminMiddleware');

describe('adminMiddleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('permite o acesso quando o usuário é administrador', () => {
    req.user = { role: 'admin' };

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('nega o acesso quando o usuário não é administrador', () => {
    req.user = { role: 'user' };

    const result = adminMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Acesso negado: Admins apenas.',
    });
    expect(result).toBe(res);
  });

  it('nega o acesso quando não existe usuário na requisição', () => {
    const result = adminMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Acesso negado: Admins apenas.',
    });
    expect(result).toBe(res);
  });

  it.each([
    null,
    undefined,
    '',
    'Admin',
    'ADMIN',
    'moderator',
    false,
    0,
  ])('nega o acesso para o papel inválido %p', (role) => {
    req.user = { role };

    adminMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Acesso negado: Admins apenas.',
    });
  });
});
