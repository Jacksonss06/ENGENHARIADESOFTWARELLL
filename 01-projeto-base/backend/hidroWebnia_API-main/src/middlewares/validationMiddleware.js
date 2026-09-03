const validateRegister = (req, res, next) => {

    const { username, email, password, confirmPassword } = req.body

    if (!username) return res.status(422).json({ msg: 'O nome é obrigatório!' })
    if (!email) return res.status(422).json({ msg: 'O email é obrigatório!' })
    if (!password) return res.status(422).json({ msg: 'A senha é obrigatória!' })
    if (password !== confirmPassword) return res.status(422).json({ msg: 'As senhas não conferem!' })

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(422).json({ msg: 'A senha deve conter pelo menos uma letra, um número e ter no mínimo 8 caracteres.' })
    }

    next()

}

const validateLogin = (req, res, next) => {

    const {email, password} = req.body

    if(!email) return res.status(422).json({msg: 'O email é obrigatório!'})
    if (!password) return res.status(422).json({ msg: 'A senha é obrigatória!' })

    next()

}

module.exports = {validateLogin, validateRegister}

