import { Pool } from "@neondatabase/serverless";

export default async function Register(req, res) {
  var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { username, email, password } = req.body;

    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, password]
    );

    return res.status(201).json({
      message: "User registered successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while registering!",
    });
  }
}

//TODO hash