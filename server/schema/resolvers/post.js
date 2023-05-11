const { GraphQLError } = require("graphql");

// Helper
const checkAuth = require("../../helper/check-auth");
const { validatePostInput } = require("../../helper/validators");

// Models
const Post = require("../../models/Post");

// Function : Create Post

const createPost = async (_, { body }, context) => {
  // Check Authentication
  const user = checkAuth(context);

  const { errors, valid } = validatePostInput(body);

  // Validate Post Body
  if (!valid) {
    throw new GraphQLError("Form validation error", {
      extensions: { code: "BAD_USER_INPUT", error: errors },
    });
  }

  const newPost = new Post({
    body,
    userId: user.id,
    username: user.username,
    createdAt: new Date().toISOString(),
  });

  const post = await newPost.save();

  // context.pubsub.publish('NEW_POST', {
  //   newPost: post
  // });

  return post;
};

// Function : Delete Post

const deletePost = async (_, { postId }, context) => {
  // Check Authentication
  const user = checkAuth(context);

  try {
    const post = await Post.findById(postId);

    if (user.username === post.username) {
      await post.deleteOne();
      return "Post deleted successfully";
    } else {
      throw new GraphQLError("Action not allowed");
    }
  } catch (err) {
    throw new GraphQLError("Server Error : Please try again");
  }
};

// Function : Like Post

const likePost = async (_, { postId }, context) => {
  // Check Authentication
  const { username } = checkAuth(context);

  const post = await Post.findById(postId);
  if (post) {
    if (post.likes.find((like) => like.username === username)) {
      // Post already likes, unlike it
      post.likes = post.likes.filter((like) => like.username !== username);
    } else {
      // Not liked, like post
      post.likes.push({
        username,
        createdAt: new Date().toISOString(),
      });
    }

    await post.save();
    return post;
  } else throw new GraphQLError("Post not found");
};

// Function : Get Posts

const getPosts = async (_, { skip, userId }) => {
  try {
    const skip_limit = skip ? parseInt(skip) : 0;
    const DEFAULT_LIMIT = 2;

    if (userId !== null) {
      const posts = await Post.find({ userId: userId })
        .skip(skip_limit)
        .limit(DEFAULT_LIMIT)
        .sort({ createdAt: -1 });
      return posts;
    } else {
      const posts = await Post.find()
        .skip(skip_limit)
        .limit(DEFAULT_LIMIT)
        .sort({ createdAt: -1 });
      return posts;
    }
  } catch (err) {
    throw new GraphQLError("Posts not found");
  }
};

// Function : Get Post By ID

const getPost = async (_, { postId }) => {
  try {
    const post = await Post.findById(postId);
    if (post) {
      return post;
    } else {
      throw new GraphQLError("Post not found");
    }
  } catch (err) {
    throw new GraphQLError("Post not found");
  }
};

// Function : Get Total Post Count

const getTotalPostCount = async (_, { userId }) => {
  try {
    if (userId !== null) {
      const totalPostCount = await Post.count({ userId: userId });
      return totalPostCount;
    } else {
      const totalPostCount = await Post.count();
      return totalPostCount;
    }
  } catch (err) {
    throw new GraphQLError("Posts not found");
  }
};

module.exports = {
  Query: {
    getPosts,
    getPost,
    getTotalPostCount,
  },
  Mutation: {
    createPost,
    deletePost,
    likePost,
  },
  Post: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length,
  },
};
