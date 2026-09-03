const Timer = require('./time');

describe('Timer.formatTime', () => {
  let timer;

  beforeEach(() => {
    timer = new Timer();
  });

  test('deve formatar 0 segundos como 00:00:00', () => {
    expect(timer.formatTime(0)).toBe('00:00:00');
  });

  test('deve formatar segundos menores que 1 minuto corretamente', () => {
    expect(timer.formatTime(5)).toBe('00:00:05');
    expect(timer.formatTime(59)).toBe('00:00:59');
  });

  test('deve formatar exatamente 1 minuto como 00:01:00', () => {
    expect(timer.formatTime(60)).toBe('00:01:00');
  });

  test('deve formatar minutos e segundos corretamente', () => {
    expect(timer.formatTime(125)).toBe('00:02:05');
    expect(timer.formatTime(3599)).toBe('00:59:59');
  });

  test('deve formatar exatamente 1 hora como 01:00:00', () => {
    expect(timer.formatTime(3600)).toBe('01:00:00');
  });

  test('deve formatar horas, minutos e segundos corretamente', () => {
    expect(timer.formatTime(3661)).toBe('01:01:01');
    expect(timer.formatTime(7325)).toBe('02:02:05');
  });

  test('deve formatar valores acima de 10 horas sem padding', () => {
    expect(timer.formatTime(36000)).toBe('10:00:00');
    expect(timer.formatTime(360000)).toBe('100:00:00');
  });

  test('deve truncar valores decimais de segundos', () => {
    expect(timer.formatTime(65.9)).toBe('00:01:05');
    expect(timer.formatTime(3600.5)).toBe('01:00:00');
  });

  test('deve aplicar padding em valores de hora, minuto e segundo menores que 10', () => {
    expect(timer.formatTime(3661)).toBe('01:01:01');
    expect(timer.formatTime(9)).toBe('00:00:09');
    expect(timer.formatTime(540)).toBe('00:09:00');
  });

  test('deve lidar com valor negativo de segundos', () => {
    const result = timer.formatTime(-10);
    expect(typeof result).toBe('string');
  });

  test('deve formatar valores grandes de segundos corretamente', () => {
    expect(timer.formatTime(86400)).toBe('24:00:00');
    expect(timer.formatTime(90061)).toBe('25:01:01');
  });
});

describe('Timer.padTime', () => {
  let timer;

  beforeEach(() => {
    timer = new Timer();
  });

  test('deve adicionar zero à esquerda para valores menores que 10', () => {
    expect(timer.padTime(0)).toBe('00');
    expect(timer.padTime(5)).toBe('05');
    expect(timer.padTime(9)).toBe('09');
  });

  test('não deve adicionar zero à esquerda para valores maiores ou iguais a 10', () => {
    expect(timer.padTime(10)).toBe(10);
    expect(timer.padTime(59)).toBe(59);
    expect(timer.padTime(100)).toBe(100);
  });
});

describe('Timer - integração com formatTime via getElapsedTime', () => {
  let timer;
  let consoleLogSpy;

  beforeEach(() => {
    timer = new Timer();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });

  test('deve retornar tempo formatado 00:00:00 quando o timer não está ativo', () => {
    expect(timer.getElapsedTime()).toBe('00:00:00');
  });

  test('deve retornar tempo formatado corretamente quando o timer está ativo', () => {
    const mockStartDate = new Date('2023-01-01T00:00:00Z');
    const mockNowDate = new Date('2023-01-01T00:01:05Z');

    jest.spyOn(global, 'Date')
      .mockImplementationOnce(() => mockStartDate)
      .mockImplementationOnce(() => mockNowDate);

    timer.start();
    const result = timer.getElapsedTime();
    expect(result).toBe('00:01:05');
  });
});

describe('Timer - integração com formatTime via stop', () => {
  let timer;
  let consoleLogSpy;

  beforeEach(() => {
    timer = new Timer();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });

  test('deve retornar 00:00:00 ao parar timer inativo', () => {
    expect(timer.stop()).toBe('00:00:00');
  });

  test('deve resetar elapsedTime para 0 e retornar 00:00:00 após parar timer ativo', () => {
    const mockStartDate = new Date('2023-01-01T00:00:00Z');
    const mockEndDate = new Date('2023-01-01T00:02:00Z');

    jest.spyOn(global, 'Date')
      .mockImplementationOnce(() => mockStartDate)
      .mockImplementationOnce(() => mockEndDate);

    timer.start();
    const result = timer.stop();
    expect(result).toBe('00:00:00');
    expect(timer.elapsedTime).toBe(0);
    expect(timer.timerActive).toBe(false);
  });
});
