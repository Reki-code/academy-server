const { gql } = require('apollo-server')
const Enrollment = require('../model/enrollment')
const Course = require('../model/course')
const User = require('../model/user')

const typeDef = gql`
  type Enrollment {
    id: ID!
    userEnrolled: User
    courseEnrolled: Course
  }
  extend type Mutation {
    enroll(input: EnrollInput!): EnrollPayload
  }
  input EnrollInput {
    courseId: String!
    userId: String
  }
  type EnrollPayload {
    enrollment: Enrollment
  }
`

const resolvers = {
  Mutation: {
    enroll: async (root, args, { currentUser }) => {
      const { courseId, userId } = args.input
      const student = userId ?? currentUser.id
      const enrollment = new Enrollment({
        userEnrolled: student,
        courseEnrolled: courseId,
      })
      const saved = await enrollment.save()
      return { enrollment: saved }
    }
  },
  Enrollment: {
    userEnrolled: (parent) => User.findById(parent.userEnrolled),
    courseEnrolled: (parent) => Course.findById(parent.courseEnrolled),
  },
}

module.exports = {
  typeDef, resolvers
}
