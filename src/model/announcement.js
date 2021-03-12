const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  title: String,
  content: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  forAll: Boolean,
}, {
  timestamps: true
})

module.exports = mongoose.model('Announcement', schema)
