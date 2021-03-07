const { gql } = require('apollo-server')
const Conversation = require('../model/conversation')
const User = require('../model/user')
const Message = require('../model/message')

const typeDef = gql`
  type Conversation {
    id: ID!
    participants: [User!]
    messages: [Message!]
  }
  extend type Mutation {
    createConversation(input: CreateConversationInput!): CreateConversationPayload
  }
  input CreateConversationInput {
    participants: [String!]
  }
  type CreateConversationPayload {
    conversation: Conversation
  }
`

const resolvers = {
  Mutation: {
    createConversation: async (root, args) => {
      const input = args.input
      const conversation = new Conversation({
        participants: input.participants
      })
      const saved = await conversation.save()
      return { conversation: saved }
    }
  },
  Conversation: {
    participants: (parent) => User.find({ '_id': { $in: parent.participants }}),
    messages: (parent) => Message.find({ conversation: parent.id })
  }
}

module.exports = {
  typeDef, resolvers
}
