import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const userId = process.env.APP_USER_ID!;

  const result = await db.query(
    `SELECT t.*, cc.customer_info, cc.case_info, cc.required_docs, hc.history_items
     FROM tasks t
     LEFT JOIN customer_cases cc ON t.case_id = cc.id
     LEFT JOIN history_cache hc ON t.id = hc.task_id
     WHERE t.id = $1 AND t.user_id = $2`,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task: result.rows[0] });
}
