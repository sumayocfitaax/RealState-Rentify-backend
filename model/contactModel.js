const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
  },
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    required: true
  },
  message: {
    type: String,
    required: true
  }
},{
  timestamps: true
})

module.exports = mongoose.model('contact', contactSchema)