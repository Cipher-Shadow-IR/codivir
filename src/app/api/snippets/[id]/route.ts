import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// GET /api/snippets/:id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: snippetId } = await context.params;
  const db = await connectToDatabase();

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT code, language FROM snippets WHERE id = ?",
    [snippetId]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

// PUT /api/snippets/:id
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: snippetId } = await context.params;
    const body = await req.json();
    const { code, language } = body;


    if (!body.code || typeof body.code !== "string") {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const db = await connectToDatabase();

    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE snippets SET code = ?, language = ? WHERE id = ?",
      [code, language, snippetId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating snippet:", err);
    return NextResponse.json({ error: "Failed to update snippet" }, { status: 500 });
  }
}
