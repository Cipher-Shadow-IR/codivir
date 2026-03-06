import express from "express";
import cors from "cors";
import { randomBytes } from "crypto";
import 'dotenv/config';
import { Server } from "socket.io";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const httpServer = createServer(app);

// 1. Rate Limiting (Abuse Prevention)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use("/api/", limiter);

// 2. Validation Schema
const SnippetSchema = z.object({
  codes: z.record(z.string()),
  language: z.string().max(20),
  theme: z.enum(["light", "dark"]).optional(),
});

// Connect to SQLite (Local file database)
let db;
try {
  db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
  console.log("SQLite Database connected successfully.");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS snippets (
      id TEXT PRIMARY KEY,
      codes TEXT NOT NULL,
      language TEXT NOT NULL,
      theme TEXT DEFAULT 'light',
      createdAt INTEGER NOT NULL
    )
  `);
} catch (err) {
  console.error("Database initialization failed:", err);
}

// 3. Socket.io Integration
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-snippet", (id) => {
    socket.join(id);
    console.log(`Socket ${socket.id} joined snippet: ${id}`);
  });

  socket.on("code-change", async (data) => {
    socket.to(data.id).emit("code-update", data);
  });

  socket.on("typing", (data) => {
    // data: { id: snippetId, username: string, language: string }
    socket.to(data.id).emit("user-typing", { 
      username: data.username, 
      language: data.language 
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Create new snippet
app.post("/api/snippets", async (req, res) => {
  try {
    const validated = SnippetSchema.parse(req.body);
    const id = randomBytes(4).toString("hex");
    const { codes, language, theme } = validated;
    const createdAt = Date.now();

    await db.run(
      "INSERT INTO snippets (id, codes, language, theme, createdAt) VALUES (?, ?, ?, ?, ?)",
      [id, JSON.stringify(codes), language, theme || "light", createdAt]
    );

    res.json({ id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get snippet by id
app.get("/api/snippets/:id", async (req, res) => {
  try {
    const snippet = await db.get(
      "SELECT * FROM snippets WHERE id = ?",
      [req.params.id]
    );

    if (!snippet) return res.status(404).json({ error: "Not found" });

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
    const validated = SnippetSchema.parse(req.body);
    const { codes, language, theme } = validated;
    await db.run(
      "UPDATE snippets SET codes = ?, language = ?, theme = ? WHERE id = ?",
      [JSON.stringify(codes), language, theme || "light", req.params.id]
    );
    res.json({ id: req.params.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Auto cleanup
setInterval(async () => {
  try {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    await db.run("DELETE FROM snippets WHERE createdAt < ?", [cutoff]);
  } catch (err) {
    console.error(err);
  }
}, 60000);

app.get("/", (_, res) => res.send("CODIVIR real-time backend running 🧠 (SQLite Mode)"));

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));


