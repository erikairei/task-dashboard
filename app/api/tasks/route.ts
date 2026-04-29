import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = process.env.APP_USER_ID!;
  try {
    const result = await db.query(
      `SELECT id, user_id, gmail_message_id, subject, sender_email, sender_name,
              received_at, body_text AS description, ai_summary, ai_category,
              ai_priority AS priority, deadline, status, assigned_to, notes,
              source, created_at, updated_at,
              EXTRACT(EPOCH FROM (deadline - NOW())) AS seconds_remaining
       FROM tasks
       WHERE user_id = $1
       ORDER BY deadline ASC NULLS LAST, created_at DESC`,
      [userId]
    );
    return NextResponse.json({ tasks: result.rows });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
