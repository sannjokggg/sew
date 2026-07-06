import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

async function ensureEventsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      event_date DATE NOT NULL,
      event_time TIME,
      location VARCHAR(255),
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function GET() {
  try {
    await ensureEventsTable();
    const result = await pool.query(
      `SELECT events.*, COALESCE(users.name, 'Anonymous') AS organizer_name
       FROM events
       LEFT JOIN users ON events.user_id = users.id
       ORDER BY events.event_date ASC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureEventsTable();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { title, description, category, event_date, event_time, location, image_url } = await req.json();

    if (!title || !description || !category || !event_date) {
      return NextResponse.json({ error: "Title, description, category, and date are required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO events (user_id, title, description, category, event_date, event_time, location, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, title, description, category, event_date, event_time || null, location || null, image_url || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
