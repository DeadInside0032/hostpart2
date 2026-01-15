import { Pool } from "@neondatabase/serverless";

export default async function Add(req, res) {
  var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { requesterName, receiverName, status } = req.body;

    const result = await pool.query(
      "INSERT INTO friendships (requester_name, receiver_name, status) VALUES ($1, $2, $3)",
      [requesterName, receiverName, status]
    );

    return res.status(200).json({ message: "Friend request sent!" });
  } catch (error) {
    return res.status(500).json({ message: "Error while adding friend", error: error.message });
  }
}
