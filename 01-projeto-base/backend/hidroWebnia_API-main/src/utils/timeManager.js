const Timer = require('./time')

const timers = {}

function getTimerForDevice(deviceId) {
    if (!timers[deviceId]) {
        timers[deviceId] = new Timer(3600 * 1000)
    }
    return timers[deviceId]
}

module.exports = { getTimerForDevice }
