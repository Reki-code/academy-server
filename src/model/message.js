const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  createdAt: Date
}, {
  timestamps: true
})

module.exports = mongoose.model('Message', schema)
