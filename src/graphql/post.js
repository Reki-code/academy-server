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
    vote: Int
    title: String
    answers: [Post!]
    answerCount: Int
    comments: [Comment!]
    createdAt: Date
    updatedAt: Date
    isFavorite: Boolean
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
    questionAddAnswer(input: QuestionAddAnswerInput!): QuestionAddAnswerPayload
    postAddComment(input: PostAddCommentInput!): PostAddCommentPayload
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
  input QuestionAddAnswerInput {
    questionId: String!
    answer: String
  }
  type QuestionAddAnswerPayload {
    question: Post
    answer: Post
  }
  input PostAddCommentInput {
    postId: String!
    comment: String
    author: String
  }
  type PostAddCommentPayload {
    post: Post
  }
`

const resolvers = {
  Query: {
    posts: (root, args) => Post.find(args.searchBy),
    post: (root, args) => Post.findById(args.id),
  },
  Mutation: {
    createPost: async (root, args, { currentUser }) => {
      const input = args.input
      const post = new Post({
        title: input.title,
        author: input.authorId ?? currentUser.id,
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
    },
    questionAddAnswer: async (root, args, { currentUser }) => {
      const input = args.input
      const answerPost = new Post({
        author: currentUser.id,
        content: input.answer,
      })
      const answer = await answerPost.save()
      const question = await Post.findByIdAndUpdate(
        input.questionId,
        { $push: { answers: answer.id }},
        { new: true }
      )
      return { question, answer }
    },
    postAddComment: async (root, args) => {
      const input = args.input
      const comment = {
        author: input.author,
        content: input.comment
      }
      const newPost = await Post.findByIdAndUpdate(
        input.postId,
        { $push: { comments: comment } },
        { new: true }
      )
      return { post: newPost }
    }
  },
  Post: {
    author: (parent) => User.findById(parent.author),
    answers: (parent) => Post.find({ '_id': { $in: parent.answers }}),
    answerCount: (parent) => Post.find({ '_id': { $in: parent.answers } }).count(),
    vote: (parent) => parent.votes.map(v => v.vote).reduce((acc, cur) => Math.sum(acc, cur), 0),
    isFavorite: (parent, args, { currentUser }) => {
      const favoriteQuestions = currentUser.toObject().favorite?.questions
      const thisId = parent._id.toString()
      return favoriteQuestions?.some(q => q.toString() === thisId)
    },
  },
  Vote: {
    voterId: (parent) => parent.voter,
    voter: (parent) => User.findById(parent.voter)
  },
  Comment: {
    author: (parent) => User.findById(parent.author)
  }
}

module.exports = {
  typeDef, resolvers
}