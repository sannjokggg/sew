import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const users = await pool.query("SELECT COUNT(*)::int AS count FROM users");
    const posts = await pool.query("SELECT COUNT(*)::int AS count FROM posts");
    const events = await pool.query("SELECT COUNT(*)::int AS count FROM events");
    const offers = await pool.query("SELECT COUNT(*)::int AS count FROM offers");
    const comments = await pool.query("SELECT COUNT(*)::int AS count FROM comments");
    const donations = await pool.query("SELECT COALESCE(SUM(amount), 0)::int AS total FROM donations");
    const eventRegs = await pool.query("SELECT COUNT(*)::int AS count FROM event_registrations");

    const activeUsers = users.rows[0].count;
    const totalPosts = posts.rows[0].count;
    const totalEvents = events.rows[0].count;
    const totalOffers = offers.rows[0].count;
    const totalComments = comments.rows[0].count;
    const totalDonations = donations.rows[0].total;
    const totalEventRegs = eventRegs.rows[0].count;

    const totalActivity = totalPosts + totalOffers + totalComments + totalEventRegs;

    return NextResponse.json({
      activeUsers,
      totalPosts,
      totalEvents,
      totalOffers,
      totalComments,
      totalDonations,
      totalEventRegs,
      totalActivity,
    });
  } catch (error) {
    console.error("About stats error:", error);
    return NextResponse.json({ activeUsers: 0, totalPosts: 0, totalEvents: 0, totalOffers: 0, totalComments: 0, totalDonations: 0, totalEventRegs: 0, totalActivity: 0 });
  }
}
