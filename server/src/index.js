require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const { sequelize, connectMongoDB } = require("./config/database");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const authenticate = require("./middleware/auth");

async function startServer() {
  const app = express();

  // Connect to databases
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");
    await sequelize.sync({ alter: true });
    console.log("PostgreSQL models synced");

    await connectMongoDB();
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Apply middleware
  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const user = authenticate(req);
        return { user };
      },
    })
  );

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
