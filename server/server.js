const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const express = require("express");
const http = require("http");
const cors = require("cors");
const pkg = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// TypeDefs
const userTypeDefs = require("./schema/typeDefs/user");
const postTypeDefs = require("./schema/typeDefs/post");

// Resolvers
const userResolvers = require("./schema/resolvers/user");
const postResolvers = require("./schema/resolvers/post");
const commentResolvers = require("./schema/resolvers/comment");

(async function () {
  dotenv.config();
  const { json } = pkg;

  const app = express();

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: [userTypeDefs, postTypeDefs],
    resolvers: _.merge({}, userResolvers, postResolvers, commentResolvers),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    json(),
    expressMiddleware(server, {
      // context: async ({ req }) => ({ token: req.headers.token }),
      context: async ({ req }) => ({ req }),
    })
  );

  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("🚀 Connected to MongoDB..");
      httpServer.listen({ port: process.env.SERVER_PORT || 5000 }, () => {
        console.log(
          `🚀 Server running in ${process.env.NODE_ENVIRONMENT} mode on port ${process.env.SERVER_PORT}`
        );
      });
    });
})();
