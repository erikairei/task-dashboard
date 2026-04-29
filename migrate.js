const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const p = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  await p.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT");
  await p.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT");
  await p.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_token_expiry TIMESTAMPTZ");
  await p.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS gmail_message_id TEXT UNIQUE");
  await p.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sender_email TEXT");
  await p.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'");
  await p.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ");
  console.log("Migration Done!");
  await p.end();
})().catch(e => { console.error(e.message); process.exit(1); });
