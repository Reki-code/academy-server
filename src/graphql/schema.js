const { makeExecutableSchema, gql } = require("apollo-server")
const { mergeAll } = require('ramda')

const user = require('./user')

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

const resolvers = { }

const schema = makeExecutableSchema({
  typeDefs: [ Query, user.typeDef ],
  resolvers: mergeAll([resolvers, user.resolvers])
})

module.exports = schema