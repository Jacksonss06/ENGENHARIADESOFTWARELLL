// Importações de Módulos e Configurações Iniciais

const express = require('express')
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const path = require('path')

// Configuração do Servidor

const app = express()
const api = require('./routes/index')
const http = require('http')
const server = http.createServer(app)
require('./config/socket')(server)

const dirname = path.resolve()

// Configuração de Middlewares

app.use(bodyParser.json())
app.use(cors())
app.use(express.json())
app.use('/api', api)
app.use('/uploads', express.static(path.join(dirname, '/uploads')))

// Rota Principal

app.get('/', (req, res) => {
  res.status(200).json({ msg: 'Bem Vindo a Nossa API!' })
})

// Configuração de Porta

const port = process.env.PORT

server.listen(port, () => {
  console.log('App is Running')
})

// Exportação do Servidor

module.exports = server