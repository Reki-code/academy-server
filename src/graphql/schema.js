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

const user = require('./user')
const course = require('./course')

const schema = makeExecutableSchema({
  typeDefs: [ Query, user.typeDef, course.typeDef ],
  resolvers: [ user.resolvers, course.resolvers ]
})

module.exports = schema