# Handoff: izsole.lauks24.lv — the auction site

## Overview
This is the auction subdomain of lauks24.lv. The working functionality already exists: auctions, lots, registering for an auction, max-bid (proxy) bidding with a bid step, the participant count and a countdown. **This handoff changes the look and layout only. Keep all existing logic and data.** Map each prototype element to the existing feature it represents. Where the prototype shows something that doesn't exist yet (watchlist, bid history, flags), add it as described below.

## Files
- `Izsole.dc.html`: the interactive prototype. Props: `startView` (home | auction | my), `startLot` (e.g. `a1-4`), `registered`, `compact` (mobile layout).
- `Izsole Overview.dc.html`: every state side by side, 4 desktop and 4 mobile.
- Open both in a browser with `support.js` in the same folder. All data is mock data; all photos are placeholders.

## Fidelity
**High-fidelity.** Use the same design tokens as the main site (see README "Design tokens"): Lexend font, header `#3b5166`, primary green `#3f6e4a`, page bg `#f6f7f5`, ink `#1d2329`, muted `#5d6670`, borders `#e3e6e8` / `#d9dee2`, cards radius 14–20px. All styles are inline in the prototype, so copy exact values from there.

**LIVE accent (live auctions only):** red `#d92d20`.
- LIVE badge: white bg, red text, 1.5px red border, `box-shadow:0 0 0 3px rgba(217,45,32,.14)`, a pulsing red dot (7px, keyframe `lkPulse`, 1.6s).
- Live auction card and auction hero: `border:2px solid #d92d20; box-shadow:0 0 0 4px rgba(217,45,32,.12)`.
- Upcoming badge "Gaidāma": bg `#f0f2f0`, text `#4a535b`. Ended "Noslēgusies": bg `#eceeeb`, text `#5d6670`.

## Global
- **Desktop header** (`#3b5166`, sticky): logo + "Izsoles" pill · nav Izsoles / Manas izsoles / Kā tas darbojas · "lauks24.lv ↗" · LV/EN · account pill. This replaces the old left sidebar. "Pieteikties izsolei" becomes a per-auction button, and "Izsoles noteikumi" moves to the footer and the registration modal.
- **Mobile header:** logo + "Izsoles" pill, LV/EN, avatar; below them, a horizontally scrolling row of nav pills. **No bottom tab bar.**
- **Footer** (desktop): © · Izsoles noteikumi · Privātuma politika · lauks24.lv ↗.

## Screens
### 1. Auction list (Izsoles)
- H1 "Izsoles" with a segmented filter beside it: Visas / Notiek / Gaidāmās / Noslēgušās, each with a count.
- Card grid: `repeat(auto-fill,minmax(360px,1fr))` on desktop, 1 column on mobile. Each card:
  - **Image** (16:9) with the status badge top-left and a **country chip** top-right (white, flag + ISO code).
  - **Date tiles** (start and end) overlapping the bottom-right of the image: 52px wide, green month bar, big day number.
  - **Seller avatar** (56px) overlapping the bottom-left.
  - **Progress bar** (4px, green), showing the share of the auction time that has passed.
  - **Body:**
    - title 19px/600
    - flag · country · region · seller
    - "N lotes · N dalībnieki"
    - footer: a countdown label ("Noslēdzas pēc" when live, "Sākas pēc" when upcoming, "Noslēdzās" + date when ended) with d. / st. / min. segments; on the right either "✓ Tu esi pieteicies" or a CTA ("Skatīt lotes", filled green when live).
- "Kā tas darbojas": 3 step cards (Piesakies izsolei → Iestati maksimālo summu → Seko līdzi noslēgumam).

### 2. Auction page
- "← Visas izsoles" link.
- **Hero card:** two columns on desktop (text left, image right); on mobile the image sits on top. It contains:
  - the status badge + date range
  - H1
  - the seller row: avatar, name, then flag · country · region · "Profils lauks24.lv ↗"
  - a grey countdown box with the "Pieteikties izsolei" button, or "✓ Tu esi pieteicies"
- **Stat tiles:** Lotes · Soļa lielums · Sākums · Noslēgšanās (4 columns, 2×2 on mobile).
- **Tabs:** Lotes / Informācija.
- **Lotes tab:**
  - Filter chips: Visas lotes / ☆ Vērotās / Mani solījumi, each with a count. Sort select: lot number / price ascending / price descending.
  - Lot grid: `repeat(auto-fill,minmax(230px,1fr))` on desktop, 2 columns on mobile. Each lot card:
    - a square photo with a time-left pill top-left and a ☆ watch button top-right
    - a status pill bottom-left: "Tu esi vadībā" (green) or "Pārsolīts" (amber `#f5ecd9` / `#7a5516`)
    - a dark "LOTS N" pill, the title, the animal name in italics, the price at 20px/700, and the number of bidders
  - Card border: 2px green if you're leading, 2px `#e2c48a` if you've been outbid.
- **Informācija tab:** description + key/value rows (dates, closing order, bid step, location) and a contacts card with phone buttons + a link to the rules.

### 3. Lot (detail)
- Desktop: a **right-side drawer**, 560px, over a dim backdrop, so the lot list stays visible. Mobile: full screen with a ← back button.
- Sticky top bar: close button, "Lots N no M", prev/next lot buttons.
- **Gallery** (4:3): left/right arrows and dots.
- Title block: LOTS pill, your status pill, a "☆ Vērot" toggle, the title, the name in italics.
- Two tiles side by side:
  - **Time:** "Noslēdzas pēc" + countdown, with the note "Visas lotes noslēdzas vienlaicīgi".
  - **Price:** "Pašreizējā cena" / "Sākuma cena" / "Gala cena", with the number of bidders.
- **Bid panel** (desktop inline): two ways to bid.
  1. **One-click bid:** a full-width green button "Solīt 3 550 €" that bids exactly one step above the current price. Hint below it: "Viens solis (+50 €) virs pašreizējās cenas". When you're leading, the button turns into a light green "✓ Tu esi vadībā" (disabled), with the hint showing your max amount.
  2. **Max bid:** a "vai" divider, then "Iestatīt maksimālo summu" (or "Paaugstināt maksimālo summu" when leading), an input, and an outline "Iestatīt" button. The system bids automatically, one step at a time, up to that amount. Show an inline error if the amount is below the minimum or not a multiple of the step.
  - Both open a **confirm modal** before submitting: "Apstiprini solījumu" or "Apstiprini maksimālo summu".
- **Mobile bidding:** a sticky bottom bar with the price, an outline "Maks. summa" button (opens a bottom sheet with the max input) and a green "Solīt 3 550 €" one-click button.
- **Not registered:** green box "Lai solītu, piesakies izsolei" + button. Upcoming + registered: grey notice "Solīšana sāksies …". Ended: a won/closed notice.
- Below that: a details table (breed, born, weight, sire, pedigree, location with country), the description, and the **bid history** (your rows in green, other bidders anonymised as "Dalībnieks N").
- **Toasts** after a bid: "Tu esi vadībā!" (dark) or "Tevi pārsolīja…" (amber `#7a5516`).

### 4. Manas izsoles
- **Mani solījumi:** rows with the LOTS pill, a status pill, the title, the auction name, the current price, your max amount, time left, and "Solīt vēlreiz" when you've been outbid.
- **Vērotās lotes:** a compact grid.
- **Izsoles, kurām esmu pieteicies:** a list with status pills (LIVE in red).
- An empty state for each section.

### Registration modal
Name/company and phone (prefilled from the account), a checkbox to agree to the rules (with a link), and "Pieteikties", which stays disabled until the box is checked. **Use the existing registration and approval flow.** If registrations need admin approval, show "Gaida apstiprinājumu" (awaiting approval) instead of the instant toast.

## Behaviour
- **All lots in an auction close at the same time.** Countdowns tick every second; under 1 hour, show `h m s`, under 1 minute `mm:ss`.
- Proxy bidding as it works today: the price rises by one step above the second-highest max. The minimum next bid is the current price + step, or your own max + step if you're already leading.
- Watchlist (☆) is per user and needs a new table if it doesn't exist.
- Bid history shows other bidders anonymously.
- Real-time updates: subscribe to bid changes (e.g. Supabase Realtime) so the price, bidder count and leading/outbid status update without a reload.

## Country flags (automatic)
- Add a `country` field (ISO 3166-1 alpha-2, e.g. LV, LT, EE) to **seller profiles**: a dropdown in profile settings, defaulting from the address. An auction uses its seller's country; it is not chosen per auction.
- Render flags with the **`flag-icons`** package. The CSS stripes in the prototype are only a stand-in.
  - Card chip: flag 20×14, radius 3, plus the code.
  - Next to the location line: 20×14.
  - Auction hero: 18×12.
- Show the country name in the UI language (Latvija / Lietuva / Igaunija in LV).
- Nice to have: a country filter on the auction list.

## Checklist
- [x] Header/nav replaced (sidebar removed), mobile header with nav pills, no bottom bar
- [x] Auction list: filter, cards with dates, progress, countdown, country chip, LIVE style
- [x] Auction page: hero, stats, tabs, lot filters/sort, lot grid with status borders
- [x] Lot drawer (desktop) / full screen (mobile), gallery, tiles, bid form + confirm, mobile bid sheet
- [x] Registration modal wired to the existing flow
- [ ] Manas izsoles: bids, watchlist, registrations
- [ ] Country field + flags
- [ ] Real-time price updates
- [ ] Screenshot comparison at 1440px and 390px against `Izsole.dc.html` (see VERIFY.md)
