import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { ensureNotificationsTable, createNotification } from "@/lib/notifications";

async function ensureDonationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      message TEXT,
      screenshot_url TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  try {
    await pool.query(`ALTER TABLE donations ADD COLUMN IF NOT EXISTS name VARCHAR(255)`);
    await pool.query(`ALTER TABLE donations ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
    await pool.query(`ALTER TABLE donations ADD COLUMN IF NOT EXISTS message TEXT`);
    await pool.query(`ALTER TABLE donations ADD COLUMN IF NOT EXISTS screenshot_url TEXT`);
    await pool.query(`ALTER TABLE donations ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'`);
  } catch {}
}

// Hardcoded admin user IDs that should receive notifications
const ADMIN_USER_IDS = [1];

export async function POST(req: Request) {
  try {
    await ensureDonationsTable();
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id || null;

    const { name, email, amount, message, screenshot_url } = await req.json();

    if (!name || !email || !amount) {
      return NextResponse.json({ error: "Name, email, and amount are required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO donations (user_id, name, email, amount, message, screenshot_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, name, email, amount, message || null, screenshot_url || null]
    );

    // Notify all admin users (IDs 1..3 by convention)
    await ensureNotificationsTable();
    for (const adminId of ADMIN_USER_IDS) {
      if (String(adminId) !== userId) {
        await createNotification(
          adminId,
          "new_donation",
          `${name} donated Rs ${amount}. Verify payment.`,
          result.rows[0].id,
          "/dashboard/donations"
        );
      }
    }

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureDonationsTable();
    const result = await pool.query(
      `SELECT * FROM donations ORDER BY created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    await pool.query(
      `UPDATE donations SET status = $1 WHERE id = $2`,
      [status, id]
    );

    // Notify the donor that their payment was verified
    const donationResult = await pool.query(
      `SELECT user_id, name, email FROM donations WHERE id = $1`,
      [id]
    );
    if (donationResult.rows.length > 0 && donationResult.rows[0].user_id) {
      await createNotification(
        donationResult.rows[0].user_id,
        "donation_verified",
        `Your donation of Rs has been ${status === "verified" ? "verified" : "rejected"}. Thank you!`,
        Number(id),
        "/dashboard"
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating donation:", error);
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 });
  }
}
