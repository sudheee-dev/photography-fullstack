const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const {
    email,
    password,
    username,
    first_name,
    last_name,
    dob,
    gender,
    permissions,
    bio,
  } = req.body;

  db.beginTransaction(async (err) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    try {
      const checkUserQuery = `SELECT * FROM users WHERE email = ?`;

      db.query(checkUserQuery, [email], async (err, result) => {
        if (err) {
          return db.rollback(() => res.status(500).json(err));
        }

        if (result.length > 0) {
          return db.rollback(() =>
            res.status(400).json({ message: "Email already exists" }),
          );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = `
          INSERT INTO users (email, password, role)
          VALUES (?, ?, ?)
        `;

        db.query(
          insertUserQuery,
          [email, hashedPassword, "user"],
          (err, userResult) => {
            if (err) {
              return db.rollback(() => res.status(500).json(err));
            }

            const userId = userResult.insertId;

            const insertProfileQuery = `
              INSERT INTO profiles
              (user_id, username, first_name, last_name, dob, gender, permissions, bio)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
              insertProfileQuery,
              [
                userId,
                username,
                first_name,
                last_name,
                dob,
                gender,
                permissions,
                bio,
              ],
              (err, profileResult) => {
                if (err) {
                  return db.rollback(() => res.status(500).json(err));
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() =>
                      res.status(500).json({ message: "Server Error" }),
                    );
                  }
                  res
                    .status(201)
                    .json({ message: "User Registered Successfully 🚀" });
                });
              },
            );
          },
        );
      });
    } catch (error) {
      db.rollback(() => res.status(500).json(error));
    }
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // CHECK EMAIL EXISTS
    const checkUserQuery = `
      SELECT * FROM users WHERE email = ?
    `;

    db.query(checkUserQuery, [email], async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      // USER NOT FOUND
      if (result.length === 0) {
        return res.status(400).json({
          message: "Invalid Email or Password",
        });
      }

      const user = result[0];

      // COMPARE PASSWORD
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid Email or Password",
        });
      }

      // LOGIN SUCCESS

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        "secretkey",
        {
          expiresIn: "7d",
        },
      );
      res.status(200).json({
        message: "Login Successful ✅",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
