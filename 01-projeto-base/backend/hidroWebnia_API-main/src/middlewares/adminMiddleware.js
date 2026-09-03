function adminMiddleware(req, res, next) {
    if (req.user &&  req.user.role == 'admin') {
        return next()
    }
    return res.status(403).json({ message: 'Acesso negado: Admins apenas.' })
}

module.exports = adminMiddleware