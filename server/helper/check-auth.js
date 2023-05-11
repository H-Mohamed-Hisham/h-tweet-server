const { GraphQLError } = require("graphql");

const jwt = require("jsonwebtoken");

module.exports = (context) => {
  // context = { ... headers }

  const authHeader = context.req.headers.authorization;

  // authHeader --> Bearer token

  if (authHeader) {
    // Bearer ....
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return user;
      } catch (err) {
        throw new GraphQLError("Invalid/Expired token");
      }
    }
    throw new GraphQLError("Authentication token must be 'Bearer [token]");
  }
  throw new GraphQLError("Authorization header must be provided");
};
