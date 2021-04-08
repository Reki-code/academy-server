const { gql } = require('apollo-server')
const Quiz = require('../model/quiz')
const User = require('../model/user')
const Course = require('../model/course')
const { equals, max } = require('ramda')

const typeDef = gql`
  type Quiz {
    id: ID!
    title: String
    questions: [QuizQuestion!]
    dueDate: Date
    submissions: [Submission!]
    pass: Float
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
    submitAnswer(input: SubmitAnswerInput!): SubmitAnswerPayload
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
  input SubmitAnswerInput {
    quizId: String
    answers: [QuizAnswerInput!]
  }
  type SubmitAnswerPayload {
    course: Course
    grade: Int
  }
`

const compareAnswer = (type, a, b) => {
  if (type === 'multiple') {
    return equals(a['multiple'], b['multiple'])
  } else {
    return a[type] === b[type]
  }
}

const resolvers = {
  Query: {
    quiz: (root, args) => Quiz.findById(args.id),
  },
  Mutation: {
    createQuiz: async (root, args) => {
      const quiz = new Quiz(args.input)
      const saved = await quiz.save()
      return { quiz: saved }
    },
    submitAnswer: async (root, args, { currentUser }) => {
      const { quizId, answers } = args.input
      const questions = (await Quiz.findById(quizId).select('questions')).questions
      if (answers.length !== questions.length) {
        return null
      }
      const correct = questions.
        filter((question, index) => compareAnswer(question.type, question.answer, answers[index]))
      const grade = correct.length
      await Quiz.findByIdAndUpdate(
        quizId,
        {$push: { 
          submissions: {
          user: currentUser.id,
          answers,
          grade,
        }}},
      )
      const course = await Course.find({ quizzes: quizId })
      return { course: course[0], grade }
    },
  },
  Quiz: {
    pass: async (parent, args, { currentUser }) => {
      const total = parent.questions.length
      if (total === 0) return -1
      const best = parent.
        submissions.
        filter(submission => submission.user.toString() === currentUser.id).
        reduce((acc, curr) => max(acc, curr.grade), -1)
      return best / total
    }
  },
  Submission: {
    user: (parent) => User.findById(parent.user),
  }
}

module.exports = {
  typeDef, resolvers
}
