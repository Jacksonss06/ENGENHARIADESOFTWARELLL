const mongoose = require('mongoose')
const slug = require('slug')
const { Schema } = mongoose

const CycleSchema = new Schema({
    currentCycle: {type: Number, default: 1},
    startDate: {type: Date, default: Date.now()},
    daysPassed: {type: Number, default: 0},
    manualAdvance: {type: Boolean, default: false}
})

const deviceSchema = new Schema({
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    email: {type: String},
    image: {type: String},
    registrationDate: {type: Date, required: true, default: Date.now},
    espStatus: {type: Boolean, required: true, default: false},
    lastRequestTime: {type: Date},
    slug: {type: String, required: true, unique: true, default: function(){ return slug(this.name)}},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    desiredConductivity: {type: Number, required: true, default: 1.5},
    volume: {type: Number, required: true},
    measures: [{
        temperature: {type: Number},
        waterTemperature: {type: Number},
        waterFlux: {type: Boolean},
        containerLevel: {type: String},
        conductivity: {type: Number},
        humidity: {type: Number},
        luminosity: {type: Number},
        ph: {type: Number},
        uv: {type: Number},
        hour: {type: String},
        day: {type: String},
        timestamp: {type: Date, default: Date.now},
        onlineTime: {type: String},
        engineStatus: {type: Boolean},
        calcinit: { type: Number }, 
        dripsol: { type: Number },
        cycleDay: {type: Number, default: 1,},
        lastCycleUpdate: {type: Date, default: Date.now}
    }],
    cycles: [CycleSchema]

})

module.exports = mongoose.model('Devices', deviceSchema)