const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  open: Boolean,
  title: {
    type: String,
    required: true
  },
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
    resource: [{
      type: String,
      enum: ['video', 'text'],
    }],
  }],
}, {
  timestamps: true,
})

module.exports = mongoose.model('Course', schema)
