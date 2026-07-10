import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { post_id, content } = await req.json();

    if (!post_id || !content) {
      return NextResponse.json({ error: "Post ID and content are required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [post_id, userId, content]
    );

    const commentWithUser = await pool.query(
      `SELECT comments.*, users.name AS user_name
       FROM comments
       LEFT JOIN users ON comments.user_id = users.id
       WHERE comments.id = $1`,
      [result.rows[0].id]
    );

    // Notify post owner
    const postResult = await pool.query("SELECT user_id, title FROM posts WHERE id = $1", [post_id]);
    if (postResult.rows.length > 0) {
      const postOwnerId = postResult.rows[0].user_id;
      if (String(postOwnerId) !== userId) {
        await createNotification(
          postOwnerId,
          "new_comment",
          `${session.user.name || "Someone"} commented on "${postResult.rows[0].title}"`,
          Number(post_id),
          `/dashboard/marketplace/${post_id}`
        );
      }
    }

    return NextResponse.json(commentWithUser.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
