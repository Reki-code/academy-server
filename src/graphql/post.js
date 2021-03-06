const { gql, UserInputError } = require('apollo-server')
const Post = require('../model/post')
const User = require('../model/user')
const Course = require('../model/course')

const typeDef = gql`
  type Post {
    id: ID!
    content: String!
    author: User!
    votes: [Vote!]
    title: String
    answers: [Post!]
    comments: [Comment!]
    createdAt: Date
    updatedAt: Date
  }
  type Vote {
    voter: User,
    voterId: String
    vote: Int
  }
  type Comment {
    content: String,
    author: User
  }
  extend type Query {
    posts(searchBy: PostInput!): [Post!]
    post(id: ID!): Post
  }
  input PostInput {
    id: String
    authorId: String
  }
  extend type Mutation {
    createPost(input: CreatePostInput!): CreatePostPayload
    updatePost(input: UpdatePostInput!): UpdatePOstPayload
  }
  input CreatePostInput {
    title: String
    authorId: String
    content: String
  }
  type CreatePostPayload {
    post: Post
  }
  input UpdatePostInput {
    id: ID!
    content: String
    title: String
  }
  type UpdatePOstPayload {
    post: Post
  }
`

const resolvers = {
  Query: {
    posts: (root, args) => Post.find(args.searchBy)
        .populate('author')
        .populate('answers')
        .populate('comments.author'),
    post: (root, args) => Post.findById(args.id)
        .populate('author')
        .populate('answers')
        .populate('comments.author'),
  },
  Mutation: {
    createPost: async (root, args) => {
      const input = args.input
      const post = new Post({
        title: input.title,
        author: input.authorId,
        content: input.content
      })
      try {
        const savedPost = await post.save()
        return { post: savedPost }
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    },
    updatePost: async (root, args) => {
      const input = args.input
      const newPost = await Course
        .findByIdAndUpdate(input.id, input, { new: true })
      return { post: newPost }
    }
  },
  Vote: {
    voterId: (parent) => parent.voter,
    voter: (parent) => User.findById(parent.voter)
  }
}

module.exports = {
  typeDef, resolvers
}