const { getTimeRange } = require('./timeRange');

describe('getTimeRange', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(Date.UTC(2023, 9, 15, 12, 0, 0))); // 15 de Outubro de 2023, 12:00:00 UTC
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe('Quando nenhum targetDate é fornecido', () => {
        it('deve utilizar a data atual do sistema para o período "dia"', () => {
            const { start, end } = getTimeRange('dia');
            expect(start).toEqual(new Date(Date.UTC(2023, 9, 15, 0, 0, 0)));
            expect(end).toEqual(new Date(Date.UTC(2023, 9, 15, 23, 59, 59)));
        });

        it('deve utilizar a data atual do sistema para o período "mês"', () => {
            const { start, end } = getTimeRange('mês');
            expect(start).toEqual(new Date(Date.UTC(2023, 9, 1, 0, 0, 0)));
            expect(end).toEqual(new Date(Date.UTC(2023, 9, 31, 23, 59, 59)));
        });
    });

    describe('Período: dia', () => {
        it('deve retornar o início e fim corretos para um dia específico', () => {
            const { start, end } = getTimeRange('dia', '2023-05-10T15:30:00Z');
            expect(start).toEqual(new Date(Date.UTC(2023, 4, 10, 0, 0, 0)));
            expect(end).toEqual(new Date(Date.UTC(2023, 4, 10, 23, 59, 59)));
        });
    });

    describe('Período: semana', () => {
        it('deve retornar o intervalo de segunda a domingo para uma data no meio da semana', () => {
            // 2023-10-18 é uma quarta-feira
            const { start, end } = getTimeRange('semana', '2023-10-18T10:00:00Z');
            expect(start).toEqual(new Date(Date.UTC(2023, 9, 16, 0, 0, 0))); // Segunda-feira, 16/10
            expect(end).toEqual(new Date(Date.UTC(2023, 9, 22, 23, 59, 59))); // Domingo, 22/10
        });

        it('deve retornar o intervalo correto quando a data alvo for um domingo', () => {
            // 2023-10-22 é um domingo (final da semana)
            const { start, end } = getTimeRange('semana', '2023-10-22T20:00:00Z');
            expect(start).toEqual(new Date(Date.UTC(2023, 9, 16, 0, 0, 0))); // Segunda-feira, 16/10
            expect(end).toEqual(new Date(Date.UTC(2023, 9, 22, 23, 59, 59))); // Domingo, 22/10
        });

        it('deve lidar corretamente com semanas que cruzam meses diferentes', () => {
            // 2023-11-01 é uma quarta-feira
            const { start, end } = getTimeRange('semana', '2023-11-01T12:00:00Z');
            expect(start).toEqual(new Date(Date.UTC(2023, 9, 30, 0, 0, 0))); // Segunda-feira, 30/10
            expect(end).toEqual(new Date(Date.UTC(2023, 10, 5, 23, 59, 59))); // Domingo, 05/11
        });
    });

    describe('Período: mês', () => {
        it('deve retornar o primeiro e último instante do mês para um mês normal', () => {
            const { start, end } = getTimeRange('mês', '2023-04-15T12:00:00Z');
            expect(start).toEqual(new Date(Date.UTC(2023, 3, 1, 0, 0, 0))); // 1º de Abril
            expect(end).toEqual(new Date(Date.UTC(2023, 3, 30, 23, 59, 59))); // 30 de Abril
        });

        it('deve lidar corretamente com anos bissextos (fevereiro com 29 dias)', () => {
            const { start, end } = getTimeRange('mês', '2024-02-10T12:00:00Z');
            expect(start).toEqual(new Date(Date.UTC(2024, 1, 1, 0, 0, 0)));
            expect(end).toEqual(new Date(Date.UTC(2024, 1, 29, 23, 59, 59)));
        });

        it('deve lidar corretamente com fevereiro em anos não bissextos (28 dias)', () => {
            const { start, end } = getTimeRange('mês', '2023-02-10T12:00:00Z');
            expect(start).toEqual(new Date(Date.UTC(2023, 1, 1, 0, 0, 0)));
            expect(end).toEqual(new Date(Date.UTC(2023, 1, 28, 23, 59, 59)));
        });

        it('deve lidar corretamente com a transição de final de ano (Dezembro)', () => {
            const { start, end } = getTimeRange('mês', '2023-12-25T12:00:00Z');
            expect(start).toEqual(new Date(Date.UTC(2023, 11, 1, 0, 0, 0)));
            expect(end).toEqual(new Date(Date.UTC(2023, 11, 31, 23, 59, 59)));
        });
    });

    describe('Casos de Erro', () => {
        it('deve lançar um erro "Data inválida" se o targetDate for uma string mal formatada', () => {
            expect(() => getTimeRange('dia', 'data-invalida-123')).toThrow('Data inválida');
        });

        it('deve lançar um erro "Data inválida" se o targetDate for NaN', () => {
            expect(() => getTimeRange('dia', NaN)).toThrow('Data inválida');
        });

        it('deve lançar um erro "Período inválido" se o período não for suportado', () => {
            expect(() => getTimeRange('ano', '2023-10-15T12:00:00Z')).toThrow('Período inválido');
        });

        it('deve lançar um erro "Período inválido" se o período for null ou undefined', () => {
            expect(() => getTimeRange(null, '2023-10-15T12:00:00Z')).toThrow('Período inválido');
            expect(() => getTimeRange(undefined, '2023-10-15T12:00:00Z')).toThrow('Período inválido');
        });
    });
});
