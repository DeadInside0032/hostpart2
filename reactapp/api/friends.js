import { Pool } from "@neondatabase/serverless";

export default async function Friends(req, res) {
  var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { username } = req.body;
    const result = await pool.query(
      "SELECT * FROM friendships WHERE (receiver_name = $1 OR requester_name = $1) AND status = 'accepted'",
      [username]
    );
    const friends = result.rows.map(row =>
      row.requester_name === username ? row.receiver_name : row.requester_name
    );
    return res.status(200).json({ friends });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
