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
- [ ] Header card: cover, avatar, name, Pārbaudīts, badges, actions
- [ ] Tabs: Sludinājumi / Par saimniecību
- [ ] Contacts card (phone hidden until click) + mini map
- [ ] Mobile: fixed bottom action bar (Zvanīt / Rakstīt ziņu)

## 5. Listing detail
- [ ] Gallery + thumbnails (mobile: tap/swipe + dots)
- [ ] Sticky price card with primary + phone buttons, badges
- [ ] Seller card, safety tip, description, details list
- [ ] Similar listings
- [ ] Mobile: fixed bottom action bar

## 6. Sign up / Log in
- [ ] Two-panel card (desktop), single column (mobile), Ieiet/Reģistrēties toggle
- [ ] Existing auth logic unchanged

## 7. User dashboard
- [ ] Sidebar (desktop) / pill nav + tab bar (mobile)
- [ ] Pārskats: profile card, stats, verification card, listings preview, empty state
- [ ] Mani sludinājumi: filter, rows, Rediģēt / Paslēpt / Dzēst with confirm
- [ ] Add/edit listing form with real categories, subcategories, badges
- [ ] Uzņēmuma profils edit form + map location
- [ ] Konts: password, verification status, delete profile
- [ ] Existing dashboard logic unchanged

## 8. Final pass
- [ ] Every page checked at 1440px, 1024px, 768px and 390px widths
- [ ] No old styles/components left on any page (search the codebase for old colour values and old class names)
- [ ] LV and EN both work
- [ ] Logged-in and logged-out states both checked
