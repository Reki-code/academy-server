const { gql, UserInputError } = require('apollo-server')
const User = require('../model/user')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const typeDef = gql`
type User {
    id: ID!
    type: String!
    username: String!
    password: String!
  }
  extend type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }
  extend type Mutation {
    createUser(
      type: String!
      username: String!
      password: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
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
    me: (parent, args, { currentUser }) => currentUser
  },
  Mutation: {
    createUser: async (root, args) => {
      const user = new User({
        type: args.type,
        username: args.username,
        password: args.password
      })
      try {
        const savedUser = await user.save()
        return savedUser
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username, password: args.password })
      if (!user) {
        throw new UserInputError('wrong credentials')
      }
      const userForToken = {
        username: user.username,
        id: user._id
      }
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

module.exports = {
  typeDef, resolvers
}