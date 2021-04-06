const { gql } = require('apollo-server')
const Resource = require('../model/resource')

const typeDef = gql`
  type Resource {
    id: ID!
    title: String
    category: String
    content: String
    url: String
    createdAt: Date
  }
  extend type Query {
    resource(id: ID!): Resource
  }
  extend type Mutation {
    createResource(input: CreateResourceInput!): CreateResourcePayload
  }
  input CreateResourceInput {
    title: String
    category: String
    content: String
    url: String
  }
  type CreateResourcePayload {
    resource: Resource
  }
`

const resolvers = {
  Query: {
    resource: (root, args) => Resource.findById(args.id),
  },
  Mutation: {
    createResource: async (root, args) => {
      const { title, category, content, url } = args.input
      const resource = new Resource({ title, category, content, url })
      const saved = resource.save()
      return { resource: saved }
    }
  }
}

module.exports = {
  typeDef, resolvers
}
