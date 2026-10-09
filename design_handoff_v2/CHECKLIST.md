# Implementation checklist — lauks24.lv redesign

Work through this list **in order**. After each item: open the page in the browser, compare it side by side with the matching `.dc.html` prototype (desktop AND mobile width), fix differences, then tick the box. Do not move on while an item still differs. Details for every item are in `README.md`.

## 0. Foundations (do first — everything else depends on it)
- [x] Lexend font loaded site-wide (400/500/600/700) and set as the body font
- [x] Design tokens (colours, radii, shadows from README "Design tokens") added as CSS variables / Tailwind theme — no hard-coded old colours left
- [x] Page background `#f6f7f5`, ink `#1d2329`, muted `#5d6670`
- [x] Shared button styles: primary green `#3f6e4a`, secondary outline, radius 10px
- [x] Shared input styles: border `#d9dee2`, radius 10–12px, 16px text on mobile
- [x] Shared card style: white, border `#e3e6e8`, radius 14–16px
- [x] Shared chip/badge styles
- [x] Favicon replaced (see README "Favicon")

## 1. Header + footer (all pages)
- [x] Desktop header: logo · Karte · Sludinājumi · Kā tas darbojas · LV/EN · Ieiet + "Izveidot profilu" (logged out) / Ziņas + avatar pill (logged in)
- [x] Mobile header: logo · LV/EN · Ieiet; back arrow on detail pages
- [x] Mobile bottom tab bar on Home + Map
- [x] New footer (hidden on map page)

## 2. Home
- [x] Hero: H1, lead text, search card with Uzņēmumi/Pārdod/Pērk tabs → opens map with filters
- [x] "Populāri" category chips
- [x] Map preview card (desktop right column / mobile card)
- [x] "Kā tas darbojas" — 3 steps
- [x] "Pārlūko pēc nozares" category cards (with subcategory links)
- [x] "Jaunākie sludinājumi" cards
- [x] Blue CTA band

## 3. Map / listings
- [x] Filter bar: segmented mode, search, category chips + subcategory row, "Filtri" for any extra existing filters
- [x] ALL existing filters still work and stay in the URL
- [x] Desktop: list left + map right, hover/marker sync
- [x] Mobile: list ⇄ map toggle pill, selected-item card, + FAB
- [x] Profile rows and listing rows restyled, badges shown
- [x] Empty state

## 4. Company profile
- [x] Header card: cover, avatar, name, Pārbaudīts, badges, actions
- [x] Tabs: Sludinājumi / Par saimniecību
- [x] Contacts card (phone hidden until click) + mini map
- [x] Mobile: fixed bottom action bar (Zvanīt / Rakstīt ziņu)

## 5. Listing detail
- [x] Gallery + thumbnails (mobile: tap/swipe + dots)
- [x] Sticky price card with primary + phone buttons, badges
- [x] Seller card, safety tip, description, details list
- [x] Similar listings
- [x] Mobile: fixed bottom action bar

## 6. Sign up / Log in
- [x] Two-panel card (desktop), single column (mobile), Ieiet/Reģistrēties toggle
- [x] Existing auth logic unchanged

## 7. User dashboard
- [x] Sidebar (desktop) / pill nav + tab bar (mobile)
- [x] Pārskats: profile card, stats, verification card, listings preview, empty state
- [x] Mani sludinājumi: filter, rows, Rediģēt / Paslēpt / Dzēst with confirm
- [x] Add/edit listing form with real categories, subcategories, badges
- [x] Uzņēmuma profils edit form + map location
- [x] Konts: password, verification status, delete profile
- [x] Existing dashboard logic unchanged

## 8. Final pass
- [x] Every page checked at 1440px, 1024px, 768px and 390px widths
- [x] No old styles/components left on any page (search the codebase for old colour values and old class names)
- [x] LV and EN both work
- [x] Logged-in and logged-out states both checked
