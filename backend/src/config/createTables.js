const db = require("./db");

const createTables = () => {
  // USERS TABLE
  const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,

            email VARCHAR(100) UNIQUE NOT NULL,

            password VARCHAR(255) NOT NULL,

            role ENUM('admin', 'user') DEFAULT 'user',

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

  // PROFILES TABLE
  const profilesTable = `
        CREATE TABLE IF NOT EXISTS profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT UNIQUE,

            username VARCHAR(100),

            first_name VARCHAR(100),

            last_name VARCHAR(100),

            dob DATE,

            gender ENUM('male', 'female', 'other'),

            permissions VARCHAR(255),

            profile_image VARCHAR(255),

            bio TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        )
    `;

  const postsTable = `
    CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,

        user_id INT NOT NULL,

        image_url VARCHAR(255),

        description TEXT,

        location VARCHAR(255),


        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    )
`;
  const likesTable = `
    CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,

        user_id INT NOT NULL,

        post_id INT NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

        UNIQUE(user_id, post_id)
    )
`;
  const followstable = `
create table if not exists follows(
id int auto_increment primary key,
follower_id int not null,
following_id int not null,

created_at timestamp default current_timestamp,
foreign key (follower_id)
references users(id)
on delete cascade,

foreign key (following_id)
references users(id)
on delete cascade,
UNIQUE(follower_id, following_id)
)

`;

  // CREATE USERS TABLE
  db.query(usersTable, (err) => {
    if (err) {
      console.log("Users table error:", err);
    } else {
      console.log("Users table ready ✅");

      // CREATE PROFILES TABLE
      db.query(profilesTable, (err) => {
        if (err) {
          console.log("Profiles table error:", err);
        } else {
          console.log("Profiles table ready ✅");

          db.query(postsTable, (err) => {
            if (err) {
              console.log("Posts table error:", err);
            } else {
              console.log("Posts table ready ✅");

              db.query(likesTable, (err) => {
                if (err) {
                  console.log("Likes table error:", err);
                } else {
                  console.log("Likes table ready ✅");
                }
              });
              db.query(followstable, (err) => {
                if (err) {
                  console.log("followstable table error:", err);
                } else {
                  console.log("followstable table ready ✅");
                }
              });
            }
          });
        }
      });
    }
  });
};

module.exports = createTables;
