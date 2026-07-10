import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT events.*, COALESCE(users.name, 'Anonymous') AS organizer_name
       FROM events
       LEFT JOIN users ON events.user_id = users.id
       WHERE events.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    const existing = await pool.query("SELECT user_id FROM events WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (String(existing.rows[0].user_id) !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { title, description, category, event_date, event_time, location, image_url } = await req.json();

    const result = await pool.query(
      `UPDATE events SET title = $1, description = $2, category = $3, event_date = $4, event_time = $5, location = $6, image_url = $7
       WHERE id = $8 RETURNING *`,
      [title, description, category, event_date, event_time || null, location || null, image_url || null, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
