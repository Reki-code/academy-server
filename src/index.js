require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

// setup mongoose
const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(() => console.log('connected to MongoDB'))
  .catch((error) => console.error('error connection to MongoDB', error.message))

// setup apollo server
const User = require('./model/user')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
const { ApolloServer } = require('apollo-server-express')
const schema = require('./graphql/schema')
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      try {
        const decodedToken = jwt.verify(
          auth.substring(7), JWT_SECRET
        )
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      } catch (error) {
        console.error('invalid token')
      }
    }
  }
})
server.applyMiddleware({ app, path: '/graphql' });

const PORT = process.env.PORT
app.listen({ port: PORT }, () => {
  console.log(`Apollo Server on http://localhost:${PORT}/graphql`);
})
