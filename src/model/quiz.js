const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  title: String,
  questions: [{
    type: {
      type: String,
      enum: ['single', 'multiple', 'tureFalse', 'shortAnswer', 'cloze'],
    },
    content: {
      stem: String,
      options: [String],
    },
    answer: {
      single: String,
      multiple: [String],
      tureFalse: Boolean,
      shortAnswer: String,
    },
  }],
  dueDate: Date,
  submissions: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [{
      answer: {
        single: String,
        multiple: [String],
        tureFalse: Boolean,
        shortAnswer: String,
      },
    }],
    grade: Number,
  }]
})

module.exports = mongoose.model('Quiz', schema)
