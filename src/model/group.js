const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  name: String,
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  subGroups: [{
    type: Schema.Types.ObjectId,
    ref: 'Group',
  }]
})

module.exports = mongoose.model('Group', schema)
