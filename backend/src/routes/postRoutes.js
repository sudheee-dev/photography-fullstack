const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPost,
  getallpost,
  updatepost,
  deletePost,
  reactPost,
  followUser,
  unfollowUser,
  getPostById,
  getProfile,
  getMyPosts,
  updateProfile,
  getFollowing,
  getFollowers,
} = require("../controllers/postController");

// CREATE POST
router.post("/", authMiddleware, upload.single("image"), createPost);
router.get("/", authMiddleware, getallpost);

// ⚠️ MUST come before "/:id" — otherwise "mine" gets treated as an :id value
router.get("/mine", authMiddleware, getMyPosts);

// Profile update — also must come before "/:id" for the same reason
router.put("/me/profile", authMiddleware, updateProfile);
router.get("/followers", authMiddleware, getFollowers);
router.get("/following", authMiddleware, getFollowing);

router.get("/:id", authMiddleware, getPostById);
router.put("/:id", authMiddleware, updatepost);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/react", authMiddleware, reactPost);
router.post("/:id/follow", authMiddleware, followUser);
router.delete("/:id/follow", authMiddleware, unfollowUser);
router.get("/:id/profile", authMiddleware, getProfile);

module.exports = router;
