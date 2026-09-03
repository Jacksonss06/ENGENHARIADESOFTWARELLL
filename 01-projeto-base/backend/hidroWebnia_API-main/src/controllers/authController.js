const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../model/User')
const createTransporter = require('../config/nodemail')
const { blacklist } = require('../middlewares/authMiddleware')

exports.register = async (req, res) => {
    const { username, email, password, role} = req.body
    
    const userExists = await User.findOne({ username: username })
    
    if(userExists){
        return res.status(422).json({ msg: 'Por favor, utilize outro nome de Usuário' })
    }
    
    const emailExists = await User.findOne({ email: email })
    
    if(emailExists){
        return res.status(422).json({ msg: 'Por favor, utilize outro e-mail' })
    }
    
    
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)
    
    const user = new User({
        username,
        email,
        password: passwordHash,
        role: role || 'user'
    })
    
    try {
    
        await user.save()
    
        res.status(201).json({ msg: 'Usuário criado com sucesso!' })
            
    } catch (err) {
    
        console.log(err)
        res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde!' })
    
    }
}

exports.login = async (req, res) => {

    const { email, password } = req.body

    const user = await User.findOne({ email: email })

    if(!user){
        return res.status(404).json({ msg: 'Email não encontrado!' })
    }

    const checkPass = await bcrypt.compare(password, user.password)

    if(!checkPass){
        return res.status(422).json({ msg: 'Senha Inválida!' })
    }


    try {

        const secret = process.env.SECRET

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role

            }, 
            secret,
        )

        res.status(200).json({ msg: 'Autenticação realizada com sucesso!', token })
        
    } catch (err) {

        console.log(err)
        res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde!' })

    }

}

exports.getAllUsers = async (req, res) => {
    
    try {
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Acesso negado!' })
        }

        const users = await User.find().select('-password') 

        res.status(200).json(users)

    } catch (error) {
        console.error(err)
        res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde!' })
    }

}

exports.updateUser = async (req, res) => {
    try {
        const {id} = req.params
        const {username, email, role} = req.body

        const user = await User.findById(id)

        if(!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado!' })
        }

        user.username = username || user.username
        user.email = email || user.email
        user.role = role || user.role

        await user.save()

        res.status(200).json({ msg: 'Usuário atualizado com sucesso!' })
        
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: 'Erro ao atualizar usuário.' })
    }
}


exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado!' })
        }

        await user.deleteOne()

        res.status(200).json({ msg: 'Usuário deletado com sucesso!' })

    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: 'Erro ao excluir usuário.' })
    }
}



exports.logout = async (req, res) => {
    
    if (token) {
        blacklist.push(token)
    }

    res.status(200).json({ msg: 'Logout realizado com sucesso!' })

}

exports.forgot_password = async (req, res) => {

    const { email } = req.body

    if (!email){
        return res.status(422).json({ msg: 'O email é obrigatório!' })
    }

    const user = await User.findOne({ email: email })

    if(!user){
        return res.status(404).json({ msg: 'Email não encontrado!' })
    }

    const token = crypto.randomBytes(20).toString('hex')

    user.resetToken = token
    user.resetTime = Date.now() + 3600000

    await user.save()

    const mailOptions = {
        from: process.env.GMAIL_ACC,
        to: user.email,
        subject: 'Link para redefinir sua senha',
        text: `Você está recebendo este email porque solicitou a redefinição de senha para sua conta.\n\n
        Por favor, clique no link a seguir, ou cole-o em seu navegador para concluir o processo dentro de uma hora após o recebimento:\n\n
        https://hidrowebnia.onrender.com/reset-password/${token}\n\n
        Se você não solicitou isso, por favor, ignore este email.\n`,
    }

    try {

        const transporter = await createTransporter()
        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Erro ao enviar email:', err)
                return res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde!' })
            }
            res.status(200).json({ msg: 'Email de redefinição de senha enviado com sucesso!' })
        })

    } catch (err) {

        console.error('Erro ao criar o transportador:', err)
        res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde!' })

    }

}

exports.reset_password = async (req, res) => {

    const { token } = req.params
    const { password, confirmPassword } = req.body

    if(!password){
        return res.status(422).json({ msg: 'A senha é obrigatória!' })
    }

    if(password != confirmPassword){
        return res.status(422).json({ msg: 'As senhas não conferem!' })
    }

    const user = await User.findOne({
        resetToken: token,
        resetTime: { $gt: Date.now() },
    })

    if (!user) {
        return res.status(400).json({ msg: 'Token inválido ou expirado!' })
    }

    const salt = await bcrypt.genSalt(12)
    user.password = await bcrypt.hash(password, salt)
    user.resetToken = undefined
    user.resetTime = undefined

    await user.save()

    res.status(200).json({ msg: 'Senha redefinida com sucesso!' })

}

exports.schedule = async (req, res) => {

    const { name, phone, emailSchedule, address } = req.body

    const mailOptions = {
        from: process.env.GMAIL_ACC,
        to: process.env.GMAIL_ACC,
        subject: 'Solicitação de Agendamento de Monitoramento',
        text: `O usuário ${name} solicitou um agendamento de monitoramento.
        \nInformações de Contato:
        \nTelefone: ${phone}
        \nEmail: ${emailSchedule}
        \nEndereço: ${address}`,
    }

    try {

        const transporter = await createTransporter()
        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Erro ao enviar email:', err)
                return res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde!' })
            }
            res.status(200).json({ msg: 'Email de solicitação de agendamento enviado com sucesso!' })
        })

    } catch (err) {

        console.error('Erro ao criar o transportador:', err)
        res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde!' })

    }

}
