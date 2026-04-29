import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const userId = process.env.APP_USER_ID!;

  await db.query(
    `UPDATE tasks SET is_confirmed = true, updated_at = NOW() WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  await db.query(
    `UPDATE notifications SET sent = true WHERE task_id = $1`,
    [id]
  );

  return NextResponse.json({ confirmed: true });
}