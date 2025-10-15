import express from "express";
import cors from "cors";
import { randomBytes } from "crypto";
import mysql from "mysql2/promise";
import 'dotenv/config';


const app = express();
app.use(cors());
app.use(express.json());

// Connect to Railway MySQL
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
});

// Ensure table exists (JSON codes + language + theme)
await connection.execute(`
  CREATE TABLE IF NOT EXISTS snippets (
    id VARCHAR(8) PRIMARY KEY,
    codes JSON NOT NULL,
    language VARCHAR(20) NOT NULL,
    theme VARCHAR(10) DEFAULT 'light',
    createdAt BIGINT NOT NULL
  )
`);

// Create new snippet
app.post("/api/snippets", async (req, res) => {
  try {
    const id = randomBytes(4).toString("hex");
    const { codes, language, theme } = req.body;
    const createdAt = Date.now();

    await connection.execute(
      "INSERT INTO snippets (id, codes, language, theme, createdAt) VALUES (?, ?, ?, ?, ?)",
      [id, JSON.stringify(codes), language, theme || "light", createdAt]
    );

    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get snippet by id
app.get("/api/snippets/:id", async (req, res) => {
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM snippets WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Not found" });

    const snippet = rows[0];

    // Only parse if it's a string
    if (typeof snippet.codes === "string") {
      try {
        snippet.codes = JSON.parse(snippet.codes);
      } catch (err) {
        console.error("Failed to parse codes JSON:", err);
        snippet.codes = {};
      }
    }

    res.json(snippet);
  } catch (err) {
    console.error("GET snippet error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Update snippet (PUT)
app.put("/api/snippets/:id", async (req, res) => {
  try {
    const { codes, language, theme } = req.body;
    await connection.execute(
      "UPDATE snippets SET codes = ?, language = ?, theme = ? WHERE id = ?",
      [JSON.stringify(codes), language, theme || "light", req.params.id]
    );
    res.json({ id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Auto cleanup every minute (remove older than 48h)
setInterval(async () => {
  try {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    await connection.execute("DELETE FROM snippets WHERE createdAt < ?", [cutoff]);
  } catch (err) {
    console.error(err);
  }
}, 60000);

app.get("/", (_, res) => res.send("CODIVIR backend running 🧠"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
