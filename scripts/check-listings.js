// One-off: check listing counts and expiry status (visual QA helper, not app code).
const fs = require("fs");
for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) process.env[m[1]] = m[2];
}
const { createClient } = require("@supabase/supabase-js");

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { count: total } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true });

  const { count: active } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString());

  const { data: sample } = await supabase
    .from("listings")
    .select("id, title, status, expires_at, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  console.log("total listings:", total);
  console.log("active & not expired:", active);
  console.log("most recent 10:");
  for (const l of sample ?? []) {
    console.log(`  ${l.status.padEnd(10)} expires=${l.expires_at} :: ${l.title}`);
  }
}

main();
