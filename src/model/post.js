const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  votes: [{
    voter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    vote: Number
  }],
  createdAt: Date,
  updatedAt: Date,
  // question only
  title: String,
  answers: [{
    type: Schema.Types.ObjectId,
    ref: 'Post',
  }],
  // answer only
  comments: [{
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  }]
}, {
  timestamps: true,
})

module.exports = mongoose.model('Post', schema)
