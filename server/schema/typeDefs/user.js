const gql = require("graphql-tag");

module.exports = gql`
  # Type

  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    isEmailVerified: Boolean!
    createdAt: String!
    updatedAt: String!
    token: String!
  }

  # Query

  type Query {
    getUser(userId: ID!): User
  }

  # Input

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  input ChangePasswordInput {
    currentPassword: String!
    password: String!
    confirmPassword: String!
  }

  # Mutation

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(email: String!, password: String!): User!
    changePassword(changePasswordInput: ChangePasswordInput): User!
  }
`;
