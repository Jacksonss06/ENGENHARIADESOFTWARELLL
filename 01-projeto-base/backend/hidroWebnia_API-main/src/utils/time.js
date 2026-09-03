class Timer {
    constructor(timeoutDuration = 5000) {
        this.startTime = null
        this.endTime = null
        this.timerActive = false
        this.inactiveTimeout = null
        this.timeoutDuration = timeoutDuration
        this.elapsedTime = 0 
    }

    start() {
        if (!this.timerActive) {
            this.startTime = new Date()
            this.timerActive = true
            console.log("Cronômetro iniciado.")
        }
    }

    stop() {
        if (this.timerActive) {
            this.endTime = new Date()
            this.elapsedTime += (this.endTime - this.startTime) / 1000
            this.timerActive = false
            console.log(`Cronômetro parado. Tempo ativo: ${this.formatTime(this.elapsedTime)}`)
            this.elapsedTime = 0
            return this.formatTime(this.elapsedTime)
        }
        return this.formatTime(this.elapsedTime)
    }

    getElapsedTime() {
        if (this.timerActive) {
            const now = new Date()
            const elapsed = this.elapsedTime + (now - this.startTime) / 1000
            return this.formatTime(elapsed)
        }
        return this.formatTime(this.elapsedTime)
    }

    resetInactiveTime(callback) {
        if (this.inactiveTimeout) {
            clearTimeout(this.inactiveTimeout)
        }

        this.inactiveTimeout = setTimeout(() => {
            console.log("ESP32 inativa. Parando o cronômetro...")
            callback()
        }, this.timeoutDuration)
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        return `${this.padTime(hours)}:${this.padTime(minutes)}:${this.padTime(secs)}`
    }

    padTime(time) {
        return time < 10 ? `0${time}` : time
    }
}

module.exports = Timer
