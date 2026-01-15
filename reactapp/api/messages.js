import { Pool } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  if (req.method === "POST") {
    // Üzenet küldése
    const { sender, receiver, content } = req.body;
    try {
      await pool.query(
        "INSERT INTO messages (sender, receiver, content) VALUES ($1, $2, $3)",
        [sender, receiver, content]
      );
      return res.status(201).json({ message: "Message sent" });
    } catch (error) {
      return res.status(500).json({ message: "Error sending message", error: error.message });
    }
  } else if (req.method === "GET") {
    // Üzenetek lekérése két user között
    const { user1, user2 } = req.query;
    try {
      const result = await pool.query(
        `SELECT * FROM messages WHERE (sender = $1 AND receiver = $2) OR (sender = $2 AND receiver = $1) ORDER BY sent_at ASC`,
        [user1, user2]
      );
      return res.status(200).json({ messages: result.rows });
    } catch (error) {
      return res.status(500).json({ message: "Error fetching messages", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
