const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: String,
  avatar: String,
  wxId: {
    type: String
  },
  favorite: {
    questions: [{
      type: mongoose.Types.ObjectId,
      ref: 'Post',
    }],
  }
})

module.exports = mongoose.model('User', schema)