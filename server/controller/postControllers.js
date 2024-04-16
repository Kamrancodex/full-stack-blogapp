const Post = require("../models/postModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");
const { hrtime } = require("process");
const { log } = require("console");
//createpost method post api/posts
async function createPost(req, res, next) {
  try {
    let { title, category, description } = req.body;
    if (!title || !category || !description || !req.files) {
      return next(
        new HttpError("Fill all the fields and upload the thumbnail", 422)
      );
    }
    const { thumbnail } = req.files;
    if (thumbnail.size > 2000000) {
      return next(
        new HttpError("Thumbnail size is too big it should be less than 2mb")
      );
    }
    let fileName = thumbnail.name;
    let splittedFileName = fileName.split(".");
    let newFileName =
      splittedFileName[0] +
      uuid() +
      "." +
      splittedFileName[splittedFileName.length - 1];
    thumbnail.mv(
      path.join(__dirname, "..", "/uploads", newFileName),
      async (err) => {
        if (err) {
          return next(new HttpError(err));
        } else {
          const newPost = await Post.create({
            title,
            category,
            description,
            thumbnail: newFileName,
            creator: req.user.id,
          });
          if (!newPost) {
            return next(new HttpError("Post creation failed", 422));
          }
          const currentUser = await User.findById(req.user.id);
          const userPostCount = currentUser.posts + 1;
          await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
          res.status(200).json(newPost);
        }
      }
    );
  } catch (error) {
    return next(new HttpError(error));
  }
}

//createpost method get all posts api/posts
async function getPosts(req, res, next) {
  try {
    const posts = await Post.find().sort({ updatedAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
}

//createpost method get single posts api/posts/:id
async function getPost(req, res, next) {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not Found", 404));
    }
    res.status(202).json(post);
  } catch (error) {
    return next(new HttpError(error));
  }
}

//createpost method get api/posts/categories/:category
async function getCatPosts(req, res, next) {
  try {
    const { category } = req.params;
    const catPost = await Post.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(catPost);
  } catch (error) {
    return next(new HttpError(error));
  }
}

//createpost method get api/posts/users/:id
async function getUserPosts(req, res, next) {
  try {
    const { id } = req.params;
    const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
}

//createpost method patch api/posts/:id
async function editPost(req, res, next) {
  try {
    let fileName;
    let newFileName;
    let updatedPost;
    const postId = req.params.id;
    let { title, category, description } = req.body;
    if (!title || !category || description.length < 12) {
      return next(
        new HttpError(
          "Fill in all the details and make sure description is longer than 12 characters",
          422
        )
      );
    }

    const oldPost = await Post.findById(postId);

    if (req.user.id == oldPost.creator) {
      if (!req.files || !req.files.thumbnail) {
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { title, category, description }, // Omitting thumbnail update
          { new: true }
        );
      } else {
        const { thumbnail } = req.files;
        if (thumbnail.size > 2000000) {
          return next(
            new HttpError(
              "Thumbnail size is too big make sure it is less than 2mb"
            )
          );
        }
        fileName = thumbnail.name;
        let splittedFileName = fileName.split(".");
        newFileName =
          splittedFileName[0] +
          uuid() +
          "." +
          splittedFileName[splittedFileName.length - 1];
        thumbnail.mv(
          path.join(__dirname, "..", "uploads", newFileName),
          async (err) => {
            if (err) {
              return next(new HttpError(err));
            }
          }
        );
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          {
            title,
            category,
            description,
            thumbnail: newFileName,
          },
          { new: true }
        );
      }
    }
    if (!updatedPost) {
      return next(new HttpError("Couldnt update the post", 400));
    }
    res.status(200).json(updatedPost);
  } catch (error) {
    return next(new HttpError(error));
  }
}

//createpost method delete api/posts/:id
async function deletePosts(req, res, next) {
  try {
    const postId = req.params.id;
    if (!postId) {
      return next(new HttpError("post unavailable", 400));
    }

    const post = await Post.findById(postId);
    const fileName = post.thumbnail;
    if (req.user.id == post.creator) {
      fs.unlink(
        path.join(__dirname, "..", "uploads", fileName),
        async (err) => {
          if (err) {
            return next(new HttpError(err));
          } else {
            await Post.findByIdAndDelete(postId);
            const currentUser = await User.findById(req.user.id);
            const userPostCount = currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

            res.json(`post${postId} deleted Successfully`);
          }
        }
      );
    } else {
      return next(
        new HttpError("You are not authorized to delete the post", 403)
      );
    }
  } catch (error) {
    return next(new HttpError(error));
  }
}

module.exports = {
  createPost,
  getPosts,
  getCatPosts,
  getUserPosts,
  editPost,
  deletePosts,
  getPost,
};
