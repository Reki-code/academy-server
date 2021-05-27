const { gql, UserInputError } = require('apollo-server')
const axios = require('axios').default
const User = require('../model/user')
const Post = require('../model/post')
const Conversation = require('../model/conversation')
const Enrollment = require('../model/enrollment')
const Course = require('../model/course')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const typeDef = gql`
  type User {
    id: ID!
    displayName: String!
    avatar: String!
    type: String!
    username: String!
    password: String!
    wxId: String
    questions: [Post!]
    conversations: [Conversation!]
    courseEnrolled: [Course!]
    courseTeache: [Course!]
    favorite: Favorite
  }
  type Favorite {
    questions: [Post!]
  }
  extend type Query {
    users(searchBy: UserInput!): [User!]
    user(id: ID!): User
    me: User
    countTeacher: Int
    countStudent: Int
  }
  input UserInput {
    type: Type
  }
  extend type Mutation {
    createUser(input: CreateUserInput!): CreateUserPayload
    updateUser(input: UpdateUserInput!): UpdateUserPayload
    changePassword(input: ChangePasswordInput!): ChangePasswordPayload
    deleteUser(input: DeleteUserInput!): DeleteUserPayload
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
    favorite(input: FavoriteInput!): FavoritePayload
    unFavorite(input: UnFavoriteInput!): UnFavoritePayload
  }
  input CreateUserInput {
    type: Type!
    displayName: String
    username: String!
    password: String!
  }
  type CreateUserPayload {
    user: User
  }
  input UpdateUserInput {
    id: ID!
    displayName: String
    username: String
    password: String
  }
  type UpdateUserPayload {
    user: User
  }
  input ChangePasswordInput {
    old: String!
    new: String!
  }
  type ChangePasswordPayload {
    user: User
    success: Boolean
  }
  input DeleteUserInput {
    id: ID!
  }
  type DeleteUserPayload {
    user: User
  }
  enum Type {
    ADMIN
    TEACHER
    STUDENT
  }
  input FavoriteInput {
    type: String!
    id: String
  }
  type FavoritePayload {
    user: User
  }
  input UnFavoriteInput {
    type: String!
    id: String
  }
  type UnFavoritePayload {
    user: User
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
    users: (parent, args) => User.find(args.searchBy),
    user: (parent, args) => User.findById(args.id),
    me: (parent, args, { currentUser }) => currentUser,
    countTeacher: (parent) => User.find({ type: 'TEACHER' }).count(),
    countStudent: (parent) => User.find({ type: 'STUDENT' }).count(),
  },
  Mutation: {
    createUser: async (root, args) => {
      const { type, displayName, username, password } = args.input
      const user = new User({ type, displayName, username, password })
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
    changePassword: async (root, args, { currentUser }) => {
      const input = args.input
      const user = await User.findById(currentUser.id)
      if (user.password === input.old) {
        const updated = await User.findByIdAndUpdate(
          currentUser.id,
          { password: input.new },
          { new: true }
        )
        return { success: true, user: updated }
      } else {
        return { success: false }
      }
    },
    deleteUser: async (root, args) => {
      const user = await User.findByIdAndRemove(args.input.id)
      return { user }
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
      const user = await User.findOneAndUpdate(filter, update, { new: true })
      if (!user) {
        throw new UserInputError('wrong credentials')
      }
      return user2token(user)
    },
    favorite: async (root, args, { currentUser }) => {
      const { type, id } = args.input
      const key = `favorite.${type}`
      const savedUser = await User.findByIdAndUpdate(
        currentUser.id,
        { $push: { [key]: id } },
        { new: true },
      )
      return { user: savedUser }
    },
    unFavorite: async (root, args, { currentUser }) => {
      const { type, id } = args.input
      const key = `favorite.${type}`
      const savedUser = await User.findByIdAndUpdate(
        currentUser.id,
        { $pull: { [key]: id } },
        { new: true },
      )
      return { user: savedUser }
    },
  },
  User: {
    displayName: (parent) => parent.displayName ?? parent.username,
    avatar: (parent) => parent.avatar ?? 'https://avatars.githubusercontent.com/u/32997723?s=460&u=ebb97e29c0bc717c30aa61b99f75520bebe73aa2&v=4',
    questions: (parent) => Post.find({ author: parent.id, title: { $ne: null } }),
    conversations: (parent) => Conversation.find({ participants: parent.id }),
    courseEnrolled: async (parent) => {
      const enrollments = await Enrollment.
        find({ userEnrolled: parent.id }).
        populate('courseEnrolled')
      return enrollments.map(enrollment => enrollment.courseEnrolled)
    },
    courseTeache: (parent) => Course.find({ teacher: parent.id }),
  },
  Favorite: {
    questions: (parent) => Post.find({ _id: { $in: parent.questions } }),
  },
}

module.exports = {
  typeDef, resolvers
}