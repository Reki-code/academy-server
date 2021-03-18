const { makeExecutableSchema, gql } = require("apollo-server")

const Query = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Token {
    value: String!
  }
`

const date = require('./scalar/date')
const user = require('./user')
const course = require('./course')
const post = require('./post')
const conversation = require('./conversation')
const message = require('./message')
const announcement = require('./announcement')
const group = require('./group')

const schema = makeExecutableSchema({
  typeDefs: [
    Query,
    date.typeDef,
    user.typeDef,
    course.typeDef,
    post.typeDef,
    conversation.typeDef,
    message.typeDef,
    announcement.typeDef,
    group.typeDef,
  ],
  resolvers: [
    date.resolvers,
    user.resolvers,
    course.resolvers,
    post.resolvers,
    conversation.resolvers,
    message.resolvers,
    announcement.resolvers,
    group.resolvers,
  ]
})

module.exports = schema