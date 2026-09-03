const Timer = require('./time');

describe('Timer Class', () => {
    let timer;
    let consoleSpy;

    beforeEach(() => {
        timer = new Timer();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        jest.useRealTimers();
    });

    describe('formatTime', () => {
        it('deve formatar 0 segundos corretamente', () => {
            expect(timer.formatTime(0)).toBe('00:00:00');
        });

        it('deve formatar segundos (menos de 1 minuto) corretamente', () => {
            expect(timer.formatTime(45)).toBe('00:00:45');
            expect(timer.formatTime(59)).toBe('00:00:59');
        });

        it('deve formatar minutos e segundos corretamente', () => {
            expect(timer.formatTime(60)).toBe('00:01:00');
            expect(timer.formatTime(65)).toBe('00:01:05');
            expect(timer.formatTime(3599)).toBe('00:59:59');
        });

        it('deve formatar horas, minutos e segundos corretamente', () => {
            expect(timer.formatTime(3600)).toBe('01:00:00');
            expect(timer.formatTime(3665)).toBe('01:01:05');
            expect(timer.formatTime(7322)).toBe('02:02:02');
            expect(timer.formatTime(36000)).toBe('10:00:00');
        });

        it('deve lidar com valores decimais de segundos arredondando para baixo', () => {
            expect(timer.formatTime(61.9)).toBe('00:01:01');
            expect(timer.formatTime(120.5)).toBe('00:02:00');
        });

        it('deve formatar corretamente valores muito grandes de tempo', () => {
            expect(timer.formatTime(359999)).toBe('99:59:59');
        });
    });

    describe('padTime', () => {
        it('deve adicionar zero à esquerda para números menores que 10', () => {
            expect(timer.padTime(0)).toBe('00');
            expect(timer.padTime(5)).toBe('05');
            expect(timer.padTime(9)).toBe('09');
        });

        it('não deve adicionar zero à esquerda para números maiores ou iguais a 10', () => {
            expect(timer.padTime(10)).toBe(10);
            expect(timer.padTime(59)).toBe(59);
        });
    });

    describe('Ciclo de vida (start, getElapsedTime, stop)', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
        });

        it('deve iniciar o cronômetro corretamente', () => {
            timer.start();
            expect(timer.timerActive).toBe(true);
            expect(timer.startTime).toEqual(new Date('2023-01-01T12:00:00Z'));
            expect(consoleSpy).toHaveBeenCalledWith('Cronômetro iniciado.');
        });

        it('não deve iniciar o cronômetro novamente se já estiver ativo', () => {
            timer.start();
            consoleSpy.mockClear();
            
            jest.setSystemTime(new Date('2023-01-01T12:00:05Z'));
            timer.start();
            
            expect(consoleSpy).not.toHaveBeenCalled();
            expect(timer.startTime).toEqual(new Date('2023-01-01T12:00:00Z'));
        });

        it('deve retornar 00:00:00 ao consultar tempo decorrido sem iniciar', () => {
            expect(timer.getElapsedTime()).toBe('00:00:00');
        });

        it('deve calcular o tempo decorrido enquanto estiver ativo', () => {
            timer.start();
            jest.advanceTimersByTime(5000); // 5 segundos
            expect(timer.getElapsedTime()).toBe('00:00:05');

            jest.advanceTimersByTime(60000); // +1 minuto
            expect(timer.getElapsedTime()).toBe('00:01:05');
        });

        it('deve parar o cronômetro, logar o tempo ativo e zerar o elapsedTime retornado', () => {
            timer.start();
            jest.advanceTimersByTime(15000); // 15 segundos
            
            const result = timer.stop();
            
            expect(timer.timerActive).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Cronômetro parado. Tempo ativo: 00:00:15');
            expect(result).toBe('00:00:00'); // Conforme implementação original
            expect(timer.getElapsedTime()).toBe('00:00:00');
        });

        it('deve retornar 00:00:00 ao parar o cronômetro se já estiver inativo', () => {
            const result = timer.stop();
            expect(result).toBe('00:00:00');
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });

    describe('resetInactiveTime', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        it('deve chamar o callback e logar inatividade após o tempo limite', () => {
            const callback = jest.fn();
            timer = new Timer(5000);
            
            timer.resetInactiveTime(callback);
            
            expect(callback).not.toHaveBeenCalled();
            
            jest.advanceTimersByTime(4999);
            expect(callback).not.toHaveBeenCalled();
            
            jest.advanceTimersByTime(1);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith('ESP32 inativa. Parando o cronômetro...');
        });

        it('deve reiniciar o tempo limite se for chamado novamente antes do tempo expirar', () => {
            const callback = jest.fn();
            timer = new Timer(5000);
            
            timer.resetInactiveTime(callback);
            jest.advanceTimersByTime(3000);
            
            // Reseta o tempo limite
            timer.resetInactiveTime(callback);
            
            jest.advanceTimersByTime(3000);
            // Total passado: 6000ms. Mas como foi resetado no meio, o callback não deve ter sido chamado ainda.
            expect(callback).not.toHaveBeenCalled();
            
            jest.advanceTimersByTime(2000);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
});
