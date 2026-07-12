import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { initializeAuthTables } from "@/lib/db-init";
import { uploadToImageKit } from "@/lib/upload";

async function saveFile(file: File): Promise<string | null> {
  return uploadToImageKit(file);
}

export async function POST(req: Request) {
  try {
    await initializeAuthTables();

    const formData = await req.formData();
    const phoneNumber = formData.get("phoneNumber") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string | null;
    const dob = formData.get("dob") as string | null;
    const address = formData.get("address") as string | null;

    if (!phoneNumber || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Phone number, first name, and last name are required" },
        { status: 400 }
      );
    }

    const cleaned = phoneNumber.replace(/\s/g, "");
    const fullName = `${firstName} ${lastName}`;

    const existing = await pool.query(
      "SELECT id FROM users WHERE phone_number = $1",
      [cleaned]
    );

    if (email) {
      const emailCheck = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND phone_number != $2",
        [email, cleaned]
      );
      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { error: "This email is already registered with another account" },
          { status: 400 }
        );
      }
    }

    let profilePhotoUrl: string | null = null;
    let idCardUrl: string | null = null;

    const profilePhotoFile = formData.get("profilePhoto") as File | null;
    if (profilePhotoFile && profilePhotoFile.size > 0) {
      profilePhotoUrl = await saveFile(profilePhotoFile);
    }

    const idCardFile = formData.get("idCard") as File | null;
    if (idCardFile && idCardFile.size > 0) {
      idCardUrl = await saveFile(idCardFile);
    }

    if (existing.rows.length > 0) {
      const sets: string[] = ["name = $1", "first_name = $2", "last_name = $3"];
      const values: unknown[] = [fullName, firstName, lastName];
      let idx = 4;

      if (email) {
        sets.push(`email = $${idx}`);
        values.push(email);
        idx++;
      }
      if (dob) {
        sets.push(`dob = $${idx}`);
        values.push(dob);
        idx++;
      }
      if (address) {
        sets.push(`address = $${idx}`);
        values.push(address);
        idx++;
      }
      if (profilePhotoUrl) {
        sets.push(`profile_photo = $${idx}`);
        values.push(profilePhotoUrl);
        idx++;
      }
      if (idCardUrl) {
        sets.push(`id_card_url = $${idx}`);
        values.push(idCardUrl);
        idx++;
      }

      values.push(existing.rows[0].id);
      await pool.query(
        `UPDATE users SET ${sets.join(", ")} WHERE id = $${idx}`,
        values
      );

      return NextResponse.json({ success: true, userId: existing.rows[0].id });
    } else {
      const result = await pool.query(
        `INSERT INTO users (name, first_name, last_name, email, phone_number, dob, address, profile_photo, id_card_url, verification_status, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', FALSE)
         RETURNING id`,
        [
          fullName,
          firstName,
          lastName,
          email || null,
          cleaned,
          dob || null,
          address || null,
          profilePhotoUrl,
          idCardUrl,
        ]
      );

      return NextResponse.json({
        success: true,
        userId: result.rows[0].id,
      });
    }
  } catch (error) {
    console.error("Register phone error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
