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
const wx = require('./wx')

const schema = makeExecutableSchema({
  typeDefs: [ Query, user.typeDef, wx.typeDef ],
  resolvers: mergeAll([resolvers, user.resolvers, wx.resolvers])
})

module.exports = schema