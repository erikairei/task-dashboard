import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createOAuth2Client } from "@/lib/google";
import db from "@/lib/db";

function extractBody(payload: any): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data)
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  if (payload.parts) for (const p of payload.parts) { const t = extractBody(p); if (t) return t; }
  return "";
}
function extractEmail(from: string): string {
  const m = from.match(/<(.+?)>/); return m ? m[1] : from.trim();
}
function extractName(from: string): string {
  const m = from.match(/^([^<]+)</); return m ? m[1].trim() : "";
}

export async function POST() {
  const userId = process.env.APP_USER_ID!;
  const userRes = await db.query(
    "SELECT google_access_token, google_refresh_token, google_token_expiry FROM users WHERE id=$1",
    [userId]
  );
  if (!userRes.rows.length || !userRes.rows[0].google_access_token)
    return NextResponse.json({ error: "Gmail未連携です。Gmail連携ボタンを押してください。" }, { status: 401 });

  const { google_access_token, google_refresh_token, google_token_expiry } = userRes.rows[0];
  const client = createOAuth2Client();
  client.setCredentials({
    access_token: google_access_token,
    refresh_token: google_refresh_token,
    expiry_date: google_token_expiry ? new Date(google_token_expiry).getTime() : undefined,
  });
  client.on("tokens", async (t) => {
    if (t.access_token) await db.query(
      "UPDATE users SET google_access_token=$1, google_token_expiry=$2 WHERE id=$3",
      [t.access_token, t.expiry_date ? new Date(t.expiry_date) : null, userId]
    );
  });

  const gmail = google.gmail({ version: "v1", auth: client });
  const list = await gmail.users.messages.list({ userId: "me", maxResults: 50, q: "in:inbox" });
  const messages = list.data.messages ?? [];
  if (!messages.length) return NextResponse.json({ message: "メールが見つかりませんでした", saved: 0, skipped: 0, total: 0 });

  let saved = 0, skipped = 0;
  for (const msg of messages) {
    if (!msg.id) continue;
    const ex = await db.query("SELECT id FROM tasks WHERE gmail_message_id=$1", [msg.id]);
    if (ex.rows.length) { skipped++; continue; }

    const d = await gmail.users.messages.get({ userId: "me", id: msg.id, format: "full" });
    const h = d.data.payload?.headers ?? [];
    const hv = (n: string) => h.find((x) => x.name?.toLowerCase() === n)?.value ?? "";
    const from = hv("from");
    const dateStr = hv("date");
    const subject = hv("subject") || "(件名なし)";
    const body = extractBody(d.data.payload);

    await db.query(
      `INSERT INTO tasks (user_id, gmail_message_id, gmail_thread_id, subject, sender_email, sender_name,
        received_at, body_text, status, source, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending','gmail',NOW(),NOW())`,
      [
        userId,
        msg.id,
        d.data.threadId ?? null,
        subject.slice(0, 255),
        extractEmail(from),
        extractName(from).slice(0, 255),
        dateStr ? new Date(dateStr) : new Date(),
        body.slice(0, 5000),
      ]
    );
    saved++;
  }
  return NextResponse.json({ message: "同期完了", saved, skipped, total: messages.length });
}
