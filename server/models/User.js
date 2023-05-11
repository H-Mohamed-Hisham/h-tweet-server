const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  role: String,
  isEmailVerified: Boolean,
  createdAt: String,
  updatedAt: String,
});

module.exports = model("User", userSchema);
