import pool from "@/lib/db";

export async function ensureNotificationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      related_id INTEGER,
      link TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function createNotification(
  userId: number,
  type: string,
  message: string,
  relatedId?: number,
  link?: string
) {
  try {
    await ensureNotificationsTable();
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, related_id, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, message, relatedId || null, link || null]
    );
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
