import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { post_id, rating, content } = await req.json();

    if (!post_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Post ID and rating (1-5) are required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO reviews (post_id, user_id, rating, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [post_id, userId, rating, content || null]
    );

    const reviewWithUser = await pool.query(
      `SELECT reviews.*, users.name AS user_name
       FROM reviews
       LEFT JOIN users ON reviews.user_id = users.id
       WHERE reviews.id = $1`,
      [result.rows[0].id]
    );

    return NextResponse.json(reviewWithUser.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
