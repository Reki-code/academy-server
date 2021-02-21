require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

// setup mongoose
const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true  })
  .then(() => console.log('connected to MongoDB'))
  .catch((error) => console.erroe('error connection to MongoDB', error.message))

// setup apollo server
const { ApolloServer } = require('apollo-server-express')
const schema = require('./graphql/schema')
const server = new ApolloServer({
  schema
})
server.applyMiddleware({ app, path: '/graphql' });

const PORT = process.env.PORT
app.listen({ port: PORT }, () => {
  console.log(`Apollo Server on http://localhost:${PORT}/graphql`);
})
