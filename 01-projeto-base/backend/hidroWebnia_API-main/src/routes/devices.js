// Importações de Módulos

const router = require('express').Router()
const upload = require('../config/multer')
const { authMiddleware } = require('../middlewares/authMiddleware')
const devicesController = require('../controllers/devicesController')

// Rota para retorna todos as hidroponias cadastrados

router.get('/', authMiddleware, devicesController.getAllDevices)

// Rota para retornar os detalhes de uma hidroponia

router.get('/detalhes/:id', authMiddleware, devicesController.getOneDevice)

// Rota para atualizar os dados de uma hidroponia

router.patch('/:id', authMiddleware, upload.single('image'), devicesController.updateDevice)

// Rota para criar uma nova hidroponia

router.post('/', authMiddleware, upload.single('image'), devicesController.addDevice)

// Rota para deletar uma hidroponia

router.delete('/:id', authMiddleware, devicesController.deleteDevices)

// Rota para receber dados da Esp32

router.put('/:id', devicesController.receiveESP32Data)

router.get('/:id/graphics', authMiddleware, devicesController.getGraphicsData)

router.post('/:deviceId/next', authMiddleware, devicesController.cycleDevices)

// Exportação da Rota

module.exports = router
