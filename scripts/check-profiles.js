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

  const { count: totalProfiles } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  const { count: activeProfiles } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  console.log("total profiles:", totalProfiles, "active:", activeProfiles);

  const { data: sample } = await supabase
    .from("profiles")
    .select("id, business_name, status, lat, lng, address")
    .eq("status", "active")
    .limit(6);
  for (const p of sample ?? []) {
    console.log(" ", p.id, p.business_name, p.address, p.lat, p.lng);
  }

  const { data: cats } = await supabase
    .from("categories")
    .select("id, slug, name_lv, parent_id")
    .is("parent_id", null)
    .order("sort_order");
  console.log("top categories:");
  for (const c of cats ?? []) console.log(" ", c.id, c.slug, c.name_lv);
}
main();
