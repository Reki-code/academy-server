const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  userEnrolled: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  courseEnrolled: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  createdAt: Date,
  updatedAt: Date,
}, {
  timestamps: true,
})

module.exports = mongoose.model('Enrollment', schema)
