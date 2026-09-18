import type { SupabaseClient } from "@supabase/supabase-js";
import type { AttributeInfo } from "@/components/attribute-badges";

export async function getAttributesByProfileIds(
  supabase: SupabaseClient,
  profileIds: string[],
): Promise<Map<string, AttributeInfo[]>> {
  const map = new Map<string, AttributeInfo[]>();
  if (profileIds.length === 0) return map;

  const { data } = await supabase
    .from("profile_attribute_links")
    .select("profile_id, attributes(icon, name_lv, name_en)")
    .in("profile_id", profileIds);

  for (const row of data ?? []) {
    const attr = row.attributes as unknown as AttributeInfo | null;
    if (!attr) continue;
    const list = map.get(row.profile_id) ?? [];
    list.push(attr);
    map.set(row.profile_id, list);
  }
  return map;
}
