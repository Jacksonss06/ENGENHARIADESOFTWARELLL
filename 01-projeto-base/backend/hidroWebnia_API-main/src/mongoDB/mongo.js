// Importação do Moongoose

const mongoose = require('mongoose')

// Variaveis de ambiente para o usuário e senha do banco de dados

const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS

// Conexão com o banco de dados

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@test.7ts2zqd.mongodb.net/?retryWrites=true&w=majority&appName=Test`)
    .then(() => {
        console.log('Conectado ao MongoDB')
    })
    .catch(err => console.error(err))

// Exportação do Mongoose    

module.exports = mongoose