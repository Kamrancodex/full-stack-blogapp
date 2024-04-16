const { Router } = require("express");
const router = Router();
const {
  createPost,
  getPosts,
  getCatPosts,
  getUserPosts,
  editPost,
  deletePosts,
  getPost,
} = require("../controller/postControllers");
const authMiddleware = require("../middlewares/authMiddleware");
router.post("/", authMiddleware, createPost);
router.get("/", getPosts);
router.get("/:id", getPost);
router.patch("/:id", authMiddleware, editPost);
router.get("/categories/:category", getCatPosts);
router.get("/users/:id", getUserPosts);
router.delete("/:id", authMiddleware, deletePosts);
module.exports = router;
