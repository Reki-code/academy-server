const { gql } = require('apollo-server')
const Group = require('../model/group')
const User = require('../model/user')

const typeDef = gql`
  type Group {
    id: ID!
    name: String
    members: [User!]
    subGroups: [Group!]
  }
  extend type Query {
    group(id: ID!): Group
  }
  extend type Mutation {
    createGroup(input: CreateGroupInput!): CreateGroupPayload
    groupAddMember(input: GroupAddMemberInput!): GroupAddMemberPayload
    groupAddSubGroup(input: GroupAddSubGroupInput!): GroupAddSubGroupPayload
  }
  input CreateGroupInput {
    name: String
  }
  type CreateGroupPayload {
    group: Group
  }
  input GroupAddMemberInput {
    groupId: String!
    memberId: String
  }
  type GroupAddMemberPayload {
    group: Group
  }
  input GroupAddSubGroupInput {
    groupId: String!
    subGroupId: String
    new: Boolean
    subGroupName: String
  }
  type GroupAddSubGroupPayload {
    group: Group
    subGroup: Group
  }
`

const resolvers = {
  Query: {
    group: (root, args) => Group.findById(args.id),
  },
  Mutation: {
    createGroup: async (root, args) => {
      const input = args.input
      const group = new Group({
        name: input.name
      })
      const saved = await group.save()
      return { group: saved }
    },
    groupAddMember: async (root, args) => {
      const { groupId, memberId } = args.input
      const newGroup = await Group.findByIdAndUpdate(
        groupId,
        { $push: { members: memberId } },
        { new: true }
      )
      return { group: newGroup }
    },
    groupAddSubGroup: async (root, args) => {
      if (input.new) { // create Group
        const { groupId, subGroupName } = args.input
        const group = new Group({
          name: subGroupName,
        })
        const subGroup = await group.save()
        const newGroup = await Group.findByIdAndUpdate(
          groupId,
          { $push: { subGroups: subGroup.id } },
          { new: true }
        )
        return { group: newGroup, subGroup }
      } else {
        const { groupId, subGroupId } = args.input
        const newGroup = await Group.findByIdAndUpdate(
          groupId,
          { $push: { subGroups: subGroupId }},
          { new: true }
        )
        return { group: newGroup }
      }
    }
  },
  Group: {
    members: (parent) => User.find({ _id: { $in: parent.members }}),
    subGroups: (parent) => Group.find({ _id: { $in: parent.subGroups }}),
  }
}

module.exports = {
  typeDef, resolvers
}