/**
 * CT20 | Nível: Medio
 * Projeto-base: HidroWebnia API
 * Arquivo original: src/utils/timeManager.js
 * Alvo experimental: getTimerForDevice
 *
 * Objetivo da unidade:
 * Verificar o gerenciamento/reutilização de Timer por identificador de dispositivo.
 *
 * IMPORTANTE:
 * - Este arquivo contém o CÓDIGO-FONTE a ser apresentado à LLM.
 * - Não contém casos de teste nem respostas esperadas.
 * - A geração dos testes será solicitada pelo prompt padronizado do experimento.
 */

const Timer = require('./time')

const timers = {}

function getTimerForDevice(deviceId) {
    if (!timers[deviceId]) {
        timers[deviceId] = new Timer(3600 * 1000)
    }
    return timers[deviceId]
}

module.exports = { getTimerForDevice }
