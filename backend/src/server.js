const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");
const createUsersTable = require("./config/createTables");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
createUsersTable();

app.get("/", (req, res) => {
  res.send("Photography Backend Running 🚀");
});
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
