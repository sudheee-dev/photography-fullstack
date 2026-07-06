const db = require("../config/db");

// CREATE POST
const createPost = (req, res) => {
  const { description, location } = req.body;
  const image_url = req.file.path;

  const userId = req.user.id;

  const query = `
    INSERT INTO posts
    (user_id, image_url, description, location)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [userId, image_url, description, location], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.status(201).json({
      message: "Post created successfully ✅",
    });
  });
};

// GET ALL POSTS
const getallpost = (req, res) => {
  const loggedInUserId = req.user.id;
  const query = `
SELECT
    posts.id,
    posts.user_id,
    posts.image_url,
    posts.description,
    posts.location,
    posts.created_at,
    profiles.username,

    MAX(
        CASE
            WHEN follows.follower_id IS NOT NULL THEN 1
            ELSE 0
        END
    ) AS is_following,

    COUNT(CASE WHEN likes.reaction_type = 'like' THEN 1 END) AS like_count,
    COUNT(CASE WHEN likes.reaction_type = 'love' THEN 1 END) AS love_count,
    COUNT(CASE WHEN likes.reaction_type = 'fire' THEN 1 END) AS fire_count,
    COUNT(CASE WHEN likes.reaction_type = 'wow' THEN 1 END) AS wow_count

FROM posts

INNER JOIN profiles
ON posts.user_id = profiles.user_id

LEFT JOIN likes
ON posts.id = likes.post_id

LEFT JOIN follows
ON follows.following_id = posts.user_id
AND follows.follower_id = ?

GROUP BY
    posts.id,
    posts.user_id,
    posts.image_url,
    posts.description,
    posts.location,
    posts.created_at,
    profiles.username

ORDER BY posts.created_at DESC;
  `;

  db.query(query, [loggedInUserId], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.status(200).json(result);
  });
};

// UPDATE POST
const updatepost = (req, res) => {
  const postId = req.params.id;

  const selectQuery = `
    SELECT * FROM posts
    WHERE id = ?
  `;

  db.query(selectQuery, [postId], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const post = result[0];

    // OWNER OR ADMIN
    if (post.user_id == req.user.id || req.user.role === "admin") {
      const { description, location } = req.body;

      const updateQuery = `
        UPDATE posts
        SET description = ?, location = ?
        WHERE id = ?
      `;

      db.query(updateQuery, [description, location, postId], (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to update post",
          });
        }

        return res.status(200).json({
          message: "Post updated successfully ✅",
        });
      });
    } else {
      return res.status(403).json({
        message: "Access denied",
      });
    }
  });
};

const deletePost = (req, res) => {
  const postId = req.params.id;

  const selectQuery = `
    SELECT * FROM posts
    WHERE id = ?
  `;

  db.query(selectQuery, [postId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Server Error",
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const post = result[0];

    if (post.user_id == req.user.id || req.user.role === "admin") {
      const deleteQuery = `
        DELETE FROM posts
        WHERE id = ?
      `;

      db.query(deleteQuery, [postId], (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete post",
          });
        }

        return res.status(200).json({
          message: "Post deleted successfully ✅",
        });
      });
    } else {
      return res.status(403).json({
        message: "Access denied",
      });
    }
  });
};
const reactPost = (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { reaction_type } = req.body;

  const validReactions = ["like", "love", "fire", "wow"];
  if (!validReactions.includes(reaction_type)) {
    return res.status(400).json({ message: "Invalid reaction" });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    const checkQuery = `
      SELECT * FROM likes
      WHERE user_id = ? AND post_id = ?
      FOR UPDATE
    `;

    db.query(checkQuery, [userId, postId], (err, result) => {
      if (err) {
        return db.rollback(() =>
          res.status(500).json({ message: "Server Error" }),
        );
      }

      console.log("---- REACT DEBUG ----");
      console.log(
        "userId:",
        userId,
        "postId:",
        postId,
        "newReaction:",
        reaction_type,
      );
      console.log(
        "Existing rows found:",
        result.length,
        JSON.stringify(result),
      );

      const finish = (status, message) => {
        db.commit((err) => {
          if (err) return res.status(500).json({ message: "Server Error" });
          return res.status(status).json({ message });
        });
      };

      const fail = () => {
        db.rollback(() => res.status(500).json({ message: "Server Error" }));
      };

      if (result.length === 0) {
        console.log("BRANCH: INSERT");
        const insertQuery = `
          INSERT INTO likes (user_id, post_id, reaction_type)
          VALUES (?, ?, ?)
        `;
        return db.query(
          insertQuery,
          [userId, postId, reaction_type],
          (err, insertResult) => {
            if (err) return fail();
            console.log("INSERT affectedRows:", insertResult.affectedRows);
            finish(201, "Reaction added successfully ✅");
          },
        );
      }

      const existingReaction = result[0];

      if (existingReaction.reaction_type === reaction_type) {
        console.log("BRANCH: DELETE (toggle off)");
        const deleteQuery = `
          DELETE FROM likes
          WHERE user_id = ? AND post_id = ?
        `;
        return db.query(deleteQuery, [userId, postId], (err, deleteResult) => {
          if (err) return fail();
          console.log("DELETE affectedRows:", deleteResult.affectedRows);
          finish(200, "Reaction removed ✅");
        });
      }

      console.log("BRANCH: UPDATE");
      const updateQuery = `
        UPDATE likes
        SET reaction_type = ?
        WHERE user_id = ? AND post_id = ?
      `;
      db.query(
        updateQuery,
        [reaction_type, userId, postId],
        (err, updateResult) => {
          if (err) return fail();
          console.log("UPDATE affectedRows:", updateResult.affectedRows);
          finish(200, "Reaction updated ✅");
        },
      );
    });
  });
};
const followUser = (req, res) => {
  const follower_id = req.user.id;
  const following_id = req.params.id;

  // Cannot follow yourself
  if (follower_id == following_id) {
    return res.status(400).json({
      message: "You cannot follow yourself",
    });
  }

  const checkUserQuery = `
    SELECT * FROM users
WHERE id = ?

  `;

  db.query(checkUserQuery, [following_id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const checkFollowQuery = `
      SELECT *
      FROM follows
      WHERE follower_id = ?
      AND following_id = ?
    `;

    db.query(checkFollowQuery, [follower_id, following_id], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Server Error",
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          message: "Already following this user",
        });
      }

      const insertQuery = `
          INSERT INTO follows
          (follower_id, following_id)
          VALUES (?, ?)
        `;

      db.query(insertQuery, [follower_id, following_id], (err) => {
        if (err) {
          return res.status(500).json({
            message: "Server Error",
          });
        }

        return res.status(201).json({
          message: "User followed successfully ✅",
        });
      });
    });
  });
};
const unfollowUser = (req, res) => {
  const follower_id = req.user.id;
  const following_id = req.params.id;

  const deleteQuery = `
    DELETE FROM follows
    WHERE follower_id = ?
    AND following_id = ?
  `;
  console.log("follower_id:", follower_id);
  console.log("following_id:", following_id);
  db.query(deleteQuery, [follower_id, following_id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Server Error",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "You are not following this user",
      });
    }

    return res.status(200).json({
      message: "User unfollowed successfully ✅",
    });
  });
};
const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const checkprofilesQuery = `
       SELECT username, first_name, last_name, bio
  FROM profiles
  WHERE user_id = ?
    `;

    const [profileResult] = await db
      .promise()
      .query(checkprofilesQuery, [userId]);

    if (profileResult.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const checkpostcountQuery = `
      SELECT COUNT(*) AS posts
      FROM posts
      WHERE user_id = ?
    `;

    const [postCountResult] = await db
      .promise()
      .query(checkpostcountQuery, [userId]);

    const followersCountQuery = `
  SELECT COUNT(*) AS followers
  FROM follows
  WHERE following_id = ?
`;

    const [followersResult] = await db
      .promise()
      .query(followersCountQuery, [userId]);

    const followingCountQuery = `
  SELECT COUNT(*) AS following
  FROM follows
  WHERE follower_id = ?
`;

    const [followingResult] = await db
      .promise()
      .query(followingCountQuery, [userId]);

    const userPostsQuery = `
  SELECT *
  FROM posts
  WHERE user_id = ?
  ORDER BY created_at DESC
`;

    const [postsResult] = await db.promise().query(userPostsQuery, [userId]);

    return res.status(200).json({
      username: profileResult[0].username,
      first_name: profileResult[0].first_name,
      last_name: profileResult[0].last_name,
      bio: profileResult[0].bio,
      posts: postCountResult[0].posts,
      followers: followersResult[0].followers,
      following: followingResult[0].following,
      user_posts: postsResult,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};
// GET SINGLE POST
const getPostById = (req, res) => {
  const postId = req.params.id;

  const query = `
        SELECT *
        FROM posts
        WHERE id = ?
    `;

  db.query(query, [postId], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json(result[0]);
  });
};
// GET ONLY THE LOGGED-IN USER'S OWN POSTS
const getMyPosts = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT id, image_url, description, location, created_at
    FROM posts
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Server Error" });
    }
    return res.status(200).json(result);
  });
};

// UPDATE OWN PROFILE
const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { username, first_name, last_name, bio } = req.body;

  const updateQuery = `
    UPDATE profiles
    SET username = ?, first_name = ?, last_name = ?, bio = ?
    WHERE user_id = ?
  `;

  db.query(
    updateQuery,
    [username, first_name, last_name, bio, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Server Error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Profile not found" });
      }
      return res
        .status(200)
        .json({ message: "Profile updated successfully ✅" });
    },
  );
};

const getFollowers = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT p.username
    FROM follows f
    JOIN profiles p
      ON f.follower_id = p.user_id
    WHERE f.following_id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Server Error" });
    }

    return res.status(200).json(result);
  });
};
const getFollowing = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT p.username
    FROM follows f
    JOIN profiles p
      ON f.following_id = p.user_id
    WHERE f.follower_id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Server Error" });
    }

    return res.status(200).json(result);
  });
};
module.exports = {
  createPost,
  getallpost,
  updatepost,
  deletePost,
  reactPost,
  followUser,
  unfollowUser,
  getProfile,
  getPostById,
  getMyPosts,
  updateProfile,
  getFollowing,
  getFollowers,
};
