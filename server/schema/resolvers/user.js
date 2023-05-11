const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

// Helper
const {
  validateRegisterInput,
  validateLoginInput,
  validateChangePasswordInput,
} = require("../../helper/validators");
const checkAuth = require("../../helper/check-auth");

// Models
const User = require("../../models/User");

// Function : Generate Token

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1h" }
  );
}

// Function : Register

const register = async (
  _,
  { registerInput: { username, email, password, confirmPassword } }
) => {
  // Validate user data
  const { valid, errors } = validateRegisterInput(
    username,
    email,
    password,
    confirmPassword
  );
  if (!valid) {
    throw new GraphQLError("Form validation error", {
      extensions: { code: "BAD_USER_INPUT", error: errors },
    });
  }

  const user = await User.findOne({ email });
  if (user) {
    throw new GraphQLError("Email is taken ", {
      extensions: {
        error: {
          email: "This email is taken",
        },
      },
    });
  }
  // hash password and create an auth token
  password = await bcrypt.hash(password, 12);

  const newUser = new User({
    email,
    username,
    password,
    role: "user",
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const res = await newUser.save();

  const token = generateToken(res);

  return {
    ...res._doc,
    id: res._id,
    token,
  };
};

// Function : Login
const login = async (_, { email, password }) => {
  const { errors, valid } = validateLoginInput(email, password);

  if (!valid) {
    throw new GraphQLError("Form validation error", {
      extensions: { code: "BAD_USER_INPUT", error: errors },
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    errors.email = "Email not found";
    throw new GraphQLError("Email not found", {
      extensions: { code: "BAD_USER_INPUT", error: errors },
    });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    errors.password = "Wrong crendetials";
    throw new GraphQLError("Wrong crendetials", {
      extensions: { code: "BAD_USER_INPUT", error: errors },
    });
  }

  const token = generateToken(user);

  return {
    ...user._doc,
    id: user._id,
    token,
  };
};

// Function : Get Logged In User Profile

const getUser = async (_, { userId }, context) => {
  // Check Authentication
  const user = checkAuth(context);

  const userDetail = await User.findById(userId);
  if (userDetail) {
    return userDetail;
  } else {
    throw new GraphQLError("User not found");
  }
};

// Function : Change Password

const changePassword = async (
  _,
  { changePasswordInput: { currentPassword, password, confirmPassword } },
  context
) => {
  // Check Authentication
  const user = checkAuth(context);

  const { errors, valid } = validateChangePasswordInput(
    currentPassword,
    password,
    confirmPassword
  );

  if (!valid) {
    throw new GraphQLError("Form validation error", {
      extensions: { code: "BAD_USER_INPUT", error: errors },
    });
  }

  const updatedUser = await User.findById(user.id);

  if (!updatedUser) {
    throw new GraphQLError("User not found");
  }

  // Match Current Password & New Password Provided By User
  const match = await bcrypt.compare(currentPassword, updatedUser.password);

  if (!match) {
    errors.currentPassword = "Wrong crendetial";
    throw new GraphQLError("Wrong crendetial", {
      extensions: { code: "BAD_USER_INPUT", error: errors },
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  updatedUser.password = hashedPassword;

  await updatedUser.save();
  return updatedUser;
};

module.exports = {
  Query: {
    getUser,
  },
  Mutation: {
    login,
    register,
    changePassword,
  },
};
