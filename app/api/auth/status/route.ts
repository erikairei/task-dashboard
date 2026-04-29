import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    `SELECT google_access_token IS NOT NULL AS connected FROM users WHERE id=$1`,
    [process.env.APP_USER_ID]
  );
  return NextResponse.json({ connected: result.rows[0]?.connected ?? false });
}
