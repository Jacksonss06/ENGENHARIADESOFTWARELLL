# HidroWebnia API

API de monitoramento e controle de sistemas hidropônicos, desenvolvida para gerenciar dispositivos IoT e coletar dados em tempo real.

## 🚀 Tecnologias

- Node.js
- Express
- MongoDB
- Socket.IO
- MQTT
- JWT Authentication
- Docker
- Google APIs (Gmail)

## 📋 Pré-requisitos

- Node.js (versão LTS recomendada)
- MongoDB
- Docker e Docker Compose (opcional)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/hidroWebnia_API.git
cd hidroWebnia_API
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.sample .env
```
Edite o arquivo `.env` com suas configurações.

4. Inicie o projeto:

**Usando Docker:**
```bash
docker-compose up
```

**Localmente:**
```bash
npm run backend
```

## 📊 Funcionalidades

### Monitoramento em Tempo Real
- Temperatura do ambiente e da água
- Umidade
- Luminosidade
- Radiação UV
- pH da solução nutritiva
- Condutividade elétrica (EC)
- Fluxo de água
- Nível do reservatório
- Status do motor

### Recursos
- Autenticação JWT
- Comunicação em tempo real via Socket.IO
- Protocolo MQTT para dispositivos IoT
- Exportação de dados
- Geração de relatórios em PDF
- Notificações por email
- Upload de imagens
- Monitoramento de status dos dispositivos

## 🔐 Variáveis de Ambiente

```env
DB_USER=seu_usuario
DB_PASS=sua_senha
PORT=3080
SECRET=seu_secret_jwt
GMAIL_CLIENTID=seu_client_id
GMAIL_CLIENTSECRET=seu_client_secret
GMAIL_RFRESHTOKEN=seu_refresh_token
GMAIL_ACCESSTOKEN=seu_access_token
```

## 📁 Estrutura do Projeto

```
src/
├── config/         # Configurações do projeto
├── controllers/    # Controladores da aplicação
├── middlewares/    # Middlewares
├── model/         # Modelos do MongoDB
├── mongoDB/       # Configuração do MongoDB
├── routes/        # Rotas da API
└── utils/         # Utilitários
```

## 🔌 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Recuperação de senha
- `POST /api/auth/reset-password` - Redefinição de senha

### Dispositivos
- `GET /api/devices` - Lista todos os dispositivos
- `POST /api/devices` - Cria novo dispositivo
- `GET /api/devices/:id` - Obtém detalhes de um dispositivo
- `PUT /api/devices/:id` - Atualiza um dispositivo
- `DELETE /api/devices/:id` - Remove um dispositivo

### Medidas
- `GET /api/devices/:id/measures` - Obtém medidas de um dispositivo
- `POST /api/devices/:id/measures` - Registra novas medidas

### Exportação
- `GET /api/export` - Exporta dados em CSV
- `GET /api/export/pdf` - Gera relatório em PDF

## 🔒 Segurança

- Autenticação JWT
- CORS habilitado
- Senhas criptografadas com bcrypt
- Proteção contra ataques comuns
- Validação de dados

## 📦 Dependências Principais

- express: ^4.19.2
- mongoose: ^8.9.5
- socket.io: ^4.7.5
- mqtt: ^5.10.1
- jsonwebtoken: ^9.0.2
- nodemailer: ^6.9.13
- pdfkit: ^0.16.0

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para [hidrowebnia@gmail.com] 