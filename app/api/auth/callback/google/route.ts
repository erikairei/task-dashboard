import { NextRequest, NextResponse } from "next/server";
import { createOAuth2Client } from "@/lib/google";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  if (error) return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, request.url));
  if (!code) return NextResponse.redirect(new URL("/?error=no_code", request.url));
  try {
    const client = createOAuth2Client();
    const { tokens } = await client.getToken(code);
    if (!tokens.access_token) throw new Error("No token");
    await pool.query(
      `UPDATE users SET google_access_token=$1, google_refresh_token=$2, google_token_expiry=$3 WHERE id=$4`,
      [
        tokens.access_token,
        tokens.refresh_token ?? null,
        tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        process.env.APP_USER_ID,
      ]
    );
    return NextResponse.redirect(new URL("/?auth=success", request.url));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
