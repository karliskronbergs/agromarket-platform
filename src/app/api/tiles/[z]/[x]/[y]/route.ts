import { NextRequest, NextResponse } from "next/server";

// Cache-only proxy for OpenStreetMap tiles. OSM's own tiles are served
// with short, CDN-rotation-friendly cache headers, but a given z/x/y is
// effectively static for our purposes -- re-serving it from our own edge
// with a long Cache-Control cuts repeat-visit cost without changing a
// single pixel the user sees. This proxies real per-visitor requests (not
// a bulk mirror) and identifies itself with a User-Agent, per OSM's tile
// usage policy: https://operations.osmfoundation.org/policies/tiles/

export const runtime = "edge";

function parseTileParam(value: string, stripExt: boolean): number | null {
  const raw = stripExt ? value.replace(/\.png$/, "") : value;
  if (!/^\d+$/.test(raw)) return null;
  return Number(raw);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> },
) {
  const { z, x, y } = await params;

  const zoom = parseTileParam(z, false);
  const xCoord = parseTileParam(x, false);
  const yCoord = parseTileParam(y, true);

  if (
    zoom === null ||
    xCoord === null ||
    yCoord === null ||
    zoom < 0 ||
    zoom > 19 ||
    xCoord >= 2 ** zoom ||
    yCoord >= 2 ** zoom
  ) {
    return NextResponse.json({ error: "Invalid tile coordinates" }, { status: 400 });
  }

  const upstream = await fetch(`https://tile.openstreetmap.org/${zoom}/${xCoord}/${yCoord}.png`, {
    headers: {
      "User-Agent": "lauks24.lv-tile-proxy/1.0 (+https://lauks24.lv)",
    },
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Upstream tile fetch failed" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      // Browser: 7 days. Vercel's edge CDN: 30 days. A specific tile's
      // pixels only change when OSM's underlying map data does, which is
      // rare enough that this is a safe, standard tile-cache lifetime.
      "Cache-Control": "public, max-age=604800, s-maxage=2592000",
    },
  });
}
