const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  title: String,
  category: {
    type: String,
    enum: ['video', 'text', 'slides'],
  },
  content: String,
  url: String,
}, {
  timestamps: true,
})

module.exports = mongoose.model('Resource', schema)
