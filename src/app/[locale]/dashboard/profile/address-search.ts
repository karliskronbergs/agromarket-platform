"use server";

// Photon (photon.komoot.io) is a free, no-key OSM geocoder built for
// search-as-you-type use, unlike Nominatim's public instance (used
// elsewhere for the one-time geocode-on-save) whose usage policy
// explicitly disallows autocomplete-style querying.
const LATVIA_BBOX = "20.9,55.6,28.3,58.1";

function formatAddress(p: Record<string, string | undefined>) {
  const candidates = [p.name, p.street, p.city, p.state, p.postcode, p.country];
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const c of candidates) {
    if (c && !seen.has(c)) {
      seen.add(c);
      parts.push(c);
    }
  }
  return parts.join(", ");
}

export async function searchAddresses(query: string): Promise<string[]> {
  if (query.trim().length < 3) return [];

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=lv&bbox=${LATVIA_BBOX}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = (await res.json()) as {
      features: Array<{ properties: Record<string, string | undefined> }>;
    };

    const labels = data.features.map((f) => formatAddress(f.properties)).filter(Boolean);
    return Array.from(new Set(labels));
  } catch {
    return [];
  }
}
