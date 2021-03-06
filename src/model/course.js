const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  title: {
    type: String,
    required: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }]
})

module.exports = mongoose.model('Course', schema)
