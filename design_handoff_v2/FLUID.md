# FLUID — the final design direction (overrides older files)

**This is the version to build.** The `*Fluid*` files replace the earlier designs:

| Area | Build from | Older files (reference only) |
|---|---|---|
| Public site: home, map, listing, profile, login | `Lauks24 Fluid.dc.html` (one responsive file, desktop + mobile) | `Lauks24 A`, `Lauks24 Mobile` |
| Dashboard (Mans profils) | `Lauks24 Dashboard Fluid.dc.html` | `Lauks24 Dashboard` |
| Auctions (izsole.lauks24.lv) | `Izsole Fluid.dc.html` | `Izsole` |

Overviews: `Lauks24 Fluid Overview.dc.html`, `Fluid Overview — Dashboard un Izsoles.dc.html`. Open them in a browser with `support.js` next to them. Every frame is interactive.

The README (design tokens, category icons, badges, filters, existing logic) and IZSOLE.md (auction behaviour) **still apply**. This file covers only the visual and motion layer on top of them. **Keep all existing data, logic, routes, categories/subcategories, badges and the filter system.**

---

## 1. Visual system
- **Header:**
  - The same blue, slightly translucent: `rgba(59,81,102,.95)` + `backdrop-filter: blur(20px) saturate(180%)`, sticky, 56px tall.
  - Nav items are pills (radius 999).
  - On mobile, a ☰ button opens a frosted dropdown menu that scales out of the button. **No bottom tab bars anywhere.**
- **Cards:**
  - No borders. White, radius 18–24, `box-shadow: 0 1px 2px rgba(20,26,32,.05)`.
  - On hover, add `0 12px 28px rgba(20,26,32,.08)`.
- **Page background:** `#f5f6f4`.
- **Typography (Lexend):**
  - Big headings get tight negative tracking: h1 `clamp(38px,6.2vw,76px)`, `letter-spacing:-.035em`, line-height 1.03. h2 `clamp(28px,3.2vw,40px)` at `-.025em`.
  - Body text keeps `letter-spacing:0` and line-height 1.5–1.6.
- **Segmented controls** (Uzņēmumi/Pārdod/Pērk, tabs, filters, Pārdodu/Pērku, Pieejamība, Ieiet/Reģistrēties):
  - Track: grey `#e9ebe8`, radius 999.
  - A white thumb **slides** between options: `transition: transform .5s cubic-bezier(.32,.72,0,1)`.
  - They react on **pointer-down**, not on click.
- **Inputs:**
  - Filled `#f5f6f4`, radius 12, no border.
  - On focus: white background, `border-color:#3f6e4a` and `box-shadow:0 0 0 4px rgba(63,110,74,.12)`.
  - Errors are shown **inline** under the field as you type, not after submitting.
- **Press feedback:** every tappable element scales slightly on press (`:active { transform: scale(.97) }`, 120ms).
- **Glass surfaces:** used for things that float over content: map panels, sticky action bars, the back bar, toasts. Style: `rgba(255,255,255,.72–.9)` + `backdrop-filter: blur(20–24px) saturate(180%)`.
- **Switches:** iOS-style, 51×31, green `#3f6e4a` when on.

## 2. Motion: springs, not fixed-duration animations
Implement this with a spring library (e.g. **Motion / Framer Motion**, `type:'spring'`). The prototype has a small spring helper (`spring()` in each file); copy its parameters:

- **Default:** `bounce: 0` (critically damped), response about 0.3–0.4s.
- **Bounce:** a little bounce (Motion `bounce ≈ 0.15–0.2`) **only after a flick**, i.e. when the drag was released fast.
- **Interruptions:** every animation can be interrupted. Always animate from the current on-screen value and carry the velocity through.
- **Release velocity:** when the user lets go of a drag, pass the pointer's speed to the spring.
- **Snapping:** pick the snap point from the **projected** position, `current + (v/1000)·0.998/(1-0.998)`, not from the release position.
- **Edges:** past an edge, resist progressively (rubber-band): `(x·d·0.55)/(d+0.55·|x|)`.
- **Reduced motion:** respect `prefers-reduced-motion`. Use a short fade instead of slides and springs.

## 3. Interactions to build (public site)
- **Home → quick look:**
  - Tapping a "Jaunākie sludinājumi" card opens a preview without leaving the page.
  - **Desktop:** the panel grows out of the card and shrinks back into it when closed.
  - **Mobile:** a bottom sheet you can drag down or flick away.
  - "Atvērt sludinājumu" opens the full listing.
- **Map:**
  - **Desktop:** a frosted results panel floats on the left over the full-bleed map. It contains search, the segmented control, category chips and the list.
  - **Mobile:** the same content sits in a **draggable bottom sheet with 3 stops** (peek / half / full). Drag the handle, with a ~8px dead zone first, or tap it to step up a stop. The search field expands the sheet to full.
  - **Subcategory dropdown:**
    - Tapping a category chip opens a frosted dropdown anchored under that chip. It scales out of the chip and its chevron rotates.
    - It has multi-select checkboxes with a result count for each subcategory, "Visas apakškategorijas", "Notīrīt", and a "Rādīt N rezultātus" button.
    - After closing, the chip shows how many are selected, e.g. "Lopkopība · 2".
    - On mobile, the sheet first expands to full, so the dropdown always fits on screen.
    - **Use the real category and subcategory tree from the database.**
  - **Pin card:**
    - Tapping a map pin opens a small card anchored above the pin, with a pointer, scaling out of it. There are **no text tooltips**.
    - **Listing card:** photo, Pārdod/Pērk and Rezervācijai labels, title, price, location. **Business card:** logo, name with ✓, specialisation, location.
    - The card follows the map while panning and zooming. Tapping it opens the listing or profile. ✕, a tap on empty map, or Esc closes it.
    - **Desktop:** the map pans so the pin isn't hidden under the panel. **Mobile:** the sheet drops to peek and the map pans the pin into view.
- **Back navigation:**
  - Listing and profile pages have a sticky glass bar under the header with a pill like "‹ Sludinājumi", "‹ Karte" or "‹ Sākums", showing where the user came from.
  - Going back restores **everything**: mode, category, subcategories, search, list scroll, page scroll and the map center and zoom.
  - **Wire this into real routing**, with URL query params for the filters and the map view, so the browser's Back button behaves the same way.
- **Listing page:**
  - **Photos:** a swipeable scroll-snap gallery, with dots in a glass pill, arrows and thumbnails on desktop.
  - **Desktop:** the info panel on the right is sticky.
  - **Mobile:** a sticky glass bottom bar with the price, "Tālrunis" and "Sazinies".
  - **Similar listings:** a horizontal scroll-snap shelf.
- **Listing labels:**
  - "Rezervācijai" is a dark-blue pill (`#3b5166`, white text). It appears on every listing card (home shelf, quick look, map list, pin card, profile grid, listing page) whenever the listing's availability is "Rezervācijai".
  - Pārdod/Pērk keep their green and amber colours.

## 4. Dashboard
- **Navigation:** a sidebar menu on desktop. On mobile it becomes a sticky glass row of pills plus a floating "+ Sludinājums" button. **No bottom tab bar.**
- **Mani sludinājumi:**
  - A sliding filter switch with counts (Visi / Aktīvie / Paslēptie).
  - Rows sit in one grouped card, with Rediģēt / Paslēpt / Dzēst buttons on desktop.
  - **Mobile:** swipe a row left to reveal "Paslēpt" (grey) and "Dzēst" (red), like iPhone Mail. Use a 10px threshold that locks to horizontal movement, rubber-banding and a momentum snap. Only one row is open at a time; tapping elsewhere closes it.
- **Deleting:**
  - **Delete a listing:** delete immediately, then show a toast with **"Atsaukt"** (undo) for 5s. There's no confirmation dialog.
  - **Delete profile:** this keeps a confirmation, as an action sheet: a bottom sheet on mobile and a small alert on desktop. The red action is on top and "Atcelt" (cancel) sits separately below.
- **Create / edit a listing:** the form has these sections:
  - **Pārdodu / Pērku** sliding switch.
  - **Pamatinformācija:** title (inline "Ievadi virsrakstu" error), category, subcategory, description.
  - **Cena:** a "Cena pēc vienošanās" switch that dims the price fields when on, plus price, unit and quantity.
  - **Pieejamība** (only for "Pārdodu"): a sliding switch with **Pieejams uzreiz** (default) / **Rezervācijai**, and a hint line that changes with the choice. Save it on the listing as `availability: 'now' | 'reservation'`.
  - **Foto un zīmes:** photos, then badge chips (the existing badge list).
  - **Bottom bar:** a sticky glass bar with Atcelt / Publicēt.
- **Profile edit and Konts:** the same grouped-card style as iOS Settings. "Iziet" and "Dzēst profilu" are separate rows, the delete one in red.

## 5. Auctions (on top of IZSOLE.md)
- **Look:**
  - The same glass header, borderless cards and sliding Lotes / Informācija switch.
  - The red LIVE style stays as specified, and so do the country flags.
- **Lot panel:**
  - It springs in from the right with a dimmed background behind it.
  - **On touch devices,** drag the panel right to close it, with direction locking and momentum projection.
- **Mobile bid sheet:** it springs up from the bottom. Drag the handle down or flick it to close.
- **Confirm and register dialogs:** they scale in on desktop and rise from the bottom on mobile. Their two buttons sit side by side at full width.

## 6. Checklist
- [x] Shared tokens and components: glass header, segmented control with a sliding thumb, filled inputs, switch, press feedback, glass toast
- [x] Spring utilities (Motion) + reduced-motion fallback
- [x] Home + quick look
- [x] Map: glass panel (desktop), 3-stop sheet (mobile), subcategory dropdown, pin cards
- [x] Back bar + routing that restores state (URL params)
- [x] Listing page: swipe gallery, sticky panel / mobile action bar
- [x] Profile page, login/register with inline validation
- [ ] "Rezervācijai" label everywhere + `availability` field in the create/edit form
- [x] Dashboard: nav, swipe rows, delete with undo, action sheet, form sections
- [ ] Auctions: lot panel drag-to-close, bid sheet, dialogs
- [ ] Screenshot comparison at 1440px and 390px against the Fluid files (VERIFY.md)
