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

const schema = makeExecutableSchema({
  typeDefs: [ Query, date.typeDef, user.typeDef, course.typeDef, post.typeDef ],
  resolvers: [ date.resolvers, user.resolvers, course.resolvers, post.resolvers ]
})

module.exports = schema