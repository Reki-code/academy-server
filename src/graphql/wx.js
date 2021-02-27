const { gql } = require('apollo-server')
const axios = require('axios').default

const typeDef = gql`
  extend type Mutation {
    wxLogin(code: String!): String
  }
`

const resolvers = {
  Mutation: {
    wxLogin: async (root, args) => {
      const code = args.code
      const response = await axios({
        method: 'get',
        url: `https://api.weixin.qq.com/sns/jscode2session?appid=wx8349d9be7ef6554f&secret=277ad7b7bd808830761f654e8c0f5d71&js_code=${code}&grant_type=authorization_code`
      })
      const { openid } = response.data
      return openid
    }
  }
}

module.exports = {
  typeDef, resolvers
}