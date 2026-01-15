import { Pool } from "@neondatabase/serverless";

export default async function Login(req, res) {
  var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password!" });
    } else {
      return res.status(200).json({
        message: "Login Successful!",
        user: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          email: result.rows[0].email,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error while logging in!" });
  }
}
//TODO hash passwords
