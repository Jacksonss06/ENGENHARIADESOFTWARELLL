/**
 * CT10 | Nível: Facil
 * Projeto-base: HidroWebnia API
 * Arquivo original: src/utils/timeRange.js
 * Alvo experimental: getTimeRange - período inválido
 *
 * Objetivo da unidade:
 * Verificar o tratamento de um período não suportado.
 *
 * IMPORTANTE:
 * - Este arquivo contém o CÓDIGO-FONTE a ser apresentado à LLM.
 * - Não contém casos de teste nem respostas esperadas.
 * - A geração dos testes será solicitada pelo prompt padronizado do experimento.
 */

const getTimeRange = (period, targetDate) => {
    const date = targetDate ? new Date(targetDate) : new Date()
    if (targetDate && isNaN(date)) {
        throw new Error('Data inválida')
    }

    let start, end

    switch (period) {
        case 'dia':
            start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0))
            end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59))
            break
        case 'semana':
            const dayOfWeek = date.getUTCDay()
            const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - diffToMonday, 0, 0, 0))
            end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6, 23, 59, 59))
            break
        case 'mês':
            start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0))
            end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59))
            break
        default:
            throw new Error('Período inválido')
    }

    return { start, end }
}

module.exports = { getTimeRange }