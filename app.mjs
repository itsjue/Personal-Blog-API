import express from "express";
import cors from "cors";
import connectionPool from "./utils/db.js";

const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.post("/posts", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
