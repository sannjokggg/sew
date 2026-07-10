import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, name, email } = await req.json();

    if (!userId || !name) {
      return NextResponse.json({ error: "User ID and name are required" }, { status: 400 });
    }

    if (email) {
      await pool.query("UPDATE users SET name = $1, email = $2 WHERE id = $3", [name, email, userId]);
    } else {
      await pool.query("UPDATE users SET name = $1 WHERE id = $2", [name, userId]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
