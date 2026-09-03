/**
 * CT18 | Nível: Medio
 * Projeto-base: HidroWebnia API
 * Arquivo original: src/middlewares/authMiddleware.js
 * Alvo experimental: authMiddleware - token ausente
 *
 * Objetivo da unidade:
 * Verificar o comportamento quando o cabeçalho Authorization não contém token.
 *
 * IMPORTANTE:
 * - Este arquivo contém o CÓDIGO-FONTE a ser apresentado à LLM.
 * - Não contém casos de teste nem respostas esperadas.
 * - A geração dos testes será solicitada pelo prompt padronizado do experimento.
 */

const jwt = require('jsonwebtoken')
const blacklist = []

const authMiddleware = (req, res, next) => {

    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
        return res.status(401).json({ msg: 'Acesso negado!' })
    }

    if (blacklist.includes(token)) {
        return res.status(401).json({ msg: 'Token inválido!' })
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET)
        req.user = decoded
        next()
    } catch (err) {
        res.status(401).json({ msg: 'Token inválido!' })
    }

}

module.exports = { authMiddleware, blacklist }