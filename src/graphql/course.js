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
    teacher: User!
    questions: [Post!]
    announcements: [Announcement!]
    quizzes: [Quiz!]
    group: Group
    userEnrolled: [User!]
  }
  extend type Query {
    courses(searchBy: CourseInput!): [Course!]
    course(id: ID!): Course
  }
  input CourseInput {
    id: ID
    title: String
    teacher: String
  }
  extend type Mutation {
    createCourse(input: CreateCourseInput!): CreateCoursePayload
    updateCourse(input: UpdateCourseInput!): UpdateCoursePayload
    courseAddQuestion(input: CourseAddQuestionInput!): CourseAddQuestionPayload
    courseAddAnnouncement(input: CourseAddAnnouncementInput!): CourseAddAnnouncementPayload
  }
  input CreateCourseInput {
    title: String!
    teacherId: String!
  }
  type CreateCoursePayload {
    course: Course
  }
  input UpdateCourseInput {
    id: ID!
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
`

const resolvers = {
  Query: {
    courses: (root, args) => Course.find(args.searchBy),
    course: (root, args) => Course.findById(args.id),
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
  },
  Course: {
    teacher: (parent) => User.findById(parent.teacher),
    questions: (parent) => Post.find({ '_id': { $in: parent.questions } }),
    announcements: (parent) => Announcement.find({ '_id': { $in: parent.announcements }}),
    quizzes: (parent) => Quiz.find({ _id: { $in: parent.quizs } }),
    group: (parent) => Group.findById(parent.group),
    userEnrolled: async (parent) => {
      const enrollments = await Enrollment.
        find({ courseEnrolled: parent.id }).
        populate('userEnrolled')
      return enrollments.map(enrollment => enrollment.userEnrolled)
    },
  }
}

module.exports = {
  typeDef, resolvers
}