/*import { Pool } from "@neondatabase/serverless";

export default async function Friends(req, res) {
  var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { receiverName } = req.body;

    const result = await pool.query(
      "SELECT * FROM friendships WHERE (receiver_name = $1 OR requester_name = $1) AND status = 'pending'",
      [receiverName]
    );

    return res.status(200).json({ acceptedFriends: result.rows[0] });
  } catch (error) { 
    console.log(error);
    return res.status(500).json({ error: error });
  }
}*/
