const { makeExecutableSchema, gql } = require("apollo-server")
const { mergeAll } = require('ramda')

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

const resolvers = {}

const user = require('./user')
const course = require('./course')

const schema = makeExecutableSchema({
  typeDefs: [ Query, user.typeDef, course.typeDef ],
  resolvers: mergeAll([resolvers, user.resolvers, course.resolvers ])
})

module.exports = schema