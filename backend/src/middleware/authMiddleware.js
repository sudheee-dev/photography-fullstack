const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // GET TOKEN FROM HEADER
    const authHeader = req.headers.authorization;

    // CHECK TOKEN EXISTS
    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // REMOVE "Bearer "
    const token = authHeader.split(" ")[1];

    // VERIFY TOKEN
    const decoded = jwt.verify(token, "secretkey");

    // STORE USER DATA IN REQUEST
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = authMiddleware;
