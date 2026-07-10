import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { initializeAuthTables } from "@/lib/db-init";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        await initializeAuthTables();

        if (credentials?.phone && credentials?.otp) {
          const cleaned = credentials.phone.replace(/\s/g, "");

          const otpResult = await pool.query(
            `SELECT * FROM otp_verifications
             WHERE phone_number = $1 AND verified = FALSE
             ORDER BY created_at DESC LIMIT 1`,
            [cleaned]
          );

          if (otpResult.rows.length === 0) {
            throw new Error("No OTP found. Please request a new code.");
          }

          const otpRecord = otpResult.rows[0];

          if (new Date(otpRecord.expires_at) < new Date()) {
            throw new Error("OTP has expired. Please request a new code.");
          }

          const isValid = await bcrypt.compare(credentials.otp, otpRecord.otp_code);

          if (!isValid) {
            throw new Error("Invalid OTP code");
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

          return {
            id: user.id.toString(),
            email: user.email || `${cleaned}@phone.local`,
            name: user.name,
          };
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const result = await pool.query("SELECT * FROM users WHERE email = $1", [
          credentials.email,
        ]);

        const user = result.rows[0];

        if (!user) {
          throw new Error("No account found with this email");
        }

        if (!user.password) {
          throw new Error("This account uses phone login. Please use phone number to sign in.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await initializeAuthTables();
        const email = user.email;
        if (email) {
          const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
          if (existing.rows.length === 0) {
            const result = await pool.query(
              `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id`,
              [user.name || "User", email]
            );
            user.id = result.rows[0].id.toString();
          } else {
            user.id = existing.rows[0].id.toString();
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
