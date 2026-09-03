const { Server } = require('socket.io')
const mongoose = require('../mongoDB/mongo')
const Devices = require('../model/Devices')

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
  })

mongoose.connection.once('open', () => {

  const deviceChangeStream = Devices.watch()
  
  deviceChangeStream.on('change', async (change) => {
    console.log('Mudança detectada:', change)
  
    if (change.operationType === 'update') {
      const updatedDevice = await Devices.findById(change.documentKey._id)
      io.emit('deviceUpdated', updatedDevice)
    }
      
  })
})
}
