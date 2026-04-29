import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = process.env.APP_USER_ID!;
  const { status } = await req.json();
  if (!["pending", "in_progress", "done"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const result = await db.query(
    `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING id, status`,
    [status, id, userId]
  );
  if (result.rows.length === 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ task: result.rows[0] });
}
