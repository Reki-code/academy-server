const { gql } = require('apollo-server')
const Quiz = require('../model/quiz')
const User = require('../model/user')

const typeDef = gql`
  type Quiz {
    id: ID!
    title: String
    questions: [QuizQuestion!]
    dueDate: Date
    submissions: [Submission!]
  }
  type QuizQuestion {
    type: String
    content: QuizContent
    answer: QuizAnswer!
  }
  type QuizContent {
    stem: String
    options: [String!]
  }
  type QuizAnswer {
    single: String
    multiple: [String!]
    tureFalse: Boolean
    shortAnswer: String
  }
  type Submission {
    user: User
    answers: [QuizAnswer!]
    grade: Int
  }
  extend type Query {
    quiz(id: ID!): Quiz
  }
  extend type Mutation {
    createQuiz(input: CreateQuizInput!): CreateQuizPayload
  }
  input CreateQuizInput {
    title: String
    questions: [QuizQuestionInput]
    dueDate: Date
  }
  input QuizQuestionInput {
    type: String
    content: QuizContentInput
    answer: QuizAnswerInput!
  }
  input QuizContentInput {
    stem: String
    options: [String!]
  }
  input QuizAnswerInput {
    single: String
    multiple: [String!]
    tureFalse: Boolean
    shortAnswer: String
  }
  type CreateQuizPayload {
    quiz: Quiz
  }
`

const resolvers = {
  Query: {
    quiz: (root, args) => Quiz.findById(args.id),
  },
  Mutation: {
    createQuiz: async (root, args) => {
      const quiz = new Quiz(args.input)
      const saved = await quiz.save()
      return { quiz: saved }
    }
  },
  Quiz: {
    submissions: {
      user: (parent) => User.findById(parent.user),
    }
  }
}

module.exports = {
  typeDef, resolvers
}
