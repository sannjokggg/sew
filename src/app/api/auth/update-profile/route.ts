import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, name } = await req.json();

    if (!userId || !name) {
      return NextResponse.json({ error: "User ID and name are required" }, { status: 400 });
    }

    await pool.query("UPDATE users SET name = $1 WHERE id = $2", [name, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
