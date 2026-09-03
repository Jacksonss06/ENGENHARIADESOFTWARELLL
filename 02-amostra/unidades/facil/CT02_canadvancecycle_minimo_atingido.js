/**
 * CT02 | Nível: Facil
 * Projeto-base: HidroWebnia API
 * Arquivo original: src/utils/cycleUtils.js
 * Alvo experimental: canAdvanceCycle - mínimo atingido
 *
 * Objetivo da unidade:
 * Verificar o comportamento quando o ciclo já atingiu o número mínimo de dias.
 *
 * IMPORTANTE:
 * - Este arquivo contém o CÓDIGO-FONTE a ser apresentado à LLM.
 * - Não contém casos de teste nem respostas esperadas.
 * - A geração dos testes será solicitada pelo prompt padronizado do experimento.
 */

const calculateDaysPassed = (startDate) => {
  const start = new Date(startDate)
  const today = new Date()

  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - start.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const canAdvanceCycle = (cycle, minDays = 15) => {
  const daysPassed = calculateDaysPassed(cycle.startDate)
  return daysPassed >= minDays
}

const advanceCycle = (cycle) => {
  cycle.currentCycle += 1
  cycle.startDate = new Date()
  cycle.daysPassed = 0
  cycle.manualAdvance = true
  return cycle
}

module.exports = {
  calculateDaysPassed,
  canAdvanceCycle,
  advanceCycle
}
