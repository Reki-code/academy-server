const { makeExecutableSchema, gql } = require("apollo-server")
const { mergeAll } = require('ramda')

const user = require('./user')
const wx = require('./wx')

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
  typeDefs: [ Query, user.typeDef, wx.typeDef ],
  resolvers: mergeAll([resolvers, user.resolvers, wx.resolvers])
})

module.exports = schema