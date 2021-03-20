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
  }],
  announcements: [{
    type: Schema.Types.ObjectId,
    ref: 'Announcement'
  }],
  quizs: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
})

module.exports = mongoose.model('Course', schema)
