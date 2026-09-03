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