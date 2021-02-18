const express = require('express')
const cors = require('cors')
const { ApolloServer } = require('apollo-server-express')
const schema = require('./graphql/schema')
 
const app = express()
app.use(cors())
 
 
const server = new ApolloServer({
  schema
})
 
server.applyMiddleware({ app, path: '/graphql' });
 
app.listen({ port: 4000 }, () => {
  console.log('Apollo Server on http://localhost:4000/graphql');
})
