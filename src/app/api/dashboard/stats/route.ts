import { NextResponse } from "next/server";
import pool from "@/lib/db";

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, user_id)
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function GET() {
  try {
    await ensureTables();

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const fmt = (d: Date) => d.toISOString();

    // Items Reused
    const itemsThis = await pool.query(
      `SELECT COUNT(*)::int AS count FROM posts WHERE created_at >= $1 AND created_at < $2`,
      [fmt(firstOfMonth), fmt(firstOfNextMonth)]
    );
    const itemsLast = await pool.query(
      `SELECT COUNT(*)::int AS count FROM posts WHERE created_at >= $1 AND created_at < $2`,
      [fmt(firstOfLastMonth), fmt(firstOfMonth)]
    );
    const itemsReused = itemsThis.rows[0].count;
    const itemsLastCount = itemsLast.rows[0].count;
    const itemsChange = itemsLastCount > 0 ? Math.round(((itemsReused - itemsLastCount) / itemsLastCount) * 100) : 0;

    // Donations Made
    const donationsThis = await pool.query(
      `SELECT COUNT(*)::int AS count FROM donations WHERE created_at >= $1 AND created_at < $2`,
      [fmt(firstOfMonth), fmt(firstOfNextMonth)]
    );
    const donationsLast = await pool.query(
      `SELECT COUNT(*)::int AS count FROM donations WHERE created_at >= $1 AND created_at < $2`,
      [fmt(firstOfLastMonth), fmt(firstOfMonth)]
    );
    const donationsMade = donationsThis.rows[0].count;
    const donationsLastCount = donationsLast.rows[0].count;
    const donationsChange = donationsLastCount > 0 ? Math.round(((donationsMade - donationsLastCount) / donationsLastCount) * 100) : 0;

    // People Helped (users who have sent offers or created posts)
    const peopleThis = await pool.query(
      `SELECT COUNT(DISTINCT user_id)::int AS count FROM (
        SELECT user_id FROM offers WHERE created_at >= $1 AND created_at < $2
        UNION
        SELECT user_id FROM posts WHERE created_at >= $1 AND created_at < $2
      ) AS active_users`,
      [fmt(firstOfMonth), fmt(firstOfNextMonth)]
    );
    const peopleLast = await pool.query(
      `SELECT COUNT(DISTINCT user_id)::int AS count FROM (
        SELECT user_id FROM offers WHERE created_at >= $1 AND created_at < $2
        UNION
        SELECT user_id FROM posts WHERE created_at >= $1 AND created_at < $2
      ) AS active_users`,
      [fmt(firstOfLastMonth), fmt(firstOfMonth)]
    );
    const peopleHelped = peopleThis.rows[0].count;
    const peopleLastCount = peopleLast.rows[0].count;
    const peopleChange = peopleLastCount > 0 ? Math.round(((peopleHelped - peopleLastCount) / peopleLastCount) * 100) : 0;

    // Events Joined
    const eventsThis = await pool.query(
      `SELECT COUNT(*)::int AS count FROM event_registrations WHERE created_at >= $1 AND created_at < $2`,
      [fmt(firstOfMonth), fmt(firstOfNextMonth)]
    );
    const eventsLast = await pool.query(
      `SELECT COUNT(*)::int AS count FROM event_registrations WHERE created_at >= $1 AND created_at < $2`,
      [fmt(firstOfLastMonth), fmt(firstOfMonth)]
    );
    const eventsJoined = eventsThis.rows[0].count;
    const eventsLastCount = eventsLast.rows[0].count;
    const eventsChange = eventsLastCount > 0 ? Math.round(((eventsJoined - eventsLastCount) / eventsLastCount) * 100) : 0;

    return NextResponse.json({
      itemsReused,
      itemsChange,
      donationsMade,
      donationsChange,
      peopleHelped,
      peopleChange,
      eventsJoined,
      eventsChange,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
