const { getTimeRange } = require('./timeRange');

describe('getTimeRange', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        // Definindo uma data do sistema mockada: 2023-10-25T12:00:00.000Z (Quarta-feira)
        jest.setSystemTime(new Date('2023-10-25T12:00:00.000Z'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe('Período: semana', () => {
        it('deve retornar o intervalo de segunda a domingo para uma data no meio da semana (quarta-feira)', () => {
            const { start, end } = getTimeRange('semana', '2023-10-25T15:30:00Z');
            expect(start).toEqual(new Date('2023-10-23T00:00:00.000Z')); // Segunda-feira
            expect(end).toEqual(new Date('2023-10-29T23:59:59.000Z')); // Domingo
        });

        it('deve retornar o intervalo correto quando a data alvo já for segunda-feira (início da semana)', () => {
            const { start, end } = getTimeRange('semana', '2023-10-23T08:00:00Z');
            expect(start).toEqual(new Date('2023-10-23T00:00:00.000Z'));
            expect(end).toEqual(new Date('2023-10-29T23:59:59.000Z'));
        });

        it('deve retornar o intervalo correto quando a data alvo for domingo (fim da semana, limite superior)', () => {
            const { start, end } = getTimeRange('semana', '2023-10-29T20:00:00Z');
            expect(start).toEqual(new Date('2023-10-23T00:00:00.000Z'));
            expect(end).toEqual(new Date('2023-10-29T23:59:59.000Z'));
        });

        it('deve lidar corretamente com o intervalo semanal que atravessa a virada de um mês', () => {
            const { start, end } = getTimeRange('semana', '2023-11-01T12:00:00Z'); // Quarta-feira, 1º de novembro
            expect(start).toEqual(new Date('2023-10-30T00:00:00.000Z')); // Segunda-feira, 30 de outubro
            expect(end).toEqual(new Date('2023-11-05T23:59:59.000Z')); // Domingo, 5 de novembro
        });

        it('deve lidar corretamente com o intervalo semanal que atravessa a virada de um ano', () => {
            const { start, end } = getTimeRange('semana', '2023-12-31T12:00:00Z'); // Domingo, 31 de dezembro
            expect(start).toEqual(new Date('2023-12-25T00:00:00.000Z')); // Segunda-feira, 25 de dezembro
            expect(end).toEqual(new Date('2023-12-31T23:59:59.000Z')); // Domingo, 31 de dezembro
        });
    });

    describe('Período: dia', () => {
        it('deve retornar o intervalo de 24 horas (00:00:00 a 23:59:59) para o dia especificado', () => {
            const { start, end } = getTimeRange('dia', '2023-10-25T15:30:00Z');
            expect(start).toEqual(new Date('2023-10-25T00:00:00.000Z'));
            expect(end).toEqual(new Date('2023-10-25T23:59:59.000Z'));
        });
    });

    describe('Período: mês', () => {
        it('deve retornar o intervalo do primeiro ao último dia do mês especificado (mês com 31 dias)', () => {
            const { start, end } = getTimeRange('mês', '2023-10-25T15:30:00Z');
            expect(start).toEqual(new Date('2023-10-01T00:00:00.000Z'));
            expect(end).toEqual(new Date('2023-10-31T23:59:59.000Z'));
        });

        it('deve retornar o intervalo correto considerando meses com 30 dias', () => {
            const { start, end } = getTimeRange('mês', '2023-11-15T12:00:00Z');
            expect(start).toEqual(new Date('2023-11-01T00:00:00.000Z'));
            expect(end).toEqual(new Date('2023-11-30T23:59:59.000Z'));
        });

        it('deve retornar o intervalo correto para fevereiro em um ano bissexto', () => {
            const { start, end } = getTimeRange('mês', '2024-02-15T12:00:00Z');
            expect(start).toEqual(new Date('2024-02-01T00:00:00.000Z'));
            expect(end).toEqual(new Date('2024-02-29T23:59:59.000Z'));
        });
    });

    describe('Cenários sem data alvo definida', () => {
        it('deve calcular o intervalo utilizando a data atual do sistema caso targetDate seja omitido', () => {
            // Utilizando o mock de new Date() (2023-10-25T12:00:00.000Z)
            const { start, end } = getTimeRange('semana');
            expect(start).toEqual(new Date('2023-10-23T00:00:00.000Z'));
            expect(end).toEqual(new Date('2023-10-29T23:59:59.000Z'));
        });
    });

    describe('Casos de Erro', () => {
        it('deve lançar erro ("Data inválida") se for passada uma string não conversível em data', () => {
            expect(() => getTimeRange('dia', 'string-invalida')).toThrow('Data inválida');
        });

        it('deve lançar erro ("Período inválido") se o período não constar nos períodos esperados', () => {
            expect(() => getTimeRange('ano', '2023-10-25T12:00:00Z')).toThrow('Período inválido');
        });

        it('deve lançar erro ("Período inválido") se o período for omitido', () => {
            expect(() => getTimeRange(undefined, '2023-10-25T12:00:00Z')).toThrow('Período inválido');
        });
        
        it('deve lançar erro ("Período inválido") se o período for null', () => {
            expect(() => getTimeRange(null, '2023-10-25T12:00:00Z')).toThrow('Período inválido');
        });
    });
});
