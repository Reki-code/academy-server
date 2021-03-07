const { gql } = require('apollo-server')
const Message = require('../model/message')
const User = require('../model/user')

const typeDef = gql`
  type Message {
    id: ID!
    sender: User!
    content: String
    createdAt: Date
  }
  extend type Mutation {
    createMessage(input: CreateMessageInput!): CreateMessagePayload
  }
  input CreateMessageInput {
    conversation: String!
    sender: String!
    content: String
  }
  type CreateMessagePayload {
    message: Message
  }
`

const resolvers = {
  Mutation: {
    createMessage: async (root, args) => {
      const input = args.input
      const message = new Message(input)
      const saved = await message.save()
      return { message: saved }
    }
  },
  Message: {
    sender: (parent) => User.findById(parent.sender)
  }
}

module.exports = {
  typeDef, resolvers
}