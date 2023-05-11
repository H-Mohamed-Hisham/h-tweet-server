// Validate Register Input

module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email must be a valid email address";
    }
  }
  if (password === "") {
    errors.password = "Password must not empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

// Validate Login Input

module.exports.validateLoginInput = (email, password) => {
  const errors = {};
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  }
  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

// Validate Post Input

module.exports.validatePostInput = (body) => {
  const errors = {};
  if (body.trim() === "") {
    errors.body = "Post body must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

// Validate Change Password Input

module.exports.validateChangePasswordInput = (
  currentPassword,
  password,
  confirmPassword
) => {
  const errors = {};
  if (currentPassword === "") {
    errors.currentPassword = "Current password must not be empty";
  }
  if (password === "") {
    errors.password = "Password must not be empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  if (confirmPassword === "") {
    errors.confirmPassword = "Confirm password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
