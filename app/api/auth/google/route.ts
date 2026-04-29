import { NextResponse } from "next/server";
import { createOAuth2Client, getAuthUrl } from "@/lib/google";
export async function GET() {
  return NextResponse.redirect(getAuthUrl(createOAuth2Client()));
}
