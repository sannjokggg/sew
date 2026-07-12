import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    const cleaned = phoneNumber.replace(/\s/g, "");

    const result = await pool.query(
      `SELECT * FROM otp_verifications
       WHERE phone_number = $1 AND verified = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [cleaned]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new code." },
        { status: 400 }
      );
    }

    const otpRecord = result.rows[0];

    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp_code);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE otp_verifications SET verified = TRUE WHERE id = $1`,
      [otpRecord.id]
    );

    let userResult = await pool.query(
      "SELECT id, name, email FROM users WHERE phone_number = $1",
      [cleaned]
    );

    if (userResult.rows.length === 0) {
      userResult = await pool.query(
        `INSERT INTO users (name, phone_number) VALUES ($1, $2)
         RETURNING id, name, email`,
        ["User", cleaned]
      );
    }

    const user = userResult.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email || null,
        phone: cleaned,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
