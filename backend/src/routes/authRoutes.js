const express = require("express");

const router = express.Router();

const { registerUser, loginUser } = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// TEST PROTECTED ROUTE
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed ✅",
    user: req.user,
  });
});

router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    message: "Welcome Admin 🚀",
  });
});

module.exports = router;
