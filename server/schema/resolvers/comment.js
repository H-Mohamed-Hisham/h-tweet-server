const { GraphQLError } = require("graphql");

// Helper
const checkAuth = require("../../helper/check-auth");

// Models
const Post = require("../../models/Post");

// Function : Create Comment

const createComment = async (_, { postId, body }, context) => {
  // Check Authentication
  const { username } = checkAuth(context);
  if (body.trim() === "") {
    throw new GraphQLError("Comment must not be empty");
  }

  const post = await Post.findById(postId);

  if (post) {
    post.comments.unshift({
      body,
      username,
      createdAt: new Date().toISOString(),
    });
    await post.save();
    return post;
  } else throw new GraphQLError("Post not found");
};

// Function : Delete Comment

const deleteComment = async (_, { postId, commentId }, context) => {
  // Check Authentication
  const { username } = checkAuth(context);

  const post = await Post.findById(postId);

  if (post) {
    const commentIndex = post.comments.findIndex((c) => c.id === commentId);

    if (post.comments[commentIndex].username === username) {
      post.comments.splice(commentIndex, 1);
      await post.save();
      return post;
    } else {
      throw new GraphQLError("Action not allowed");
    }
  } else {
    throw new GraphQLError("Post not found");
  }
};

module.exports = {
  Mutation: {
    createComment,
    deleteComment,
  },
};
