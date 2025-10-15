import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/lib/db";

// POST /api/snippets
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, language } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const id = uuidv4(); // unique string ID

    // connect to MySQL
    const db = await connectToDatabase();

    // store in DB
    await db.execute(
      "INSERT INTO snippets (id, code, language) VALUES (?, ?, ?)",
      [id, code, language]
    );

    return NextResponse.json({ id }, { status: 200 });
  } catch (err) {
    console.error("Error saving snippet:", err);
    return NextResponse.json({ error: "Failed to save snippet" }, { status: 500 });
  }
}
