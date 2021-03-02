const { gql, UserInputError } = require('apollo-server')
const axios = require('axios').default
const User = require('../model/user')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const typeDef = gql`
  type User {
    id: ID!
    type: String!
    username: String!
    password: String!
    wxId: String
  }
  extend type Query {
    users(type: Type): [User!]
    user(id: ID!): User
    me: User
  }
  extend type Mutation {
    createUser(input: CreateUserInput!): CreateUserPayload
    updateUser(input: UpdateUserInput!): UpdateUserPayload
    login(
      username: String!
      password: String!
    ): Token
    wxLogin(code: String!): Token
    bindWx(
      username: String!
      password: String!
      code: String!
    ): Token
  }
  input CreateUserInput {
    type: Type!
    username: String!
    password: String!
  }
  type CreateUserPayload {
    user: User
  }
  input UpdateUserInput {
    id: ID!
    username: String
    password: String
  }
  type UpdateUserPayload {
    user: User
  }
  enum Type {
    ADMIN
    TEACHER
    STUDENT
  }
`

const code2openid = async code => {
  const response = await axios({
    method: 'get',
    url: `https://api.weixin.qq.com/sns/jscode2session?appid=wx8349d9be7ef6554f&secret=277ad7b7bd808830761f654e8c0f5d71&js_code=${code}&grant_type=authorization_code`
  })
  return response.data.openid
}

const user2token = user => {
  const userForToken = {
    username: user.username,
    id: user._id
  }
  return { value: jwt.sign(userForToken, JWT_SECRET) }
}

const resolvers = {
  Query: {
    users: (parent, args) => {
      if (args.type) {
        return User.find({ type: args.type })
      }
      return User.find({ })
    },
    user: (parent, args) => User.findById(args.id),
    me: (parent, args, { currentUser }) => currentUser
  },
  Mutation: {
    createUser: async (root, args) => {
      const input = args.input
      const user = new User({
        type: input.type,
        username: input.username,
        password: input.password
      })
      try {
        const savedUser = await user.save()
        return { user: savedUser }
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    },
    updateUser: async (root, args) => {
      const input = args.input
      const newUser = await User.findByIdAndUpdate(input.id, input, { new: true })
      return { user: newUser }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username, password: args.password })
      if (!user) {
        throw new UserInputError('wrong credentials')
      }
      return user2token(user)
    },
    wxLogin: async (root, args) => {
      const openid = await code2openid(args.code)

      const user = await User.findOne({ wxId: openid })
      if (!user) {
        return null
      }
      return user2token(user)
    },
    bindWx: async (root, args) => {
      const openid = await code2openid(args.code)

      const filter = { username: args.username, password: args.password }
      const update = { wxId: openid }
console.log(update)
      const user = await User.findOneAndUpdate(filter, update, { new: true })
      if (!user) {
        throw new UserInputError('wrong credentials')
      }
      return user2token(user)
    }
  }
}

module.exports = {
  typeDef, resolvers
}