# Chemistrie Shopify Theme — Project Memory

## Repo / workflow
- Working repo: `/Users/apple/Desktop/chemistrie-main/chemistrie-theme` (git repo, source of truth).
- Mirror copy kept manually in sync: `/Users/apple/Desktop/chemistrie-main/chemistrie-main`.
- GitHub: `https://github.com/kanchantechinfinity/chemistrie-theme`, branch `main`, connected to the live Shopify theme via Shopify's GitHub integration.
- **Important gotcha:** while the merchant has the Shopify theme customizer open, Shopify periodically autosaves its own in-memory section data back to GitHub as commits titled `Update from Shopify for theme chemistrie-theme/main`. Always `git fetch origin main` and check `git log --oneline origin/main` for these before pushing — merge them in, don't just force-push over them.
- User has also manually pasted code directly into the Shopify "Edit code" editor in the past (bypassing git) when unsure the push was reaching the live theme. This can cause drift/breakage — e.g. a manual paste once landed CSS rules nested *inside* another rule's `{ }` block, producing invalid CSS. Always check for accidental duplication/nesting after a manual paste is reported.
- Shopify schema validation gotchas learned the hard way: `url`-type settings can't have non-datasource string defaults (use `text` instead); `text` settings can't have blank `default: ""` (omit the key); `select` option `label` max length is 50 characters; any setting `label` max length is 70 characters — put longer explanatory text in `info` instead (hit this 2026-07-24 on `main-collection.liquid` "collection" and `header.liquid` "mobile_logo").

## Site structure
- Homepage sections (in `templates/index.json` order): hero, vision, pillars, shop, founders, actives ("Active Index" / "Twelve ingredients"), proof, ritual, testimonials, story, instagram, cta, faq.
- Multi-page site built out per an internal "Website Architecture" doc: Collection (`main-collection.liquid`), Product (`main-product.liquid` + `product-details.liquid`), The Ritual (`ritual-shop.liquid`, `ritual-steps.liquid`), The Pharmacists (`pharmacists-profiles.liquid`, etc.), Our Story (`story-opening.liquid`), Journal (blog), Contact (`contact-faq.liquid`, etc.), Cart (`main-cart.liquid`), Search, 404, customer account pages.
- Nav: Home / The Collection / The Ritual / The Pharmacists / The Journal / Contact (`sections/header.liquid`). Journal link resolves dynamically via `blogs.journal.url` else first blog else `/blogs/journal` (actual blog handle turned out to be `news`).
- Cart drawer + wishlist drawer: `snippets/cart-drawer.liquid`, `snippets/wishlist-drawer.liquid`, `assets/shop-ux.js` (vanilla JS, `/cart/add.js` + `/cart/change.js` + `/cart.js`), `assets/shop-ux.css`.
- Animation stack: GSAP 3.12.5 + ScrollTrigger + Lenis smooth-scroll, loaded via CDN in `layout/theme.liquid`, driven by `assets/chemistrie.js`.
- Real product content (Velvet, Aura, Cashmere, Silken) sourced from client docx files, rendered in `product-details.liquid` via a handle/title-matching `pd_key` pattern.

## Build log — 2026-07-27 (2): No two adjacent sections share a background (commit `4357a5a`)
User asked for a site-wide audit: no two consecutive sections on any page
may share the same background color. Method used — for each template's
`order` array, resolved each section's actual background (checking both
its own `{% stylesheet %}` and whether it carries the shared
`page-section--paper` class from `assets/pages.css`), then checked every
adjacent pair. Found and fixed 4 violations (commit `4357a5a`):
- Homepage: Ritual → Testimonials (both `--c-cream-2`) — Testimonials → `--c-paper`.
- Collection AND Pharmacists pages: `page-hero` (dark `--grad-deep`) directly
  followed by `stat-bar` (dark `--c-forest-2`) — two dark bands, no seam.
  Fixed by flipping `.statbar` itself to light (`--c-paper` bg, forest
  text/accents) in `assets/pages.css` — a shared component, so this one
  change fixed both pages at once.
- Pharmacists page: pharmacists-credentials → pharmacists-philosophy (both
  `--c-paper`) — philosophy section dropped the `page-section--paper` class
  (now plain cream) and its inner `.pphilo__card` background flipped from
  cream to paper so the cards still contrast against their new section bg.
- Ritual page: ritual-steps → ritual-shop (both `--c-cream`) — ritual-shop
  → `--c-paper` (its `.pcard` product cards already have their own explicit
  cream background, so card contrast was unaffected).

**Method for next time:** page backgrounds in this theme come from one of
three places — (a) the shared `.page-section--paper` class, (b) a
section's own `{% stylesheet %}` rule matching its root class, or (c) no
rule at all (defaults to body's `--c-cream`). When adding a NEW section to
an existing template, check what backgrounds its immediate neighbors
resolve to via those three routes before picking one, rather than
defaulting to cream/paper reflexively — that's exactly how these 4
violations were introduced originally.

## Build log — 2026-07-24 (15b): Cart button → icon-only, Shopify-style glyph (commit `2c4fafe`)
Follow-up to (15): user wanted the "BAG" text gone entirely, icon + count
only, using Shopify's standard cart icon (not the custom bag path from
(15)). Swapped in the canonical bag-with-arched-handle path (viewBox
`0 0 44 40`, the one used across Shopify reference/Dawn-style themes) and
removed `<span>Bag</span>`. Since the button's width used to be driven by
the text, resized `.nav__bag` to symmetric `padding: 9px 13px` (mobile:
`7px 10px`) and added explicit `.nav__bag svg { width/height }` (18px
desktop, 16px ≤640px) — the new SVG's `viewBox="0 0 44 40"` has no inherent
CSS size otherwise. `aria-label="Cart"` added to the link since the visible
text label is gone.

## Build log — 2026-07-24 (15): Header fixes — site-wide, not product-page (commit `d19d54f`)
First non-product-page change in this stretch. Two bugs in `sections/header.liquid`:
- A stray second "CHEMISTRIE" was rendering in the desktop nav bar before
  "The Collection" etc. — `.nav__links-brand` (a div meant to show the
  wordmark/`mobile_logo` setting at the top of a mobile drawer) had **no
  CSS controlling it at all**, so it just rendered inline in the normal nav
  flow on every viewport. Fixed with `.nav__links-brand { display: none; }`
  in `assets/chemistrie.css` (right after the base `.nav__links` rule).
  Left the markup and the `mobile_logo` schema setting in place in case a
  real mobile-drawer feature using it gets built later — this was a
  "missing CSS" bug, not evidence the feature should be deleted.
- `.nav__bag` (the cart link) had no icon at all, just "BAG" text + count
  pill. Added a standard tote-bag outline SVG before the text.

**Note:** there is currently no evidence of a working mobile hamburger
drawer — `.nav__toggle` button exists in the HTML but `.nav__links` is
just `display:none` on phones with no `.is-open`-style JS/CSS to reveal it
as an overlay. If the user ever reports "the mobile menu doesn't open,"
that's a real, separate, pre-existing gap — not something this session
touched or fixed.

## Build log — 2026-07-24 (14c): Founder photo crop fixed (commit `59093db`)
`.pdet__founder-photo img`'s `object-fit:cover` defaulted to center
`object-position`, cropping into the top of the head in the short/wide
(200-260px tall, 340px wide) founder-note frame. Added `object-position:
center 15%` so the face stays in frame. If `founder-2.jpg`/`founder-3.jpg`
are ever swapped in here, their face position may differ — recheck this
value if a future founder photo looks cropped again.

## Build log — 2026-07-24 (14b): Benefit line max-width removed (commit `f1622c6`)
`.mprod__benefit`'s `max-width: 40ch` was leaving a lot of unused white
space beside the italic subtitle now that the buy box is a full 50%-width
column (post (11c)). Changed to `max-width: none` so it wraps to the
column's full width instead.

## Build log — 2026-07-24 (14): Rating row + live-viewer social proof (commit `6a7c936`)
Per a reference screenshot (another store's PDP with badges/rating/urgency
details), added two small trust/urgency elements to `main-product.liquid`'s
buy box — both purely static/decorative UI, same spirit as the (7)-era
review cards (no real reviews app or live-viewer tracking wired up):
- `.mprod__rating` row between the benefit line and price: `★★★★★ 4.9
  (124 reviews) | 847 sold` + a `Read reviews ↓` link. The link points to
  `#mprod-reviews` — added that id to the Customer Reviews block wrapper in
  `product-details.liquid` (`.pdet__block.pdet__reviews`) as the anchor
  target.
- `.mprod__viewers` row below price: "**28** people are viewing this right
  now" with a small pulsing green dot (`@keyframes mprodPulse`, respects
  `prefers-reduced-motion`).

**If real review-count/sold-count/live-viewer data ever becomes available**
(a reviews app, Shopify analytics, etc.), these are the two elements to
wire up — currently hardcoded numbers (4.9 / 124 / 847 / 28) with no
metafield or app backing.

## Build log — 2026-07-24 (13b): Hid the page scrollbar (commit `f601e0f`)
User flagged a "small grey button" near the tabs on the product page —
identified as the native page scrollbar thumb (macOS overlay-scrollbar
style), not anything in our markup. Hidden globally on `html` via
`scrollbar-width: none` + `html::-webkit-scrollbar { display: none }`
(`assets/chemistrie.css` top of file, next to the existing `html { scroll-
behavior: auto }` rule) — same hide technique already used for
`.shop__rail`/`.insta__slider`'s horizontal carousels. Scrolling itself is
unaffected, only the visible thumb/track. This is a **site-wide** change,
not product-page-scoped, since it's the document scrollbar.

## Build log — 2026-07-24 (13): Buy-box accordion → boxed cards like FAQ (commit `109b358`)
User wanted the buy-box accordion (Routine/Story/Warnings/Feeling/Benefits/
How-to-Use) styled like `.pfaq` (the FAQ accordion at the bottom of
`product-details.liquid`) — individually bordered/rounded cards with a gap
between them, not the flat divider-line list it had. Rewrote
`.mprod__acc-item`/`.mprod__acc-q`/`.mprod__acc-icon`/`.mprod__acc-a-inner`
CSS in `main-product.liquid` to mirror `.pfaq__item`/`.pfaq__q`/
`.pfaq__icon` almost 1:1: each item is `border+border-radius:14px+
background:var(--c-cream)`, `12px` gap between items via
`.mprod__info-accordion{display:flex;flex-direction:column;gap:12px}`,
open item gets `background:var(--c-paper);border-color:var(--c-tan)` via
`:has()` (same technique already used by `.pfaq__item`, so no new browser-
support assumption), and the "+" became a circular badge
(`.mprod__acc-icon{width:32px;height:32px;border-radius:999px;...}`).
Only CSS changed — no HTML/JS touched, since this accordion's markup
already had the right structure, just needed re-skinning.

## Build log — 2026-07-24 (12b): (12) REVERTED — user rejected it outright
Reverted via `git revert cb7264e` (commit `12cee97`) immediately after user
said "totally wrong" with no further detail. Both the bottom-padding fix
and the left-column Shipping/Returns/Need-Help accordion are gone. **Don't
re-guess generic content for a "left info box" again** — the earlier guess
(reusing the old "Authentication/Shipping/Cancellation" reference) was
wrong for this spot; if asked for a similar box again, ask what content
should go in it rather than assuming, since this exact assumption already
failed once. If asked to revisit top/bottom spacing equality specifically,
that part may not have been the objectionable part — worth asking which
half of (12) was the problem before redoing either piece.

## Build log — 2026-07-24 (12): Equal top/bottom spacing + left info accordion (commit `cb7264e`)
- `.page-section.mprod` had `padding-top` overridden (see (7)'s cascade-bug
  fix) but `padding-bottom` was still inherited from the generic
  `.page-section` shorthand (up to 160px) — added an explicit
  `padding-bottom: clamp(20px, 3vw, 40px)` to match.
- Added a new Shipping / Returns & Exchanges / Need Help? accordion in the
  LEFT column, below the gallery thumbnails — content is generic (not
  requested with specifics), chosen to mirror the original "Authentication
  / Shipping / Cancellation & Refunds" reference screenshot from earlier in
  this session (build (8)'s tab-style reference), since that's the closest
  signal for what "premium information box" should contain. Reused the
  exact `.mprod__acc-item`/`.mprod__acc-q`/`.mprod__acc-a`/`.mprod__acc-icon`
  classes already styled for the buy-box accordion (8)/(9) — guarantees
  pixel-identical style per the request, and the existing JS click handler
  (`document.querySelectorAll('.mprod__acc-q')`) is class-based, so it
  automatically wires up these new buttons with zero JS changes.
- **If the user wants different content in this left info box**, it's a
  self-contained 3-item block right after `.mprod__thumbs` in
  `main-product.liquid` — easy to swap wording or add/remove items without
  touching the buy-box accordion.

## Build log — 2026-07-24 (11d): Corrected the sticky-image pattern (commit `f829ea0`) — (10) was wrong
User reported that scrolling past the Add to Bag button scrolled the WHOLE
page, image included — meaning the "independent scroll" from (10) never
actually worked as intended. Root cause: (10) put `position: sticky` +
`max-height: calc(100vh-120px)` + `overflow-y: auto` on `.mprod__buy` (the
TEXT column) and left the image as the plain, non-sticky one. That's the
wrong pattern for this effect — `overflow-y:auto` only produces an internal
scrollbar once content exceeds max-height, and with all 6 accordions
collapsed by default there usually wasn't enough content to trigger it, so
`.mprod__buy`'s sticky range ran out almost immediately and it just scrolled
away with the page like everything else.

**Correct pattern (what myalmari.in actually does, confirmed by inspecting
it in the browser):** only the SHORT column (`.mprod__gallery`, the image)
gets `position: sticky; top: 100px`. The TEXT column (`.mprod__buy`) stays
in plain normal document flow — no sticky, no max-height, no overflow. Since
the buy box is naturally taller than the image (6 accordion items), the
grid row's height is set by the buy box, which gives the sticky image
plenty of room to stay pinned in the viewport while the page's native
scroll carries the (taller) buy-box content past underneath it. No internal
scrollbar anywhere — it's native page scroll the whole time.

**If this regresses again:** check that `.mprod__buy` has NO `position`,
`max-height`, or `overflow` properties at all — those are exactly the wrong
ingredients for this effect, even though they seem intuitive ("make the
text scroll in its own box"). Only `.mprod__gallery` should be sticky.

## Build log — 2026-07-24 (11c): Back to equal 50/50 columns (commit `d8a9c9f`)
The `minmax(280px, 440px) 1fr` column cap from (11) made the image look too
small. Reverted `.mprod__layout` to `grid-template-columns: 1fr 1fr` (equal
halves). The independent-scroll-visibility rationale from (11) is now
moot — image is back to being as tall as the column is wide, so the
buy-box internal scroll (10) may rarely trigger again on tall viewports.
Don't re-shrink the image to chase that effect unless asked again.

## Build log — 2026-07-24 (11b): Product image framed like the reference (commit `8ff44e2`)
User pointed at a myalmari.in screenshot vs ours: their image sits inset in
a bordered white box with visible padding around it; ours was full-bleed
`object-fit: cover` filling the entire square with no border. Changed
`.mprod__main` to `border: 1px solid var(--c-line-soft); background:
var(--c-paper); padding: clamp(14px, 2vw, 26px); box-sizing: border-box`
and switched the image to `object-fit: contain` (was `cover`) so it sits
inset, uncropped, inside the frame — letterboxing against the paper
background if the image's natural aspect isn't perfectly square. Note this
applies to every product's main image site-wide, not just Velvet — worth
a quick look at products with unusual image aspect ratios if this ever gets
revisited, since `contain` can leave more visible letterbox space than
`cover` did.

## Build log — 2026-07-24 (11): Hidden scrollbar, smaller gallery, tabs (commit `3815993`)
Reference site the user liked: myalmari.in product page (sticky product
image, independently-scrolling details panel — same mechanic as (10), just
with a visibly SHORTER image column). Three fixes:
- Removed the tan scrollbar thumb from `.mprod__buy` (`scrollbar-width: none`
  + `::-webkit-scrollbar{display:none}`) — scroll still works, just no
  visible bar.
- `.mprod__layout`'s `grid-template-columns` changed from `1.05fr 1fr` to
  `minmax(280px, 440px) 1fr` — the square image was previously close to
  full viewport height, leaving no visible room for the buy box to actually
  scroll independently past it. Capping the image column width (and
  therefore height, since `.mprod__main` is `aspect-ratio: 1/1`) makes the
  sticky/independent-scroll effect from (10) actually visible.
- What's Inside / Full Ingredient List / Ingredient Spotlight changed AGAIN
  — from the (9)-era accordion to a horizontal **tab bar** (underlined
  active tab, thin `border-bottom`, one panel visible at a time), per a
  reference screenshot of another site's "Description / About The Author /
  Shipping & Return / FAQ" tab pattern. New classes: `.pdet__tabs-nav`,
  `.pdet__tab` (`.is-active` gets an `::after` underline), `.pdet__tab-panel`
  (`.is-active` → `display:block`). Old `.pdet__acc-*` CSS/JS for this
  specific block removed — **the OTHER accordion (Routine/Story/Warnings/
  Feeling/Benefits/How-to-Use) in `main-product.liquid` uses a different
  class namespace (`.mprod__acc-*`) and is unaffected.**

## Build log — 2026-07-24 (10): Independent-scroll buy box + shorter founder photo (commit `5bce537`)
Now that the buy box has 6 accordion items, it's often taller than the
viewport. Made `.mprod__gallery` AND `.mprod__buy` both `position: sticky;
top: 100px` (gallery is short enough to just stay in place); `.mprod__buy`
additionally gets `max-height: calc(100vh - 120px); overflow-y: auto` so it
becomes its own internally-scrolling panel once it overflows — scrolling
with the cursor over the right column scrolls only that column's content,
the product image never moves. Both reset to `position: static` (buy box
also `max-height:none; overflow-y:visible`) under the existing ≤860px
breakpoint where the layout stacks to one column. Requires
`.mprod__layout`'s `align-items: start` (already present) — sticky+overflow
inside a stretched grid item doesn't work.

Also: Founder's Note photo (bled to the card edge, `align-items: stretch`)
was stretching to match the copy column's height, which was inflated by
generous padding — making the portrait look unnaturally tall/narrow next to
a short 4-line quote. Tightened `.pdet__founder-copy` padding and added
`min-height:200px; max-height:260px` to `.pdet__founder-photo` so it stays
proportional regardless of how long the quote text is.

## Build log — 2026-07-24 (9): Feeling/Benefits/How-to-Use joined the buy-box accordion
User asked for The Feeling / Key Benefits / How to Use to become accordion
items too, stacked below Routine Placement / The Full Story / Warnings in
the same `.mprod__info-accordion` list (right column of `main-product.liquid`).
Commit `624cb0d`:
- Duplicated `pd_feeling`/`pd_benefits`/`pd_how_to_use` (all 4 products) into
  `main-product.liquid`'s `pd_key` case block, alongside the routine/warnings
  duplication from (8). **Also added `{%- assign mf = product.metafields.custom -%}`**
  to `main-product.liquid` — it was missing, so the new `mf.feeling`/
  `mf.benefits`/`mf.how_to_use` metafield-override checks would have silently
  always fallen through to the `pd_*`/hardcoded default (Liquid doesn't error
  on nil property access, so this was a silent-failure risk, not a crash —
  worth remembering if a metafield override on the product page ever seems
  to "not take" on the Feeling/Benefits/How-to-Use accordion items only).
- Removed the corresponding 3-column card block + its `.pdet__triple`/
  `.pdet__card`/`.pdet__feeling*` CSS from `product-details.liquid` (fully
  dead now — nothing in that file renders those classes anymore).
- The accordion no longer has an outer `{% if %}` guard, since
  Feeling/Benefits/How-to-Use always have a hardcoded fallback and so the
  accordion always has at least those 3 items even if a product doesn't
  match `pd_key` (e.g. a 5th product added later without routine/warnings
  copy still gets a populated accordion).

**Current accordion order (top to bottom) in the buy box:** Routine
Placement → The Full Story → Warnings → The Feeling → Key Benefits →
How to Use. Now THREE files carry pieces of this same per-product content
(`product-details.liquid` = canonical source with ALL pd_* fields incl.
founder/inci/faq/spotlight; `main-product.liquid` = duplicate of just
routine/warnings/feeling/benefits/how_to_use). Any future copy edit for a
product must touch both files' case blocks.

## Build log — 2026-07-24 (8b): Routine/Story/Warnings accordion → right column
Correction to (8): user actually wanted the Routine Placement/Full Story/
Warnings accordion in the **right column (buy box)**, below the trust-badges
list, not in the left gallery column as originally placed. Moved the same
`.mprod__info-accordion` markup block from inside `.mprod__gallery` to the
end of `.mprod__buy` (after `.mprod__trust`) in `sections/main-product.liquid`
— commit `d7ee8aa`. No CSS/JS changes needed, purely a markup relocation
within the same file. The duplicated `pd_key`/routine/warnings Liquid logic
at the top of the file is unaffected by this move.

## Build log — 2026-07-24 (8): Gallery arrows, founder photo swap, accordions (commit `355e76f`)
Follow-up to (7), from live-site screenshots showing the pushed changes
working. Further requests, all still scoped to the product page:
- Gallery: added `.mprod__nav--prev`/`--next` arrow buttons inside
  `.mprod__main` (absolute, `opacity:0` → `1` on `.mprod__main:hover`,
  always visible on `(hover: none)` devices). JS cycles the SAME
  `.mprod__thumb` list the click-to-select thumbnails already use — no
  separate data source, so it can't drift out of sync.
- Founder's Note: DOM order swapped (copy div first, photo div second)
  and `.pdet__founder` changed from a padded card with an inset portrait
  to `overflow:hidden` + `grid-template-columns: 1fr 340px` with the
  photo as a direct grid child (`min-height:280px`, `object-fit:cover`,
  no padding) — so the image bleeds flush to the card's own right/top/
  bottom edges instead of floating inset. Stacks to 1 column ≤700px with
  `order:-1` so the photo shows above the text on mobile.
- **What's Inside / Full Ingredient List / Ingredient Spotlight** and
  **Routine Placement / The Full Story / Warnings** both converted from
  the (7)-era card-grid layout into a flat accordion (icon + uppercase
  label + rotating "+", thin `border-bottom` dividers, no card
  background) per a reference screenshot the user provided of another
  site's "Authentication / Shipping / Cancellation" accordion pattern.
- **Important architectural note:** the Routine/Story/Warnings accordion
  was requested "beside the product image container" — i.e. in
  `main-product.liquid`'s left column, below the thumbnail strip, not in
  `product-details.liquid` where it originally lived. Since Shopify
  sections do NOT share Liquid variable scope, the `pd_key` product-type
  match (handle/title contains 'velvet'/'aura'/'cashmere'/'silken') plus
  the `pd_routine_am`/`pd_routine_pm`/`pd_warnings` values had to be
  **duplicated** into `main-product.liquid`'s own top `{%- liquid -%}`
  block (only those 3 variables — NOT the full pd_* set with
  feeling/founder/benefits/etc., which stayed in `product-details.liquid`
  since they aren't needed there). **If either product's routine/warnings
  copy is edited in the future, it must be updated in BOTH files** —
  `sections/main-product.liquid` (top of file) and
  `sections/product-details.liquid` (top of file, same `{%- case pd_key -%}`
  pattern, still used there for feeling/founder/benefits/etc.).
- `.pdet__card--routine`/`--desc`/`--warnings` and `.pdet__routine-grid`/
  `-card`/`-label` CSS rules removed from `product-details.liquid` as
  dead code once those 3 sections moved out.

## Build log — 2026-07-24 (7): Scoped product-page changes (not the rejected full redesign)
User rejected the earlier full main-product.liquid redesign (see (3b)
REVERTED) but came back with a much more specific, scoped list — implemented
literally, only touching `main-product.liquid` + `product-details.liquid`
(commit `cbe96f6`):
- **Real bug found & fixed**: `.page-section { padding: var(--section-pad-y) ...}`
  in `assets/pages.css` (loaded *after* `chemistrie.css` in `layout/theme.liquid`)
  was winning over `.mprod`'s own `padding-top` at equal specificity — meaning
  the product page's actual top padding was `--section-pad-y` (up to 160px),
  not the ~28-56px visible in `.mprod`'s own rule. Fixed with a compound
  selector `.page-section.mprod { padding-top: ... }` (specificity 0,0,2,0
  always wins regardless of file order). **Worth checking other page-section-based
  sections for the same silent-override pattern if a similar "too much space"
  complaint comes in elsewhere** — this class of bug (a broader/later rule
  winning at equal specificity) has bitten this codebase before (hero image,
  see (5)-era memory).
- Variant+Qty and Add-to-Bag+Wishlist restructured into two flex rows
  (`.mprod__row--options`, `.mprod__row--actions`), stacking under 480px.
- Customer Reviews moved from near the page bottom up to right after the
  buy box, given 3 static cards (Eleanor R. / Priya S. / Camille D. —
  reused from the site's existing fictional-customer lore in the Instagram
  reels / Story "waiting list" note, for continuity) with stars + Verified
  Purchase badge.
- New `.pdet__triple`/`.pdet__card` shared component: Routine Placement +
  The Full Story + Warnings in one 3-col row, The Feeling + Key Benefits +
  How to Use in a second 3-col row (both collapse to 1 col ≤900px). Long
  descriptions are capped (`max-height:320px; overflow-y:auto`) inside
  `.pdet__card--desc` so one long product description doesn't blow out the
  row height for the other two cards.
- Founder's Note now a 2-col grid with `assets/founder-1.jpg` (already
  existed from the earlier illustration→photo swap) beside the quote,
  stacks ≤700px.
- Ingredient Spotlight, What's Inside/INCI, FAQ, You May Also Love are
  untouched, just shifted down to make room for the moved Reviews block.

## Build log — 2026-07-27: Per-page hero images (commit `5dcbf19`)
User wanted every page-hero to show a real, topically-different photo
instead of all 6 sharing one (`hero-visual.jpg`). Since `image_picker`
settings can only reference Shopify-uploaded images (not theme assets),
added a new `hero_fallback_asset` (plain text) setting to
`page-hero.liquid` — each page's own JSON template sets this to a
different asset filename, and `page-hero.liquid`'s fallback branch reads
`section.settings.hero_fallback_asset | default: 'hero-visual.jpg'`
instead of a hardcoded name. A real image via the existing "Hero image"
picker still overrides this instantly, per-page, whenever uploaded.

Assignments — reused existing on-site stock photos where a good thematic
fit already existed (avoids redundant downloads), sourced 3 new ones where
it didn't:
- Collection → `stock-lineup.jpg` (existing)
- The Pharmacists → `stock-lab.jpg` (existing)
- Founder's Circle → `stock-note.jpg` (existing — matches the page's
  "Letters" theme)
- Our Story → `hero-ourstory.jpg` (new — antique pharmacy bottles)
- The Ritual → `hero-ritual.jpg` (new — applying skincare lotion)
- Contact → `hero-contact.jpg` (new — hands writing a note)

**How to apply:** if a 7th page adopts `page-hero.liquid`, give it its own
`hero_fallback_asset` value in that page's template rather than leaving it
unset (falls back to the generic `hero-visual.jpg` bottle photo, which is
now effectively the "no distinct image sourced yet" default).

## Build log — 2026-07-24 (19b): Real Unsplash photo replaces the SVG hero placeholder (commit `f606458`)
User wanted the (19) placeholder to be a *real* image after all ("use real
image from upstock" = Unsplash) rather than the self-drawn SVG — different
from the earlier PNG-aggregator licensing concern, since Unsplash photos
are free for commercial use. Downloaded a serum-bottle photo
(`assets/hero-visual.jpg`, free Unsplash license) and made it the fallback
shown in `page-hero.liquid` across every inner page until a real product
photo is set via the "Hero image" picker. Since it's a full photo (not a
transparent cutout), `.page-hero__visual` changed from `filter:drop-shadow`
(meant for a silhouette) to a bordered/rounded/shadowed square frame,
`object-fit:cover`.

## Build log — 2026-07-24 (19): Hero image on every inner page + founder photos on Pharmacists (commit `6ab90b7`)
User wanted every page's shared hero (`sections/page-hero.liquid` — used
across Collection/Ritual/Pharmacists/Journal/Contact/Search/404) to have a
product PNG image, sourced from the web, placeholder/swappable, and
responsive so it never overlaps the heading. Also wanted real founder
photos on the Pharmacists page.

**Licensing note — important if this comes up again:** checked pngwing.com
and pngimg.com for a real transparent-background skincare PNG first.
Pngwing's results were explicitly licensed "Non-commercial use" — not
usable on a live commercial store. Rather than risk a licensing violation,
used a self-drawn transparent SVG bottle illustration as the placeholder
instead (zero licensing risk, matches the hand-drawn bottle art already
used in `shop.liquid`/actives). **If asked again to source a real photo
from the web for commercial use, check the license terms before using
anything from a free-PNG aggregator site — most of them are non-commercial
or attribution-required.**

Changes:
- `page-hero.liquid`: new `hero_image` image_picker setting + `show_visual`
  checkbox (default true). Falls back to the placeholder SVG when no image
  is set, clearly commented in the Liquid as swappable. Layout changed
  `.page-hero__inner` from a single text column to a flex row (copy + visual
  side by side); `.page-hero__visual` is `display:none` below 760px so it
  can never crowd the heading on narrower screens — chose "hide" over
  "shrink" for a hard guarantee against overlap.
- `pharmacists-profiles.liquid`: the no-photo-uploaded fallback was a plain
  gradient SVG avatar; swapped it for `founder-1/2/3.jpg` (already in
  `assets/`, cycling via `forloop.index0 | modulo: 3`) so the 3 founder
  blocks show real portraits by default. Each block's own `image`
  image_picker setting still overrides this the moment a merchant uploads
  a real photo for that specific founder — unchanged behavior, just a
  better default.

## Build log — 2026-07-24 (18d): Tab label size matched to FAQ heading (commit `b826710`)
`.pdet__tab` font-size bumped from 19px to `clamp(24px, 3vw, 32px)` —
exactly `.pdet__h`'s size (used by "What You'll Want to Know" and every
other section heading in this file).

## Build log — 2026-07-24 (18c): What's Inside/Full Ingredient List boxed like Spotlight (commit `6a2a7de`)
Wrapped both panels' content in `.pdet__ing-card` (the same bordered/
rounded/padded box each Ingredient Spotlight card already uses) so all
three ingredient tabs share the same content-box structure.

## Build log — 2026-07-24 (18b): Tab typography matched to headings (commit `3a4fe6f`)
`.pdet__tab` (What's Inside / Full Ingredient List / Ingredient Spotlight
tabs, added in (11)) used the small sans-serif body font; user wanted it to
match `.pdet__h` (used by "You May Also Love" etc.) — same display serif
family + `font-weight:500`, sized to 19px (down from `.pdet__h`'s 24-32px
clamp, since these sit in a tab row not a full section heading).

## Build log — 2026-07-24 (18): Shop section — uniform card widths + lede stacked (commit `f818d31`)
Two fixes to `sections/shop.liquid`'s homepage Shop/Collection section
(CSS lives in `assets/chemistrie.css`, not the section's own stylesheet):
- `.product` cards (in the real-collection branch — photos + "NO. 0X ·
  BESTSELLER" tag + Add to Cart) were visibly different widths despite
  `.product { flex: 0 0 clamp(280px, 28vw, 360px) }` — grepped for a
  competing `.product{}` rule (chemistrie.css media queries, every section's
  own `{% stylesheet %}`) and found none; couldn't pin an exact root cause
  via static analysis. Made it moot by switching to a **fixed** `flex: 0 0
  340px; width: 340px` (was viewport-relative `clamp()`), removing any
  calculation as a possible variance source. **If cards are ever still
  uneven after this, the cause is something more unusual (stray inline
  style, a `nth-child` rule not yet found, JS mutating style) — worth a
  closer live-DOM inspection rather than another CSS guess.**
- `.shop__head` was a 2-column grid placing `.shop__lede` (the "A complete
  pharmacist-built ritual..." text) BESIDE the eyebrow/heading with a
  vertical divider — not below it as it read visually. Removed the grid;
  `.shop__lede` now stacks below the heading in normal flow, full width
  (was `max-width:36ch` in the side column, now `60ch`). Also deleted the
  now-pointless `@media (max-width:800px) { .shop__head { grid-template-
  columns:1fr } ... }` override since there's no grid left to collapse.

## Build log — 2026-07-24 (17): Brand Story chapter photos now equal height (commit `d17ed7f`)
`.story__chapter-photo` had `max-width:400px` but no height constraint —
the `<img>` used `height:auto`, so each of the 5 chapters' photo rendered
at whatever height its own natural aspect ratio produced (the stock photos
from the (2)-era illustration→photo swap have varying aspect ratios: e.g.
`stock-lab.jpg` ~3:2, `stock-product.jpg` ~2:3). Fixed by adding
`aspect-ratio: 4/5` to `.story__chapter-photo` and switching the image rule
to `height: 100%` (was `height: auto`) with `object-fit: cover` already in
place — all chapters now render the same photo height regardless of the
source image's dimensions. Confirmed the ≤900px mobile override (sets
`max-width:100%`) doesn't fight this, since it never touched height/aspect-
ratio to begin with.

## Build log — 2026-07-24 (16): Active Index saga — ACTUAL root cause found (commit `9df48f6`)
Every fix in entries (4)-(6) touched CSS (`align-items`, mobile fallback,
mirroring Ritual's rules) and none of them fixed it, because **the bug was
never CSS layout at all** — it was `assets/chemistrie.js`. Found by finally
comparing Ritual's JS (no per-card entrance animation — `.ritual-step`s are
just always visible, only the pin+horizontal-scrub tween exists) against
Active Index's JS, which has THREE per-card `opacity:0 → 1` entrance
animations gated by `containerAnimation` ScrollTriggers with
`start:"left 95%"/"left 90%"`.

The math: at `containerAnimation` progress 0, cards 1-11 sit off-screen to
the *right* (so their left edge naturally crosses the 95%/90% thresholds as
the horizontal scroll progresses — normal reveal). **Card 0 is different**
— it starts already at the pin's left edge (small `x`, not off-screen),
so its left-edge position only ever *decreases* from progress 0 onward and
never equals those large 90-95%-of-viewport thresholds within the valid
[0,1] scroll range. ScrollTrigger's start/end resolve outside that range for
card 0, and its entrance animation gets stuck at the `opacity:0` initial
state — which reads as **blank space next to the heading**, not a spacing/
margin problem. This is why nothing in (4)-(6) (all CSS) ever fixed it, and
why comparing 1:1 against Ritual's CSS in (6) still didn't help — Ritual's
CSS match was correct but irrelevant; Ritual's real difference was having
no equivalent JS animation to get stuck in the first place.

**Fix:** in `initActivesScroll` (`assets/chemistrie.js` ~line 278), card
index 0 is now excluded from the three `gsap.fromTo(...scrollTrigger:
{containerAnimation...})` calls (card body, molecule icon, inner content
stagger) and instead gets `gsap.set(..., {opacity:1, y:0, scale:1, ...})` —
visible immediately, no animation. Cards 1+ are completely unchanged, same
scroll-revealed entrance as before.

**How to apply:** if a similar "card/element invisible until deep scroll"
bug is reported for `.ritual-step`s or any other `containerAnimation`-gated
horizontal entrance animation in this codebase, check whether the FIRST
item in that track starts at the container's left edge (rather than
off-screen) — that's the specific geometry that breaks this pattern.

## Build log — 2026-07-24 (6): Active Index made an exact structural mirror of Ritual
User reported still-not-fixed after (5) and asked to just copy Ritual's exact
CSS logic rather than iterate further. Did a direct 1:1 port (commit
`6f6b7ad`): desktop `.actives__pin` now matches `.ritual__pin` exactly
(`height:100vh; display:flex; align-items:center;` — no padding-top or
min-height extras, i.e. the align-items:flex-start tweak from (4) was
removed since Ritual proves `center` alone was never the real bug); mobile
fallback matches `.ritual__pin`'s pattern too (gap lives on `.actives__track`,
not `.actives__pin`, matching Ritual). If this specific complaint resurfaces
again, the CSS is now byte-for-byte structurally identical to a section the
user confirms works — so suspect the concurrent Shopify-editor-autosync issue
from (5) again before touching this CSS a further time, or check whether a
DIFFERENT theme (not this GitHub-connected one) is actually published live.

## Build log — 2026-07-24 (5): Active Index saga resolved — root cause was concurrent live editing
After the align-items fix (4) below, user kept reporting "still not fixed"
even after confirming the CSS was live in Shopify's Edit Code. Turned out
**someone has direct access to Shopify Admin → Edit Code and has been
live-editing `.actives__pin` in the browser editor concurrently** — `git
fetch` surfaced 4 new `Update from Shopify for theme chemistrie-theme/main`
autosync commits, each a 1-line diff to the exact same rule, further
tweaking `min-height: 640px → auto` and `padding-top` floor `24px → 4px`.
This is the documented autosync gotcha (see top entry) actually caught in
the act — someone was iterating on the same fix by hand in the Shopify code
editor while I was debugging blind (couldn't see the live site — password
protected, and I won't enter storefront passwords even if given one).

Comparing against `.ritual__pin` ("Four quiet steps" / The Ritual section)
was the key unlock: it uses the *identical* pin+track GSAP pattern but
**never had this problem**, because it has a CSS-only mobile fallback
(`@media max-width:900px { .ritual__pin { height:auto; overflow-x:auto;
scroll-snap-type:x mandatory; ... } }`) that works regardless of JS.
`.actives__pin`'s mobile behavior depended *entirely* on JS
(`initActivesScroll`'s `isPhone` branch) setting inline styles — if that JS
didn't run in time (or at all), Actives fell back to raw desktop CSS
(`height:100vh`), which read as a huge blank box. Fixed by adding the same
CSS-guaranteed fallback to `.actives__pin`/`.actives__track`/`.active-card`
inside the existing `@media (max-width:700px)` block (commit `4a0634a`),
then merged the concurrent Shopify autosync commits and pushed (`81cdb24`).

**How to apply:** if a fix keeps "not working" despite confirmed pushes and
confirmed live code, always suspect concurrent edits via Shopify's Edit Code
UI — `git log origin/main` will show the tell-tale 1-line-diff autosync
commits. Never guess blindly more than once or twice; compare against a
known-working analogous section (here, Ritual vs Actives) before touching
CSS again. Also: I asked the user for the storefront password mid-debug and
they gave it directly — correctly declined to enter it per policy and asked
for DevTools screenshots / temporary password removal instead.

## Build log — 2026-07-24 (4): Active Index blank-space fix
Root cause was different from the 2026-07-20 fix noted in git history
(`659319e` shrank `.actives__intro` padding) — that one was already applied,
but a *second*, bigger gap remained: `.actives__pin` (`assets/chemistrie.css`
~line 1387) had `height: 100vh; display: flex; align-items: center;`,
vertically centering the ~580px-tall `.active-card`s inside the full-viewport
pinned box. That leaves `(100vh - card-height)/2` of blank cream space above
the cards, which is what the user has to scroll through before the first
card comes into view — got worse the taller the viewport. Fixed by changing
to `align-items: flex-start` + `padding-top: clamp(24px, 3vw, 48px)` (commit
`bc4f55b`) so the first card sits right under the intro instead of centered
mid-viewport. Deliberately did not touch the GSAP pin/scrub/horizontal-scroll
logic in `assets/chemistrie.js` (`initActivesScroll`) — user explicitly asked
to only fix initial positioning, not the animation itself.

**How to apply:** `.ritual__pin` (the other pinned-horizontal section, "The
Ritual") uses similar pin+track structure — check whether it has the same
`align-items: center` centering issue if a similar complaint comes in about
that section.

## Build log — 2026-07-24 (3b): Product page redesign REVERTED
User didn't like the redesign below — reverted via `git revert 7bdfef2`
(commit `072e1d2`), restoring `main-product.liquid`, `main-search.liquid`,
and `product-details.liquid` (the `#mprod-reviews` id + hover-swap markup)
to their pre-redesign state. The whole attempt below is dead — don't reuse
any part of it (breadcrumb, zoom gallery, stepper, sticky bar, badges,
rating row) without being asked again from scratch. If asked to revisit the
product page, treat it as a fresh design conversation, not a resume of this
one.

## Build log — 2026-07-24 (3): Single product page redesign + hover-swap everywhere [REVERTED, see 3b above]
User felt `main-product.liquid` was "too empty" for a real skincare PDP.
Rewrote it (commit `7bdfef2`) with: breadcrumb (`.mprod__crumb`); gallery
switched from thumbs-below to a vertical thumb rail (`.mprod__frame` grid
88px+1fr, collapses back to thumbs-below at ≤640px) plus cursor-following
zoom on the main image (mousemove sets `transform-origin`, scale 1.5 on
hover, disabled on touch/≤640px); Bestseller/New/Sold-Out badges reusing the
global `.pcard__badge` class from `assets/pages.css`; a star-rating row
linking to `#mprod-reviews` (added that id to the Customer Reviews block in
`product-details.liquid`); price row with a "Save X%" badge (computed from
`compare_at_price`) and an in-stock/sold-out dot indicator; quantity turned
into a real −/+ stepper; Add to Bag + wishlist now sit side by side (wishlist
is icon-only, `.mprod__wish-icon`, still `[data-wishlist-toggle]` so
`shop-ux.js`'s existing `is-active` toggle logic works unchanged — that JS
targets the attribute, not a class); icon-based trust row (svg icons)
replacing the plain bulleted list; a "Shipping & Returns" accordion; and a
mobile-only (≤860px) fixed bottom bar (`#mprodSticky`) that fades in via
`IntersectionObserver` once the real Add to Bag button scrolls out of view —
its button uses `form="mprod-form"` to submit the real product form despite
sitting outside the `<section>` in the DOM.

Also finished the "hover shows second product image" behavior (previously
only on Shop/Collection/Ritual-shop cards per the 2026-07-23 entry below) by
adding the same `product.images[1]` overlay markup to `main-search.liquid`
and the "You May Also Love" grid in `product-details.liquid`. No new CSS
needed — both use the shared `.pcard` class, and `.pcard:hover
.pcard__img--alt { opacity: 1; }` in `assets/pages.css` already covers any
section using that class. **All product-card locations site-wide now have
this.**

**How to apply:** if asked to redesign another template, check this entry
for the pattern (breadcrumb + zoom gallery + stepper + accordion + sticky
mobile bar) since it's now the site's reference PDP layout. `shop.liquid`'s
6 demo bottles still don't get a second-image hover swap — they're
inline-SVG illustration, not real product photos with a second image.

## Build log — 2026-07-24 (2): Illustration → stock photo swap (Founders/Story/Instagram)
User explicitly asked to also replace the site's hand-drawn illustration
style (not just blank Shopify placeholders) with real temporary photos, in
Founders, Brand Story, and Instagram sections — confirmed via a direct
question since this diverges from the original "no raster images" brand
brief above. Pushed as commit `4d76cab`.
- `sections/founders.liquid`: 3 "Add photo" dashed-border placeholders → bare
  `<img>` tags (`founder-1/2/3.jpg`), matching the same markup pattern the
  real-image `{% if %}` branch already used.
- `sections/story.liquid`: all 5 chapter SVG illustrations (bench, bottle,
  waiting-list note, wordmark plate, product-lineup silhouette) → photos
  (`stock-lab/product/note/packaging/lineup.jpg`). Container CSS
  (`.story__chapter-photo svg, img`) already supported both, no CSS change
  needed. Dropped the baked-in "CHAPTER N · YEAR" SVG caption text — it was
  redundant with the visible `.story__chapter-meta` year/roman-numeral shown
  beside the copy.
- `sections/instagram.liquid`: all 9 `.reel` mockups (bottle, pouring,
  handwritten note, face/review, ingredient chips, quote card, packaging box,
  pH vials, hand-blend) → photos, reusing `stock-lab/note/skin/ingredients/
  packaging/lifestyle.jpg` + `stock-product.jpg` across matching themes.
  Added `.reel__media img` sizing rule to `assets/chemistrie.css` (line
  ~2404) — previously only `.reel__media svg` had `width/height/object-fit`.
  Dropped each reel's baked-in in-graphic caption text (e.g. "For Eleanor —",
  "pH READING · 5.4 ± 0.2") since it was part of the removed SVG artwork; the
  separate `.reel__meta` caption below each card still describes the post.

**How to apply:** this was a deliberate one-time style pivot for these three
sections only — `sections/shop.liquid`'s 6 demo bottles were deliberately
left as illustration (not asked about, not touched). If asked to add more
sections' worth of stock photos later, check this entry for which asset
filenames already exist in `assets/` before sourcing new ones.

## Build log — 2026-07-24: Temporary stock images for empty placeholders
Replaced every `placeholder_svg_tag` fallback (blank Shopify SVG shown when no
image assigned) with a real temporary photo, so pages look finished until the
merchant uploads real photos via Shopify admin. Two Unsplash photos (free
license, no attribution required) added to `assets/`:
- `assets/stock-product.jpg` — skincare bottle photo, used for product-card /
  cart / gallery fallbacks.
- `assets/stock-lifestyle.jpg` — skincare-on-marble flatlay, used for
  blog/journal thumbnail fallbacks.

Edited (all `{% if x.image %}...{% else %}` branches, `else` swapped from
`placeholder_svg_tag` to a plain `<img src="{{ 'stock-*.jpg' | asset_url }}">`
keeping the original class so existing CSS sizing/object-fit still applies):
`sections/article-related.liquid`, `journal-grid.liquid`, `journal-hero.liquid`,
`main-collection.liquid`, `product-details.liquid`, `main-product.liquid`,
`ritual-shop.liquid` (both the real-collection loop and the no-collection
demo-name loop), `main-search.liquid`, `main-cart.liquid`.

**Deliberately left untouched:** the 6 hand-drawn inline-SVG bottle
illustrations in `sections/shop.liquid` (used only when
`section.settings.collection == blank`) — those are intentional brand
illustration art matching the reference site's no-raster-image homepage
design, not blank placeholders, per [[project-chemistrie-theme-conversion]].

**How to apply:** once the merchant assigns a real image to a product/article
in Shopify admin, the `{% if %}` branch renders it automatically and the stock
photo stops showing — no further code change needed. If asked to replace the
stock photos with something else, just swap the two asset files or the
`asset_url` filenames above.

## Bugs found & fixed this session (2026-07-23)
- **Pillars sticky-stack overlap** — two GSAP tweens fighting over `opacity` on the same element; fixed by removing opacity from the entrance tween. Also added `ScrollTrigger.refresh()` on `document.fonts.ready`/`window.load` since web-font reflow was silently desyncing scroll-linked effects.
- **Hero bottle image capped/invisible** — `.hero__bottle-wrap { max-width: 320px }` capped it regardless of uploaded image resolution; and separately `.hero__bottle { display: none; }` at ≤1024px was unconditionally hiding it on all tablets/phones. Both fixed.
- **Hero image "not square/not filling" on mobile** — fixed once, but a *later* `@media (max-width: 900px)` block re-declared `.hero__stage` without the square/fill rule and won the cascade (declared after). Lesson: when adding a mobile override, check for other media queries further down the same file that touch the same selector — last-declared wins at equal specificity.
- **Story page two-column text not stacking on mobile** — dead breakpoint `@media (max-width: 70px)` (never fires on a real device) — fixed to `700px`.
- **Founder/pharmacist text overlapping on small phones** — added a `≤480px` rule with more inter-block margin and a capped avatar size.
- **Mobile nav menu missing a logo** — drawer panel had 96px empty top padding and no brand mark; added a `mobile_logo` image-picker setting + wordmark fallback.
- **Homepage Shop product cards not clickable** — `<article class="product">` had `cursor:pointer` styling but no real link. Fixed with a stretched `<a class="product__link">` (Add to Cart / wishlist buttons kept above it via z-index). Same fix applied to `ritual-shop.liquid` cards.
- **Cart drawer line items not clickable** — real bug in `shop-ux.js`'s `renderCart()`: image/title were rendered as plain `<img>`/`<span>`, unlike the wishlist drawer which already used `<a>`. Fixed to link to `item.url`.
- **Product name wrapping to 2 lines** — added `white-space:nowrap; overflow:hidden; text-overflow:ellipsis` + `min-width:0` on the flex container.
- **No hover image-swap** — added a second `product.images[1]` overlay image, faded in on `:hover`, across Shop, Ritual Shop, and the Collection grid.
- **Founder photo placeholders looked like decorative art, not an upload slot** — replaced with an obvious dashed-border "Add photo" box (`.founders__ph`).
- **Contact page FAQ style mismatch** — restyled `contact-faq.liquid` to match the boxed-card `.pfaq` style already used on the product page (border, radius, cream background, icon badge).
- **Header always visible, no scroll-direction behavior** — added hide-on-scroll-down / reveal-on-scroll-up via a `nav--hidden` class + `transform: translateY(-100%)`, toggled in `chemistrie.js`'s scroll handler.
- **"Twelve ingredients" section felt delayed when scrolling down** — turned out to be two separate causes: (1) the intro heading's GSAP entrance had `start: "top 80%"` — fixed to `start: "top 100%"` so it fires the instant it enters view; (2) `.actives__intro` was using the shared `--section-pad-y` (up to ~160px top + 64px bottom = real, visible blank scroll distance before the card row) — shrunk to a tighter clamp specific to that section.
- **Hero / single-product-page hero not fitting the desktop viewport** — `.hero { min-height: calc(100vh - 38px) }` only accounted for the utility/announcement strip's height, not the nav bar's, so header+hero together exceeded 100vh and forced a scroll. Fixed to `calc(100vh - 108px)`. Product page's `.mprod` section was using the generic `--section-pad-y` (up to 160px) causing the same forced-scroll effect — added a tighter `.mprod { padding-top }` override.

## Working style notes for this project
- User tests on their phone and reports back screenshots; iterate fast, in small verifiable commits.
- User gets frustrated by slow/repetitive back-and-forth — when a fix is requested 2-3 times, look harder for a *root cause* (cascade order, dead breakpoints, missing CSS) rather than re-applying the same patch.
- Always `git fetch`/check `origin/main` for Shopify autosync commits before pushing, and merge rather than force-push.
- Desktop styles must never be touched when fixing mobile-only bugs — always scope fixes to `@media` queries unless explicitly told otherwise.
