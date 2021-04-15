const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  open: Boolean,
  title: {
    type: String,
    required: true
  },
  cover: String,
  description: String,
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
  quizzes: [{
    type: Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  topics: [{
    title: String,
    description: String,
    resources: [{
      type: Schema.Types.ObjectId,
      ref: 'Resource',
    }],
  }],
}, {
  timestamps: true,
})

module.exports = mongoose.model('Course', schema)
