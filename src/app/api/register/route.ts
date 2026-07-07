import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { initializeAuthTables } from "@/lib/db-init";

export async function POST(req: Request) {
  try {
    const { name, email, password, phoneNumber } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: "Either email or phone number is required" },
        { status: 400 }
      );
    }

    if (email && !password) {
      return NextResponse.json(
        { error: "Password is required when registering with email" },
        { status: 400 }
      );
    }

    await initializeAuthTables();

    if (email) {
      const existingEmail = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      if (existingEmail.rows.length > 0) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
    }

    if (phoneNumber) {
      const cleaned = phoneNumber.replace(/\s/g, "");
      const existingPhone = await pool.query(
        "SELECT id FROM users WHERE phone_number = $1",
        [cleaned]
      );
      if (existingPhone.rows.length > 0) {
        return NextResponse.json({ error: "Phone number already exists" }, { status: 400 });
      }
    }

    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
    const cleanedPhone = phoneNumber ? phoneNumber.replace(/\s/g, "") : null;

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone_number)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone_number`,
      [name, email || null, hashedPassword, cleanedPhone]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
