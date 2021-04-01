const { gql, UserInputError } = require('apollo-server')
const Course = require('../model/course')
const User = require('../model/user')
const Post = require('../model/post')
const Announcement = require('../model/announcement')
const Quiz = require('../model/quiz')
const Group = require('../model/group')
const Enrollment = require('../model/enrollment')

const typeDef = gql`
  type Course {
    id: ID!
    title: String!
    createdAt: Date
    cover: String!
    teacher: User!
    questions: [Post!]
    announcements: [Announcement!]
    quizzes: [Quiz!]
    group: Group
    userEnrolled: [User!]
    countEnrolled: Int
    isEnrolled: Boolean
  }
  extend type Query {
    courses(searchBy: CourseInput!): [Course!]
    course(id: ID!): Course
    countCourse: Int
  }
  input CourseInput {
    open: Boolean
    title: String
    teacher: String
  }
  extend type Mutation {
    createCourse(input: CreateCourseInput!): CreateCoursePayload
    updateCourse(input: UpdateCourseInput!): UpdateCoursePayload
    courseAddQuestion(input: CourseAddQuestionInput!): CourseAddQuestionPayload
    courseAddAnnouncement(input: CourseAddAnnouncementInput!): CourseAddAnnouncementPayload
    courseAddQuiz(input: CourseAddQuizInput!): CourseAddQuizPayload
  }
  input CreateCourseInput {
    title: String!
    teacherId: String!
    open: Boolean
  }
  type CreateCoursePayload {
    course: Course
  }
  input UpdateCourseInput {
    id: ID!
    open: Boolean
    title: String
    teacherId: String
  }
  type UpdateCoursePayload {
    course: Course
  }
  input CourseAddQuestionInput {
    courseId: String!
    questionId: String
    question: CreatePostInput
  }
  type CourseAddQuestionPayload {
    course: Course
  }
  input CourseAddAnnouncementInput {
    courseId: String!
    announcementId: String!
  }
  type CourseAddAnnouncementPayload {
    course: Course
  }
  input CourseAddQuizInput {
    courseId: String!
    quiz: CreateQuizInput
  }
  type CourseAddQuizPayload {
    course: Course
  }
`

const resolvers = {
  Query: {
    courses: (root, args) => Course.find(args.searchBy).sort('-createdAt'),
    course: (root, args) => Course.findById(args.id),
    countCourse: (root) => Course.count(),
  },
  Mutation: {
    createCourse: async (root, args) => {
      const input = args.input
      const group = new Group({
        name: 'DEFAULT',
      })
      const defaultGroup = await group.save()
      const course = new Course({
        title: input.title,
        teacher: input.teacherId,
        group: defaultGroup.id,
        open: input.open,
      })
      try {
        const savedCourse = await course.save()
        return { course: savedCourse }
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    },
    updateCourse: async (root, args) => {
      const input = args.input
      const newCourse = await Course
        .findByIdAndUpdate(input.id, input, { new: true })
      return { course: newCourse }
    },
    courseAddQuestion: async (root, args, { currentUser }) => {
      const input = args.input
      if (input.questionId) {
        const newCourse = await Course.findByIdAndUpdate(
          input.courseId,
          { $push: { questions: input.questionId } },
          { new: true })
        return { course: newCourse }
      } else {
        const question = new Post({
          title: input.question.title,
          author: currentUser.id,
          content: input.question.content,
        })
        const savedQuestion = await question.save()
        const newCourse = await Course.findByIdAndUpdate(
          input.courseId,
          { $push: { questions: savedQuestion.id } },
          { new: true })
        return { course: newCourse }
      }
    },
    courseAddAnnouncement: async (root, args) => {
      const input = args.input
      const newCourse = await Course.findByIdAndUpdate(
        input.courseId,
        { $push: { announcements: input.announcementId } },
        { new: true })
      return { course: newCourse }
    },
    courseAddQuiz: async (root, args) => {
      const { courseId, quiz: quizInfo } = args.input
      const quiz = new Quiz(quizInfo)
      const savedQuiz = await quiz.save()
      const newCourse = await Course.findByIdAndUpdate(
        courseId,
        { $push: { quizzes: savedQuiz.id } },
        { new: true })
      return { course: newCourse }
    },
  },
  Course: {
    cover: (parent) => parent.cover ?? 'https://i.loli.net/2021/03/24/BQ7oSbgtFiPexNw.jpg',
    teacher: (parent) => User.findById(parent.teacher),
    questions: (parent) => Post.find({ '_id': { $in: parent.questions } }),
    announcements: (parent) => Announcement.find({ '_id': { $in: parent.announcements }}),
    quizzes: (parent) => Quiz.find({ _id: { $in: parent.quizzes } }),
    group: (parent) => Group.findById(parent.group),
    userEnrolled: async (parent) => {
      const enrollments = await Enrollment.
        find({ courseEnrolled: parent.id }).
        populate('userEnrolled')
      return enrollments.map(enrollment => enrollment.userEnrolled)
    },
    countEnrolled: (parent) => {
      return Enrollment.
        find({ courseEnrolled: parent.id }).
        populate('userEnrolled').
        count()
    },
    isEnrolled: async (parent, args, { currentUser }) => {
      const count = await Enrollment.find({
        courseEnrolled: parent.id,
        userEnrolled: currentUser.id,
      }).
        count()
      return count >= 1
    },
  }
}

module.exports = {
  typeDef, resolvers
}