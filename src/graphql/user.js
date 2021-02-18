const { gql } = require('apollo-server')

const typeDef = gql`
  extend type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }
  type User {
    id: ID!
    username: String!
  }
`

const resolvers = {
  Query: {
    users: () => [],
    user: (parent, args) => {
      return {
        username: 'Name',
        id: args.id
      }
    },
    me: () => {
      return {
        username: 'Root',
        id: '0'
      }
    }
  }
}

module.exports = {
  typeDef, resolvers
}