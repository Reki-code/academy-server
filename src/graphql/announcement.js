const { gql } = require('apollo-server')
const Announcement = require('../model/announcement')
const User = require('../model/user')

const typeDef = gql`
  type Announcement {
    id: ID!
    title: String
    content: String
    author: User
    createdAt: Date
    forAll: Boolean
  }
  extend type Query {
    announcements(searchBy: AnnouncementInput!): [Announcement!]
  }
  input AnnouncementInput {
    limit: Int
  }
  extend type Mutation {
    createAnnouncemnt(input: CreateAnnouncementInput!): CreateAnnouncementPayload
    deleteAnnouncemnt(input: DeleteAnnouncementInput!): DeleteAnnouncementPayload
  }
  input CreateAnnouncementInput {
    title: String
    content: String
    forAll: Boolean
  }
  type CreateAnnouncementPayload {
    announcement: Announcement
  }
  input DeleteAnnouncementInput {
    id: ID
  }
  type DeleteAnnouncementPayload {
    announcement: Announcement
  }
`

const resolvers = {
  Query: {
    announcements: (root, args) => {
      const { limit } = args.searchBy
      return Announcement.find({ forAll: true }).limit(limit)
    },
  },
  Mutation: {
    createAnnouncemnt: async (root, args, { currentUser }) => {
      const input = args.input
      const announcement = new Announcement({
        title: input.title,
        content: input.content,
        author: currentUser.id,
        forAll: input.forAll,
      })
      const saved = await announcement.save()
      return { announcement: saved }
    },
    deleteAnnouncemnt: async (root, args) => {
      const id = args.input.id
      const deleted = await Announcement.findByIdAndDelete(id)
      return { announcement: deleted }
    },
  },
  Announcement: {
    author: (parent) => User.findById(parent.author),
  }
}

module.exports = {
  typeDef, resolvers
}