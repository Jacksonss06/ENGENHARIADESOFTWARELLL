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
