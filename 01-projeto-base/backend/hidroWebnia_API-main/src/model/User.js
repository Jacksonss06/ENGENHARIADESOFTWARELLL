const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {
        type: String,
        enum: ['user', 'premium', 'admin'],
        default: 'user'
    },
    resetToken: {type: String},
    resetTime: {type: Date},
    name: {type: String,},
    phone: {type: String},
    emailSchedule: {type: String},
    address: {type: String}
})

module.exports = mongoose.model('User', userSchema)