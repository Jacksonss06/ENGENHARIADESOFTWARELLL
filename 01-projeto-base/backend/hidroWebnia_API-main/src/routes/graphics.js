const express = require('express')
const router = express.Router()
const graphicsController = require('../controllers/graphicsController')

router.get('/measures/:id/day', graphicsController.getDayMeasures)
router.get('/measures/:id/week', graphicsController.getWeekMeasures)
router.get('/measures/:id/month', graphicsController.getMonthMeasures)
router.get('/measures/:id/period', graphicsController.getCustomPeriodMeasures)

module.exports = router
