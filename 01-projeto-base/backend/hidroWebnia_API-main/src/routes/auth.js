const express = require('express')
const router = express.Router()
const { authMiddleware} = require('../middlewares/authMiddleware')
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware')
const authController = require('../controllers/authController')

// Rota de Registro

router.post('/register', validateRegister, authController.register)

// Rota de Usuários

router.get('/users', authMiddleware, authController.getAllUsers)

// Rota de Editar Usuários

router.patch('/users/:id', authMiddleware, authController.updateUser)

// Rota de Deletar Usuários

router.delete('/users/:id', authMiddleware, authController.deleteUser)

// Rota de Login

router.post('/login', validateLogin, authController.login)

// Rota de Logout

router.post('/logout', authMiddleware, authController.logout)


// Rotas de Redefinição de Senha

router.post('/reset-password', authController.forgot_password)
router.post('/reset-password/:token', authController.reset_password)

// Rota de Agendamento

router.post('/schedule', authController.schedule)

// Exportação da Rota

module.exports = router