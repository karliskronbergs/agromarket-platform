# Visual verification — make the site match the prototypes

The prototypes (`Lauks24 A.dc.html` desktop, `Lauks24 Mobile.dc.html` mobile) are the **source of truth**. Don't rely on reading the README alone: render both versions and compare screenshots until they match.

## How to compare (do this for EVERY page)
1. Serve this folder statically (e.g. `npx serve design_handoff_lauks24_redesign`). Open `Lauks24 A.dc.html` (desktop) and `Lauks24 Mobile.dc.html` (mobile). Props such as `startPage` can be changed in the code defaults to reach each page.
2. Run the real app locally.
3. Use Playwright (install it if it's missing) to screenshot the prototype and the real page at the **same width**: desktop 1440px, mobile 390px.
4. List every difference in layout, spacing, sizes, colours, fonts, borders, radius and missing elements. Fix them, then screenshot again. Repeat until there are no differences.
5. Read the prototype source for exact values. Every style is inline in the `.dc.html` files, so copy the numbers directly instead of guessing.

## Known problems to fix first
- **"Trīs veidi, kā izmantot lauks24.lv" (desktop):** 3 cards in ONE row. `display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px` from 900px up; below 900px, 1 column. On **mobile** it is a single white card with 3 rows split by dividers, not 3 separate cards (see `Lauks24 Mobile.dc.html`).
- **"Pārlūko pēc nozares":**
  - Desktop: horizontal grid, `grid-template-columns:repeat(auto-fill,minmax(200px,1fr))`, so 5 cards in one row at 1280px.
  - Mobile: a horizontal **swipe carousel** (`display:flex; overflow-x:auto; gap:10px; padding:0 16px; scrollbar-width:none; scroll-snap-type:x mandatory`), with cards `flex:0 0 132px`. NOT a vertical stack.
- **"Jaunākie sludinājumi" (mobile):** the same horizontal carousel, cards `flex:0 0 220px`.
- **Company profile page:** not implemented. Build it fully per the prototype: cover, overlapping avatar, name + Pārbaudīts + badges, actions, tabs, contacts card, mini map. On mobile add the fixed bottom action bar.
- **Map page (mobile):** not implemented. It needs:
  - a fixed filter block: segmented control, search, horizontally scrolling chips
  - **either** the list **or** a full-height map, never both
  - a floating "Rādīt kartē / Rādīt sarakstu" pill
  - a bottom card for the selected marker
  - a green + button (FAB)
  - the bottom tab bar

## Done = 
For every page in CHECKLIST.md, the desktop and mobile screenshots of the real site look the same as the prototype screenshots. Real data and images are expected to differ. Show me the before/after screenshots for each page.
