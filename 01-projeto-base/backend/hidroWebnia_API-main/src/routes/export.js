const router = require('express').Router()
const { authMiddleware } = require('../middlewares/authMiddleware')
require('../mongoDB/mongo')
const exportController = require('../controllers/exportController')


router.get('/csv/:deviceId/day', exportController.csvDay)
router.get('/csv/:deviceId/week', exportController.csvWeek)
router.get('/csv/:deviceId/month', exportController.csvMonth)
router.get('/pdf/:deviceId/day', exportController.pdfDay)
router.get('/pdf/:deviceId/week', exportController.pdfWeek)
router.get('/pdf/:deviceId/month', exportController.pdfMonth)
router.get('/csv/:deviceId/all', exportController.csvAll)
router.get('/pdf/:deviceId/all', exportController.pdfAll)

module.exports = router
