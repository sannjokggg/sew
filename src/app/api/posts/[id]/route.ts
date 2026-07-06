import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const postResult = await pool.query(
      `SELECT posts.*, users.name AS user_name, users.email AS user_email
       FROM posts
       LEFT JOIN users ON posts.user_id = users.id
       WHERE posts.id = $1`,
      [id]
    );

    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const reviewsResult = await pool.query(
      `SELECT reviews.*, users.name AS user_name
       FROM reviews
       LEFT JOIN users ON reviews.user_id = users.id
       WHERE reviews.post_id = $1
       ORDER BY reviews.created_at DESC`,
      [id]
    );

    const commentsResult = await pool.query(
      `SELECT comments.*, users.name AS user_name
       FROM comments
       LEFT JOIN users ON comments.user_id = users.id
       WHERE comments.post_id = $1
       ORDER BY comments.created_at DESC`,
      [id]
    );

    return NextResponse.json({
      ...postResult.rows[0],
      reviews: reviewsResult.rows,
      comments: commentsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}
