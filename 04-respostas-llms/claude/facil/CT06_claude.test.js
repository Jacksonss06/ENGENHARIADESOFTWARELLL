const Timer = require('./time');

describe('Timer.padTime', () => {
    let timer;

    beforeEach(() => {
        timer = new Timer();
    });

    test('deve adicionar zero à esquerda quando o valor for menor que 10', () => {
        expect(timer.padTime(0)).toBe('00');
        expect(timer.padTime(1)).toBe('01');
        expect(timer.padTime(5)).toBe('05');
        expect(timer.padTime(9)).toBe('09');
    });

    test('não deve adicionar zero à esquerda quando o valor for igual a 10', () => {
        expect(timer.padTime(10)).toBe(10);
    });

    test('não deve adicionar zero à esquerda quando o valor for maior que 10', () => {
        expect(timer.padTime(11)).toBe(11);
        expect(timer.padTime(59)).toBe(59);
        expect(timer.padTime(100)).toBe(100);
    });

    test('deve tratar valores negativos como menores que 10 e adicionar zero à esquerda', () => {
        expect(timer.padTime(-1)).toBe('0-1');
        expect(timer.padTime(-5)).toBe('0-5');
    });

    test('deve retornar string com zero à esquerda quando o valor for exatamente 0', () => {
        expect(timer.padTime(0)).toBe('00');
    });
});

describe('Timer.formatTime (uso indireto de padTime)', () => {
    let timer;

    beforeEach(() => {
        timer = new Timer();
    });

    test('deve formatar corretamente tempos com horas, minutos e segundos menores que 10', () => {
        expect(timer.formatTime(3661)).toBe('01:01:01');
    });

    test('deve formatar corretamente tempo zero', () => {
        expect(timer.formatTime(0)).toBe('00:00:00');
    });

    test('deve formatar corretamente tempos com valores maiores ou iguais a 10', () => {
        expect(timer.formatTime(36000 + 600 + 30)).toBe('10:10:30');
    });

    test('deve formatar corretamente tempos com segundos fracionários truncados', () => {
        expect(timer.formatTime(59.9)).toBe('00:00:59');
    });
});
