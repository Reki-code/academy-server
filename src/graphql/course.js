const { gql, UserInputError } = require('apollo-server')
const Course = require('../model/course')
const User = require('../model/user')

const typeDef = gql`
  type Course {
    id: ID!
    title: String!
    teacher: User!
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
`

const resolvers = {
  Query: {
    courses: (root, args) => Course.find(args.searchBy),
    course: (root, args) => Course.findById(args.id),
  },
  Mutation: {
    createCourse: async (root, args) => {
      const input = args.input
      const course = new Course({
        title: input.title,
        teacher: input.teacherId
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
    }
  },
  Course: {
    teacher: (parent) => User.findById(parent.teacher),
  }
}

module.exports = {
  typeDef, resolvers
}