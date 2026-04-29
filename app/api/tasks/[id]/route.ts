import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = process.env.APP_USER_ID!;
  const result = await db.query(
    `SELECT t.*, cc.customer_info, cc.case_info, cc.required_docs, hc.history_items, EXTRACT(EPOCH FROM (t.deadline - NOW())) AS seconds_remaining FROM tasks t LEFT JOIN customer_cache cc ON t.case_number = cc.case_number LEFT JOIN history_cache hc ON t.case_number = hc.case_number WHERE t.id = $1 AND t.user_id = $2`,
    [params.id, userId]
  );
  if (result.rows.length === 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ task: result.rows[0] });
}
