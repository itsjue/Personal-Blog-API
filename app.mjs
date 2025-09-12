import express from "express";
import cors from "cors";
import connectionPool from "./utils/db.js";

const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.post("/posts", async (req, res) => {
    const {title, image, category_id, description, content, status_id} = req.body;

    if (!title || !image || !category_id || !description || !content || !status_id) {
        return res.status(400).json({
            message: "Server could not create post because there are missing data from client"
        });
    }
  try {
    const newPost = {
      ...req.body,
      date: new Date(),
    };

    await connectionPool.query(
      `INSERT INTO posts 
   (title, image, category_id, description, date, content, status_id)
   VALUES ($1, $2, $3, $4, NOW(), $5, $6)`,
      [
        newPost.title,
        newPost.image,
        newPost.category_id,
        newPost.description,
        newPost.content,
        newPost.status_id,
      ]
    );

    return res.status(201).json({
      message: "Create post successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server could not create post because database connection",
    });
  }
});

app.get("/posts", async (req, res) => {
    try {
        const results = await connectionPool.query(`SELECT * FROM POSTS`);
        console.log(results);

        return res.status(200).json({
            data: results.rows,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Server could not read post because database connection"
        })
    }
});

app.get("/posts/:id", async (req, res) => {
    try {
        const postId = req.params.id;
        const results = await connectionPool.query(`
            SELECT * FROM posts WHERE id = $1`
        ,[postId]);

        if (results.rows.length === 0) {
      return res.status(404).json({
        message: "Server could not find a requested post"
      });
    }

        return res.status(200).json({
            data: results.rows[0]
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Server could not read post because database connection"
        });
    }
});

app.put("/posts/:id", async (req, res) => {
    try {
        const postId = req.params.id;
        const updatedPost = {...req.body, date: new Date()};

        const results = await connectionPool.query(`
            UPDATE posts
            set image = $2,
            category_id = $3,
            title = $4,
            description = $5,
            date = $6,
            content = $7,
            status_id = $8
            WHERE id = $1
            RETURNING *
            `,
        [
            postId,
            updatedPost.image,
            updatedPost.category_id,
            updatedPost.title,
            updatedPost.description,
            updatedPost.date,
            updatedPost.content,
            updatedPost.status_id,
        ]);

        if (results.rows.length === 0) {
            return res.status(404).json({
                message: "Server could not find a requested post to update"
            });
        }

        return res.status(200).json({
            message: "Updated post successfully"
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Server could not update post because database connection"
        });
    }
});

app.delete("/posts/:id", async (req, res) => {
    try {
        const postId = req.params.id;

        const results = await connectionPool.query(`
            DELETE FROM posts
            where id = $1
            RETURNING *`,
        [postId]);

        if (results.rows.length === 0) {
            return res.status(404).json({
                message: "Server could not find a requested post to delete"
            });
        }

        return res.status(200).json({
            message: "Deleted post successfully"
        });

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Server could not delete post because database connection"
        });
    }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
