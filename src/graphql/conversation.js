const { gql } = require('apollo-server')
const Conversation = require('../model/conversation')
const User = require('../model/user')
const Message = require('../model/message')

const typeDef = gql`
  type Conversation {
    id: ID!
    participants: [User!]
    messages: [Message!]
    latestMessage: Message
  }
  extend type Query {
    conversation(id: ID, searchBy: ConversationInput): Conversation
  }
  input ConversationInput {
    participants: [String!]
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
  Query: {
    conversation: async (root, args) => {
      const { id, searchBy } = args
      if (id) {
        return Conversation.findById(args.id)
      }
      const { participants } = searchBy
      if (participants.length !== 2) return null
      const conversation = await Conversation.find({
        participants: {
          $size: participants.length,
          $all: participants,
        }
      })
      if (conversation[0]) {
        return conversation[0]
      }
      const newConversation = new Conversation({
        participants
      })
      const saved = await newConversation.save()
      return saved
    },
  },
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
    participants: (parent) => User.find({ '_id': { $in: parent.participants } }),
    messages: (parent) => Message.find({ conversation: parent.id }),
    latestMessage: (parent) => Message.findOne({ conversation: parent.id }, {}, { sort: { 'createdAt': -1 } }),
  }
}

module.exports = {
  typeDef, resolvers
}
