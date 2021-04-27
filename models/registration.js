const mongoose = require('mongoose')

const registrationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  passwordHashed: {
    type: Boolean,
    default: true,
  },
  registeredAt: {
    type: Date,
    required: true,
  },
  lastSeen: {
    type: Date,
  },
})

module.exports = mongoose.model('userDetails', registrationSchema)
