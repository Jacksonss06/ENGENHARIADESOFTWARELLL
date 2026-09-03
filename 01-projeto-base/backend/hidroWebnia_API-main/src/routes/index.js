// Importações de Módulos

const router = require('express').Router()
const Devices = require('../model/Devices')
require('../mongoDB/mongo')

// Rotas da Hidroponia e Autenticação

const devices = require('./devices')
const auth = require('./auth')
const exportt = require('./export')
const graphics = require('./graphics')

router.use('/devices', devices)
router.use('/auth', auth)
router.use('/export', exportt)
router.use('/graphics', graphics)

// Rota Principal

router.get('/', (req, res) => {
    res.json({
        sucess:true
    })
})

// Exportação da Rota

module.exports = router