# Handoff: lauks24.lv redesign (Direction A, desktop + mobile)

## Overview
A refresh of lauks24.lv, a Latvian marketplace for agriculture: company/farm profiles on a map, plus buy and sell listings. The goals are to make it clearer what the site is for, make it more user-friendly, and modernise it lightly. The existing header blue `#3b5166` and the existing logo stay the same.

Pages covered: **Home, Map/Listings, Company profile, Listing detail, Sign up / Log in**, for desktop (responsive) and mobile.

## About the design files
The `.dc.html` files in this bundle are **design references built in HTML**. They are interactive prototypes that show the intended look and behaviour; they are **not production code to copy**. Recreate them in the existing lauks24.lv codebase (Next.js + Supabase + Leaflet, judging by the live site) using its established components, routing, i18n (LV/EN) and data layer. All data in the prototypes is mock data.

To view them: open any `.dc.html` file in a browser, keeping `support.js` in the same folder.

## Fidelity
**High-fidelity.** Colours, typography, spacing, radii and interactions are final. Match them closely. Image areas are striped placeholders labelled with what should go there (e.g. "foto: traktors"). Use the real uploaded images.

## Design tokens
**Colours**
- Header / brand blue: `#3b5166` (unchanged). Darker blue (hover, footer): `#2f4254`
- Primary action green: `#3f6e4a`; hover/active `#355d3e`; dark green text `#2f5538`
- Green tint (chips, badges, "Pārdod"): bg `#eef3ee` / `#e6efe6`, text `#2f5538`
- "Pērk" (buying) badge: bg `#f5ecd9`, text `#7a5516`
- Page bg `#f6f7f5`; surface `#ffffff`; subtle surface `#f0f2f0`
- Ink `#1d2329`; muted text `#5d6670`; placeholder `#8a929a`
- Borders: `#e3e6e8` (cards), `#d9dee2` (inputs), `#eef0f1` (row dividers)
- Avatar fallback: bg `#e4eaf0`, text `#3b5166`
- Text on blue: `#ffffff`, secondary `#d6dee6`
- Map marker: fill `#3f6e4a`, selected `#3b5166`, 3px white stroke, radius 8 (selected 11–12)

**Typography.** Lexend (Google Fonts), weights 400/500/600/700. JetBrains Mono is used only for placeholder labels.
- Desktop H1 hero: clamp(34px, 4.4vw, 52px) / 1.08 / 600 / -0.02em
- Section H2: 28–32px / 600 / -0.01em. Card title: 15–20px / 500–600
- Body: 15–18px / 1.55. Meta text: 12–14px muted
- Mobile H1: 30px (home), 22–26px (detail pages)
- Use `text-wrap: balance` on headlines and `pretty` on paragraphs

**Radii.** Inputs and buttons 10–12px. Cards 14–16px. Large panels 18–24px. Chips, badges and pills 999px. Phone tab icons 4–6px.
**Shadows.** Card hover `0 10px 24px rgba(29,35,41,.08)`. Floating card `0 6px 20px rgba(29,35,41,.12)`. Mobile floating button `0 8px 20px rgba(29,35,41,.25)`.
**Spacing.** 4px base; common values 8/10/12/14/16/20/24/28/48/56/72. Desktop content max-width 1280px (map page 1600px), side padding 24px. Mobile side padding 16px.

## Global: header and footer
- **Header** (sticky, bg `#3b5166`): logo (height 30) · nav "Karte", "Sludinājumi", "Kā tas darbojas" (15px/500 white, hover bg rgba(255,255,255,.1), radius 8) · LV/EN switch (active one underlined) · logged out: "Ieiet" (ghost) + "Izveidot profilu" (white bg, blue text, 600) · logged in: "Ziņas" + avatar pill "Mans profils".
- **Footer** (bg `#2f4254`): logo, short description, link columns "Platforma" (Karte, Sludinājumi, Izveidot profilu) and "Informācija" (Privātuma politika, Lietošanas noteikumi), © line. The footer is hidden on the full-height map page.

## Screens (desktop / responsive): `Lauks24 A.dc.html`
Use the `startPage` prop to open each screen directly.

### 1. Home
- **Hero** (white, bottom border): a two-column grid (auto-fit, min 440px) that stacks on narrow screens.
  - Left: eyebrow pill "Lauksaimniecības tirgus Latvijā", H1 "Atrodi lauksaimniekus, pērc un pārdod — vienuviet", lead paragraph.
  - Below the lead, a **search card**: tabs Uzņēmumi / Pārdod / Pērk; the active tab has a green-tint bg. The placeholder changes per tab. Input on `#f6f7f5` plus a green "Meklēt" button. Enter or the button goes to the Map page with that mode and query applied.
  - Then a "Populāri:" row of category chips.
  - Right: map preview, 460px tall, radius 20, showing all profiles as markers. A white bottom overlay card reads "Uzņēmumi un saimniecības kartē" with an "Atvērt karti →" button in blue.
- **"Kā tas darbojas"**: 3 cards (numbered 1–3 in green-tint squares), each with a title, a description and a link. Their purpose is to explain the site's three uses (profile on map / buy & sell / contact directly).
- **"Pārlūko pēc nozares"**: a grid (auto-fill, min 200px) of category cards. Each has a 120px image and a name with →. Clicking a card opens the Map filtered to that category.
- **"Jaunākie sludinājumi"**: a listing card grid (min 250px). Each card has a 170px image with a Pārdod/Pērk badge, then category, title, price + unit, and a footer row with location and date.
- **CTA band** (blue, radius 24): "Ļauj pircējiem un partneriem tevi atrast" with the buttons "Izveidot profilu" (white) and "Skatīt karti" (outline).

### 2. Map / Listings
- **Filter bar** (white): a segmented control Uzņēmumi / Pārdod / Pērk (`#f0f2f0` track, white active segment), a search input (max 520px), and, in listing modes, "+ Pievienot sludinājumu" (green). Below it, wrapping category chips: active = green bg with white text, inactive = white with a border.
- **Body**: a results list on the left (360–440px wide, scrolls, bg `#f6f7f5`) and the map on the right (flex 3). Height is `calc(100vh - 190px)`, minimum 520.
  - The result count label reads e.g. "6 uzņēmumi" / "1 sludinājums".
  - Profile row: 48px avatar, name, ✓ verified badge, specialisation chip, location.
  - Listing row: 92px thumbnail, category, title, price, "location · date".
  - Hovering a row highlights it (green border, `#f3f7f3` bg) and enlarges and recolours its marker. Clicking a marker selects the matching row.
  - The map fits its bounds to the current results.
  - Empty state: "Nekas netika atrasts" with a "Notīrīt filtrus" button.

### 3. Company profile
- Breadcrumb: Karte / category / name.
- **Header card**: 160px cover image, 104px avatar overlapping the cover, name in H1 30px, "Pārbaudīts" badge, then specialisation · location · "Uz lauks24.lv kopš …". Actions: "Parādīt tālruni" (reveals the number on click) and "Rakstīt ziņu" (green).
- **Main column**: tabs "Sludinājumi" (grid of this profile's listings) and "Par saimniecību" (about text + tags).
- **Side column** (max 400): a "Kontakti" card (address, phone masked until revealed, email) and a 240px mini-map.

### 4. Listing detail
- Breadcrumb.
- **Left column**: main image (4:3, max-height 540) and 4 thumbnails; the selected one has a green border. Then a card with "Apraksts" (description) and "Detaļas", a two-column key/value list: Kategorija, Stāvoklis, Daudzums, Atrašanās vieta, Publicēts, Sludinājuma nr.
- **Right column** (sticky, top 88): type badge + category, H1 26px, price 30px/700 + unit, location · date. Primary button "Rakstīt pārdevējam" (or "Piedāvāt pircējam" for buy ads); secondary button "Parādīt tālruni".
  - Seller card below (avatar, name, ✓, specialisation, "Profils →").
  - Safety tip box (`#f0f2f0`).
- **"Līdzīgi sludinājumi"**: 3 compact cards, same category first.

### 5. Sign up / Log in
- A two-panel card (radius 24).
  - **Left**: Ieiet / Reģistrēties segmented control, title and subtitle that change per mode, then the fields:
    - E-pasts
    - Parole (helper text "Vismaz 8 rakstzīmes"; in login mode, an "Aizmirsi paroli?" link)
    - Apstiprini paroli (signup only)
  - Below the fields: a green CTA, the terms text (signup only) and a switch link.
  - **Right** (blue): logo, "Ar profilu tu vari", and 3 numbered benefits.

## Screens (mobile): `Lauks24 Mobile.dc.html` / `Lauks24 Mobile Overview.dc.html`
The phone is 390×844. The overview shows all six states side by side.
- **Top bar** (`#3b5166`, 56px): logo, compact LV/EN, "Ieiet" button (logged out). Detail pages (profile, listing, auth) add a ← back button that returns to the previous page.
- **Bottom tab bar** (on Home and Map only): Sākums · Karte · Sludinājumi · Ieiet/Profils. Active = green label at weight 600 with a tinted icon. The icons are simple shape placeholders; swap in a real icon set (e.g. Lucide). Hit targets are at least 44px.
- **Home**: hero with stacked search card (3 tabs, input, full-width "Meklēt"), horizontally scrolling category cards (132px wide), map preview card (200px), horizontally scrolling latest listings (220px wide), "Kā tas darbojas" as one list card, blue CTA, footer links.
- **Map**: sticky filter block (segmented control, input, horizontally scrolling chips), then **either** a list **or** a full-height map. A floating dark pill "Rādīt kartē / Rādīt sarakstu" toggles between them. In map view, tapping a marker shows a bottom preview card that opens the item. In listing modes a round green "+" FAB opens add-listing (or signup if logged out).
- **Profile**: cover (120px), 84px avatar, name + verified badge, tabs "Sludinājumi" / "Par saimniecību" (about, contacts, mini-map).
- **Listing**: 4:3 image. Tapping the left/right half moves to the previous/next photo; pagination dots (active dot widens to 22px). Below: title/price block, seller card, description, details list, tip, similar listings.
- **Profile and listing pages** replace the tab bar with a fixed **action bar**: "Zvanīt" (reveals the number; use `tel:` in production) plus the green "Rakstīt ziņu" / "Rakstīt pārdevējam".
- **Auth**: single column, same fields as desktop, with benefits shown in a blue card under the form.
- Inputs use 16px text so iOS doesn't zoom in on focus.

## Interactions and state
- State: `mode` (profiles | sell | buy), `category` (all | id), `query`, `selectedId` (list ↔ marker sync), `profileTab`, `imageIndex`, `phoneRevealed`, `authMode`, and on mobile `view` (list | map).
- Put mode, category and query in the URL (e.g. `/lv/map?mode=sell&category=…&q=…`); the live site already uses `mode` and `category` params.
- Filtering is client-side in the prototype. In production, query Supabase and debounce the search (~250ms).
- Phone numbers are masked until the user clicks, to deter scraping.
- Hover: cards lift `translateY(-2px)` and get a shadow (150ms). Buttons darken.
- Category chips on desktop wrap; on mobile they scroll horizontally with the scrollbar hidden.
- Map: Leaflet + OpenStreetMap tiles; markers are `circleMarker` as specified above.

## Subcategories (not shown in prototypes — must be implemented)
The live site has a category dropdown with **subcategories**; the prototypes only show top-level categories. Keep the existing category/subcategory data and filtering logic, and present it like this:
- **Desktop map page:** selecting a top-level chip reveals a second row of smaller chips with its subcategories (first chip "Visas" = whole category). Same chip style, 13px text, 6px 12px padding, bg `#f0f2f0` inactive / `#eef3ee` + `#2f5538` text active. Results + map filter by subcategory. Add `subcategory` to the URL params.
- **Mobile:** tapping a category chip opens a bottom sheet listing its subcategories (44px+ rows, radio-style). The active filter shows as one chip, e.g. "Lopkopība · Gaļas liellopi ✕".
- **Home category cards:** under each name, show up to 3 subcategory links (13px muted) that deep-link to the filtered map.
- **Profile/listing cards:** the green spec chip shows the subcategory name (as with "Gaļas liellopi").
- Use the real subcategory names from the database — don't invent them.

## Badges (existing feature — keep it)
The live site has badges that companies and listings can add (e.g. **Bioloģiskā lauksaimniecība**, **Šķirnes saimniecība**, **Tehnika ar garantiju**, and others). The prototypes don't show them, but they **must stay**: keep the existing badge data, admin/assignment logic, and icons — only restyle and place them as below. Use the real badge list from the codebase/database; don't invent or rename any.
- **Style:** pill, radius 999px, padding 3px 9px, 12px/500 Lexend, icon 14px + 4px gap. Neutral: bg `#f0f2f0`, text `#1d2329`. Use the green tint (bg `#eef3ee`, text `#2f5538`) for certification-type badges (e.g. bioloģiskā). Keep the separate "✓ Pārbaudīts" verified badge as is.
- **Map list rows (desktop + mobile):** under the location line, show up to 2 badges as icon-only 24px circles with a tooltip / `aria-label` with the name; "+N" if more. (The current site already shows small icon badges here.)
- **Profile header:** full badges (icon + text) in a wrapping row under name/specialisation, next to "Pārbaudīts".
- **Listing cards:** max 1 badge on the image (top-right, opposite the Pārdod/Pērk tag), white bg with 90% opacity.
- **Listing detail:** full badges under the price in the sticky right card (mobile: under the title/price block).
- **Filtering (nice to have):** on the map page, a "Papildus" chip opens a list of badge checkboxes to filter by badge.

## Existing filter system — keep it
The live site already has a working filter system (modes, categories/subcategories, badges and any other filters). **Do not replace or rebuild its logic.** Keep the existing filter fields, URL params, queries and data exactly as they are — this redesign only changes how the filters *look* and where they sit:
- Before changing anything, list every filter that exists today and map each one to the new UI. No existing filter may be dropped.
- Main filters (mode, category, search) → the filter bar / chips shown in the prototypes.
- Any extra filters the prototypes don't show → a "Filtri" button at the end of the chip row (desktop: dropdown panel; mobile: bottom sheet) with the same controls, styled with the design tokens. Show the number of active filters on the button ("Filtri · 2") and a "Notīrīt filtrus" action.
- Active filters must stay in the URL so links and back/forward keep working as they do now.

## Favicon (new — replace the current one)
New favicon in `favicon/` (option 1b from `Favicon.dc.html`): square `#3b5166` tile, the logo's slanted frame + "L", sized for legibility at 16px.
- Files: `favicon.ico` (16/32/48), `icon.svg`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180, square — iOS rounds it), `site.webmanifest`.
- Next.js App Router: put `favicon.ico`, `icon.svg` and `apple-touch-icon.png` (rename to `apple-icon.png`) in `app/` and remove the old ones; Next generates the tags. Put the other PNGs + `site.webmanifest` in `public/`.
- Otherwise add to `<head>`:
  `<link rel="icon" href="/favicon.ico" sizes="any">`, `<link rel="icon" href="/icon.svg" type="image/svg+xml">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, `<link rel="manifest" href="/site.webmanifest">`, `<meta name="theme-color" content="#3b5166">`.

## Copy
All UI copy is Latvian and lives in the prototype files. The key new strings are the hero H1, the lead paragraph, the "Kā tas darbojas" cards, the CTA band text, and the empty states. Add EN equivalents to the existing i18n files.

## Assets
- The logo is the existing file, `https://jvywesvogdsenqdwteww.supabase.co/storage/v1/object/public/site-assets/logo/logo.png`.
- Fonts: Lexend (Google Fonts).
- All photos are placeholders; use user-uploaded images (avatars, covers, listing photos) and category photos.

## Files
- `Lauks24 A.dc.html`: desktop/responsive prototype, all 5 pages. Props: `startPage`, `loggedIn`.
- `Lauks24 Mobile.dc.html`: one interactive phone. Props: `startPage`, `startView`, `startMode`, `loggedIn`.
- `Lauks24 Mobile Overview.dc.html`: all 6 mobile states side by side.
- `support.js`: runtime needed to open the `.dc.html` files in a browser. It is not part of the implementation.
