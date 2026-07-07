import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

async function ensureOffersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS offers (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT,
      offer_item TEXT,
      offer_images TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET(req: Request) {
  try {
    await ensureOffersTable();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("post_id");

    if (!postId) {
      return NextResponse.json({ error: "post_id required" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT offers.*, users.name AS user_name, users.email AS user_email
       FROM offers
       LEFT JOIN users ON offers.user_id = users.id
       WHERE offers.post_id = $1
       ORDER BY offers.created_at DESC`,
      [postId]
    );

    const offers = result.rows.map((row) => {
      if (row.offer_images) {
        try { row.offer_images = JSON.parse(row.offer_images); } catch { row.offer_images = []; }
      } else {
        row.offer_images = [];
      }
      return row;
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureOffersTable();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { post_id, message, offer_item, offer_images } = await req.json();

    if (!post_id) {
      return NextResponse.json({ error: "post_id required" }, { status: 400 });
    }

    const imagesJson = offer_images && offer_images.length > 0 ? JSON.stringify(offer_images) : null;

    const result = await pool.query(
      `INSERT INTO offers (post_id, user_id, message, offer_item, offer_images)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [post_id, userId, message || "", offer_item || "", imagesJson]
    );

    const offer = result.rows[0];
    offer.offer_images = offer_images || [];
    offer.user_name = session.user.name || "Anonymous";
    offer.user_email = session.user.email || "";

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await ensureOffersTable();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    await pool.query(
      `UPDATE offers SET status = $1 WHERE id = $2`,
      [status, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}
