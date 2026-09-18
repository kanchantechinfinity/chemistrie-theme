# Chemistrie Shopify Theme — Project Memory

## Repo / workflow
- Working repo (Windows machine, since 2026-09-09): `C:/Users/vedant/OneDrive/Desktop/chemistree` — fresh clone of origin/main, source of truth. No mirror copy here.
- Prior macOS working repo: `/Users/apple/Desktop/chemistrie-main/chemistrie-theme` with a manually-synced mirror at `.../chemistrie-main` (historical; not present on Windows).
- GitHub: `https://github.com/kanchantechinfinity/chemistrie-theme`, branch `main`, connected to the live Shopify theme via Shopify's GitHub integration.
- **Important gotcha:** while the merchant has the Shopify theme customizer open, Shopify periodically autosaves its own in-memory section data back to GitHub as commits titled `Update from Shopify for theme chemistrie-theme/main`. Always `git fetch origin main` and check `git log --oneline origin/main` for these before pushing — merge them in, don't just force-push over them.
- User has also manually pasted code directly into the Shopify "Edit code" editor in the past (bypassing git) when unsure the push was reaching the live theme. This can cause drift/breakage — e.g. a manual paste once landed CSS rules nested *inside* another rule's `{ }` block, producing invalid CSS. Always check for accidental duplication/nesting after a manual paste is reported.
- Shopify schema validation gotchas learned the hard way: `url`-type settings can't have non-datasource string defaults (use `text` instead); `text` settings can't have blank `default: ""` (omit the key); `select` option `label` max length is 50 characters; any setting `label` max length is 70 characters — put longer explanatory text in `info` instead (hit this 2026-07-24 on `main-collection.liquid` "collection" and `header.liquid` "mobile_logo").

## Build log — 2026-09-17: Local dev server setup (Windows)
Goal: run the theme on localhost. This is a Liquid theme with no build step
(no `package.json`, no bundler) — CSS/JS in `assets/` are served as-is, so the
ONLY way to preview it is Shopify's own renderer via `shopify theme dev`.
There is no static/offline preview path.
- Installed Shopify CLI globally on Windows: `npm install -g @shopify/cli@latest`
  → v4.8.0 at `C:/Users/vedant/AppData/Roaming/npm/shopify` (that dir may not be
  on PATH in every shell; prepend it if `shopify` is not found).
- No cached CLI auth session existed (`%LOCALAPPDATA%/shopify-cli-nodejs` absent)
  and no `.myshopify.com` domain is recorded anywhere in the repo.
- `shopify theme dev --path .` errors with "A store is required" — the store
  domain must be passed via `--store=<store>.myshopify.com` or `SHOPIFY_FLAG_STORE`.
  First run then opens a browser for OAuth, so it must be started from an
  interactive terminal (a non-interactive agent session cannot complete login).
- Once running it serves on `http://127.0.0.1:9292` with hot reload; after that
  the in-app browser can be pointed at it for visual checks.

## Site structure
- Homepage sections (in `templates/index.json` order): hero, vision, pillars, shop, founders, actives ("Active Index" / "Twelve ingredients"), proof, ritual, testimonials, story, instagram, cta, faq.
- Multi-page site built out per an internal "Website Architecture" doc: Collection (`main-collection.liquid`), Product (`main-product.liquid` + `product-details.liquid`), The Ritual (`ritual-shop.liquid`, `ritual-steps.liquid`), The Pharmacists (`pharmacists-profiles.liquid`, etc.), Our Story (`story-opening.liquid`), Journal (blog), Contact (`contact-faq.liquid`, etc.), Cart (`main-cart.liquid`), Search, 404, customer account pages.
- Nav: Home / The Collection / The Ritual / The Pharmacists / The Journal / Contact (`sections/header.liquid`). Journal link resolves dynamically via `blogs.journal.url` else first blog else `/blogs/journal` (actual blog handle turned out to be `news`).
- Cart drawer + wishlist drawer: `snippets/cart-drawer.liquid`, `snippets/wishlist-drawer.liquid`, `assets/shop-ux.js` (vanilla JS, `/cart/add.js` + `/cart/change.js` + `/cart.js`), `assets/shop-ux.css`.
- Animation stack: GSAP 3.12.5 + ScrollTrigger + Lenis smooth-scroll, loaded via CDN in `layout/theme.liquid`, driven by `assets/chemistrie.js`.
- Real product content (Velvet, Aura, Cashmere, Silken) sourced from client docx files, rendered in `product-details.liquid` via a handle/title-matching `pd_key` pattern.

## Build log — 2026-08-04: Site-wide Copy Bible alignment pass
User instruction: match the entire site to "Chemistrie Website Copy Bible v1.0"
exactly (names, ingredients, structure) for a client demo — "nothing should be
missing." Bible source: `/tmp/cb/copybible.txt` (extracted from the client's
docx via `textutil`; re-extract if the docx changes, see extraction method
note below). Work landed across commits `22194cc`→`e24d4cf`:
- **The Pharmacists page**: replaced fictional "Dr. A/Dr. M/Dr. S" throughout
  with real founders Harin & Zach and the Bible's exact 6-part origin story
  (met 2011 at U of Houston College of Pharmacy, Phi Delta Chi, reunited at
  The Chemist Pharmacy, etc.). Removed fabricated founder pull-quotes (Bible
  explicitly warns against inventing quotes founders didn't actually say).
- **Homepage** (`templates/index.json`): Hero, Founders, Story ch.1-2,
  Newsletter, Shop/Ritual/Instagram section headings all rewritten to Bible's
  Part III exact wording. Footer tagline was already an exact match.
- **Collection page**: Page Intro rewritten to Bible Part IV. Fixed
  testimonials referencing "Lumina" and "Peptide Cream" as already-purchased
  — neither is real (Lumina is coming-soon-only per Bible; Peptide Cream
  isn't in the 4-product launch lineup at all). Swapped to Aura/Silken.
- **Ritual page + Routine Builder** (biggest structural fix): the site's
  ritual/routine content used a fictional AM=PM paired 4-step model with
  invented products (Golden Oil, Renewal, Peptide Cream, Vitamin C Elixir,
  Hydrating Serum, Eye Cream) — none of which are real. Rebuilt
  `sections/ritual-steps.liquid` to support independent AM (5 steps:
  Velvet→Lumina(coming soon)→Silken(optional)→Cashmere→Your Own SPF) and PM
  (4 steps: Velvet→Silken(optional)→Cashmere(optional)→Aura) sequences per
  Bible Part VII, instead of a 1:1 toggle. Applied the same Lumina
  "(coming soon)" tag and "Your Own SPF" relabel (never coming-soon, no
  product link, since Chemistrie will never make sunscreen) across every
  product's `pd_routine_am/pm` in **both** `product-details.liquid` and
  `main-product.liquid` (duplicated pd_key pattern — Shopify sections don't
  share Liquid scope, see below).
- **Product pages**: added the Bible's shared Founder Story scaffold
  paragraph (identical text, all 4 products) to `product-details.liquid`'s
  Founder's Note block. Added per-product eyebrow labels to
  `main-product.liquid` buy box: Aura="Chemistrie Signature",
  Velvet/Cashmere="Chemistrie Essentials", Silken="Chemistrie Precision".
- **Fictional-name cleanup sweep**: `sections/vision.liquid`,
  `founders.liquid`, `newsletter-cta.liquid`, `story.liquid` schema
  *defaults* (not just live template data) still said "Dr. A/Dr. M/Dr. S" —
  fixed so a merchant "reset to default" in the theme editor can't regress
  the brand. `sections/shop.liquid` (Product Intro fallback grid) and
  `sections/actives.liquid` ("Active Index" ingredient scroller) still
  reference fictional products (Golden Oil, Renewal Serum, Vitamin C Elixir)
  but only render when their `collection` setting is blank / aren't in
  Bible scope at all — left as-is, flagged to user, not fixed.
- **Microcopy** (Bible Part X): 404 page and cart empty-state copy now
  match Bible exactly ("This page didn't make it into the Collection." /
  "Explore the Collection to start your ritual.").
- **Explicitly out of scope / flagged to user, not done**: exact Shopify
  variant pricing (Velvet $30/$60/$95, Cashmere $85/$150, Aura $105/$195,
  Silken $80/$135) lives in Shopify Admin product data, not theme files —
  can't be fixed via code. Our Story page (`page.our-story.json`) has no
  corresponding Bible part and contains an invented "burned cheeks" retinol
  anecdote not sourced from the Bible — left alone pending user direction on
  whether that page should be rewritten or retired. Founder's Circle
  benefits/tier language (Bible Part VIII §7) has two items the Bible itself
  flags as needing a founder decision before becoming real copy (private
  events, birthday gifts) — not applicable to code either way.
- **Docx extraction method** (repeat if Bible is updated): can't `cp`/`Read`
  binary files from `~/Downloads` (macOS sandbox blocks it) — ask user to
  move the file to `~/Desktop` first, then
  `textutil -convert txt -stdout <path> > /tmp/cb/copybible.txt` (no
  pandoc/libreoffice on this machine). Cache the txt; re-run `sed -n
  'X,Yp'` against it per Part rather than re-extracting each time.

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

## Build log — 2026-09-09: Homepage Trust Signals (Pillars) copy update
Rewrote all 3 pillar cards' title + body in `templates/index.json`
(`pillars_r7hExn` section, blocks `pillar_JQgt3h`/`pillar_TyVrzy`/`pillar_cCqT3t`)
per user's exact wording — content only, no font/style/markup changes:
- 01 "Pharmacist-Formulated" → lede: "Every formula is developed with the
  precision, intention, and accountability we bring to pharmacy."
- 02 title changed "Pharmacist-Selected Sourcing" → "Purposefully Formulated";
  lede → "Every ingredient earns its place, selected not for the label, but
  for what it contributes to the formula as a whole."
- 03 title changed "Appearance-Language, Always" → "Designed to Work
  Together"; lede → "A focused collection made to layer with intention, so
  your ritual includes what your skin needs and leaves out what it doesn't."
Committed `8bbb98a`, pushed to origin/main directly (no drift from Shopify
autosave at time of push). Local `shopify theme dev` preview was requested
but skipped — session is non-interactive and can't complete the browser
OAuth login `theme dev` needs; user opted to review via Shopify theme
editor/preview instead. No local Shopify CLI auth/config exists on this
Windows machine yet.

## Build log — 2026-09-09 (2): Trust Signals pillar images added, no Shopify Files access
User provided 3 reference images for the 3 pillar cards. This session has no
image-save tool and no Shopify Admin/API access — couldn't upload to Shopify
Files or extract chat-pasted images to disk directly. Found the actual files
already sitting in `~/Downloads` (`Pharmacist Formulated.png`, `Purposefully
Formulated.png`, `Designed to Work Together.png`) and copied them into
`assets/` instead — **worth checking `~/Downloads` for recently-added files
matching a described image before asking the user to re-supply one.**

Since the pillar block's `image` setting is a Shopify `image_picker` (only
works with `shopify://shop_images/...` files already in Shopify's library,
rendered via `image_url` filter — can't point it at a theme asset), added a
parallel `image_asset` (plain text, filename in `/assets`) setting to the
`pillar` block schema in `sections/pillars.liquid`, rendered via `asset_url`
as a fallback only when `image` is blank. `image_picker` still wins if a
merchant uploads a real photo through the theme editor later — this doesn't
regress that path, just fills it in for now via git-controlled files.

Files added: `assets/pillar-pharmacist-formulated.png`,
`assets/pillar-purposefully-formulated.png`,
`assets/pillar-designed-together.png` — mapped 1:1 to the 3 pillar titles.
Committed `0f13e9b`, pushed to origin/main (checked for Shopify autosync
drift first, none found).

**How to apply:** this `image_asset` fallback pattern (image_picker + a
text-based `/assets` filename fallback, `image_url` vs `asset_url`) is now
available if another image_picker-only section needs a locally-supplied
image without going through Shopify Files — same shape as the existing
`hero_fallback_asset` pattern on `page-hero.liquid` (see 2026-07-27 entry).

## Build log — 2026-09-09 (3): image_asset fix (0f13e9b) didn't render — schema label >70 chars
User reported the live site (hard-refreshed) still showed the old plain
mono-circle badge ("C.") instead of the new pillar image. Root cause: the
new `image_asset` setting's `label` in `sections/pillars.liquid`'s
`{% schema %}` was ~82 characters — over Shopify's **70-char setting label
limit** (already documented at the top of this file, 2026-07-24 entry, and
the exact same class of bug that blocked the Contact page deploy, commit
`c3e1466`). A schema validation failure on one section can silently block
that section's deploy while the rest of the theme still updates, so the
copy/image-mapping change (`0f13e9b`) landed but the code path that would
have used it never went live. Fixed by shortening the label to "Crest image
filename (/assets)" and moving the explanation into `info` (commit
`3a326c2`).

**How to apply:** whenever a new/edited schema setting doesn't seem to take
effect on the live site despite a clean push (no autosync drift), check
setting `label`/option `label` lengths (label ≤70 chars, select option
label ≤50 chars) before debugging the Liquid logic itself — a validation
failure elsewhere in the same schema block can silently no-op the whole
section's deploy. Locally: `awk '/{% schema %}/{flag=1;next}/{% endschema
%}/{flag=0}flag' <file>.liquid | node -e "..."` (JSON.parse) catches syntax
errors, but won't catch Shopify-specific limits like label length — no
local tool currently checks those, so eyeball new/changed labels against
the limits list at the top of this file before pushing.

## Build log — 2026-09-09 (4): Pillar images fix — real root cause was GitHub↔Shopify JSON template drift
The 70-char label fix (above) was real but not sufficient — after fixing it
and pushing, the live `templates/index.json` (checked directly in Shopify's
Edit code) was still missing `image_asset` for at least `pillar_TyVrzy`,
even though GitHub's `templates/index.json` had it correctly (confirmed via
`git show origin/main:templates/index.json`). **So the GitHub→Shopify sync
had NOT applied that content change to the live theme's JSON template,
despite applying the schema change to the Liquid section file in the same
commit (`0f13e9b`)** — JSON templates and Liquid section files apparently
don't always sync identically; a push touching `pillars.liquid` alone
(`3a326c2`) didn't retroactively re-sync `index.json`'s stale content. User
fixed it by directly editing `templates/index.json` in Shopify's Edit code
UI, which produced two `Update from Shopify for theme chemistrie-theme/main`
autosync commits (`2776e3c`, `8db4e3d`) — merged into git via `git merge
origin/main --ff-only`, confirmed all 3 pillar blocks now have correct
`image_asset` values in both places.

**How to apply:** if a GitHub push updates a section's schema (adding a new
setting) *and* a template JSON's content in the same or nearby commits, and
the new field doesn't appear live even after confirming the schema landed in
Shopify's Edit code, check the template JSON specifically next (not just the
section file) — content and schema can desync across the GitHub integration.
Fastest fix is a direct edit in Shopify's Edit code (then pull the resulting
autosync commit back into git), same as documented at the top of this file
for other drift scenarios.

**Also received a "Do not" spec for the Trust Signals section** (mobile
notes + hard constraints), confirmed already compliant: no PCCA/ExoBlue
sourcing language, no "Appearance-Language, Always" heading, no generic
stock-lab imagery substituted for the user's 3 specific provided photos.
Cards must stay readable/balanced stacked or swiped on mobile — not
separately audited yet, worth a mobile check next time this section is
touched.

## Build log — 2026-09-09 (5): Homepage Collection section — final copy applied (commit `c9ea2ce`)
Client-approved final copy for the homepage "Collection" section
(`shop_jAJymM` / `sections/shop.liquid`, real-collection branch since
`collection: home-page-products` is set):
- Heading (`templates/index.json`): "The Collection." → "Individual
  formulas. Your ritual."
- Lede: "Everything a routine needs, and nothing it doesn't." → "A focused
  collection designed to stand beautifully on its own and work
  intentionally together."
- Footer CTA (`foot_link_label`): "Explore the Full Collection" → "Explore
  the Collection".
- Eyebrow left unchanged — hardcoded `— The Collection —` in the liquid
  file (not a schema setting) already matched the requested "THE
  COLLECTION" content.
- Per-product subtitle (`card_copy`, the `<p>` under each product name,
  matched via handle/title substring in the file's `{%- liquid -%}` block):
  replaced the old descriptive sentences with short product-line subtitles
  — Velvet→"Foaming Facial Cleanser", Veil→"Weightless Hydrating Serum",
  Aura→"Advanced Renewal Cream", Silken→"Scar Refining Gel", Cashmere→
  "Lightweight Hydrating Lotion". `card_role` tags (Cleanse/Treat/Hydrate/
  Renew/Refine, shown as a small badge on the image) were NOT requested and
  left unchanged.

## Build log — 2026-09-09 (6): Collection cards restructured to card spec (commit `8790e8d`)
Client "Developer changes" brief for the homepage Collection section: five
launch cards, hierarchy = image → name → descriptor → price, no long
marketing paragraphs, whole card links to the product, must scale past five
products without redesign, prices from product data.
- **Markup** (`sections/shop.liquid`, real-collection branch): dropped the
  `.product__meta-top` flex row (name+descriptor left, price right) so the
  meta stacks h3 → descriptor `<p>` → price → CTA in spec order. Card CTA
  label "View X →" → "Shop X". Whole-card link (`.product__link` stretched
  anchor) and `{{ product.price | money }}` were already in place.
- **Scalability**: the per-product descriptor no longer dead-ends at
  `product.description | truncatewords: 20` for unknown products (that was
  the "long marketing paragraph" risk). Order is now: the 5 hardcoded
  launch descriptors (handle/title substring match) → overridden by
  `product.metafields.custom.descriptor` if set → else `product.type`. So a
  6th product renders sensibly with zero code edits. Loop `limit: 6` → 12.
- **Fixed card height removed** (`assets/chemistrie.css`): `.product` had
  `height: 540px` (and `height: 460px` in the ≤~640px block) alongside
  `min-height`. Stacking the price on its own row adds ~30px, which would
  overflow a fixed-height card — both now `min-height` only, and the rail's
  existing `align-items: stretch` keeps cards equal height. The mid
  breakpoint (`min-height: 380px`) was already correct.
- `.product__meta-top > div` rule removed from shop.liquid's
  `{% stylesheet %}` since that element is gone there; **`ritual-shop.liquid`
  still uses `.product__meta-top`** and carries its own scoped
  `.ritual-shop .product__meta-top > div` copy, so the base rule in
  `chemistrie.css` must stay. **Note `.product`/`.product__*` classes are
  shared by `shop.liquid` AND `ritual-shop.liquid`** — any base-class CSS
  change hits both; ritual-shop still uses the old meta-top layout and the
  old long `card_copy` sentences (not in scope for this brief).
- CTA destination left as `routes.all_products_collection_url` — already the
  same target the header nav's "The Collection" link uses, so it satisfies
  "EXPLORE THE COLLECTION → Collection page".

**Open item — Veil card not rendering:** user reported the Veil card is
missing from the live section. Nothing in the theme filters it out (the loop
had room at `limit: 6`, and the Veil branch matches on handle/title
containing "veil"), so it is almost certainly Shopify product data: the Veil
product either doesn't exist yet, is unpublished/draft, or isn't in the
`home-page-products` collection this section reads. **Not fixable from the
theme code** — needs checking in Shopify Admin → Products / the
`home-page-products` collection.

## Build log — 2026-09-09 (7): Approved product card images (commit `12115ab`)
User supplied 5 approved product card shots and reported they weren't
showing — because the card image only ever came from
`product.featured_image` (Shopify product data), not from anything in the
theme. Same situation as the pillars: **the client supplies images to this
session, but Shopify-side product/file data doesn't get updated**, so the
practical fix is theme assets. Files were again waiting in `~/Downloads`
("Velvet Card Image.png" etc.) — copied to `assets/product-velvet.png`,
`-veil`, `-aura`, `-silken`, `-cashmere`.

`sections/shop.liquid`'s per-product `{%- liquid -%}` chain now also assigns
`card_asset`, and the media block prefers it: `card_asset` → else
`product.featured_image` (+ its `images[1]` hover swap) → else the drawn
SVG bottle. **The asset deliberately wins over `featured_image`** for the 5
launch products, because real product photos in Shopify were either absent
or not the approved shots; any other product still falls through to Shopify
data, so scalability holds. Note the hover image-swap only exists on the
`featured_image` branch, so these 5 cards have no second-image hover (only
one approved shot each).

The images are tall 2:3 lifestyle shots while `.product__media` is ~1:1.1,
so `.product__photo`'s existing `object-fit: cover` crops ~13% off the top
and bottom — the bottle and its label survive that crop, so the CSS was
left alone. **If the crop is ever reported as wrong, adjust
`object-position` (or switch these to `contain`) rather than resizing
`.product__media`**, which is shared with `ritual-shop.liquid`.

**Pattern worth remembering across this project:** when the client says "I
can't see the new images", check whether that image slot reads from Shopify
data (`image_picker`, `product.featured_image`, Files library) versus theme
assets — and check `~/Downloads` for the actual files, which is where they
keep landing.

## Build log — 2026-09-09 (8): Approved product images sitewide via one snippet (commit `61ff5ba`)
The homepage-only fix in (7) wasn't enough — user reported old images still
showing when clicking into a product and on the Collection page. Every
product-card surface reads `product.featured_image` independently, so each
needed the approved-asset mapping.

**Created `snippets/product-image-asset.liquid`** — takes `product:` and
echoes the approved `/assets` filename (or nothing). Because `{% render %}`
isolates scope, callers use:
`{%- capture card_asset -%}{%- render 'product-image-asset', product: product -%}{%- endcapture -%}`
then `| strip`. This is the one place the handle→image mapping lives now;
`shop.liquid`'s previously-inline `card_asset` assignments were removed in
favour of it. **Add new approved product images there, not per section.**

Wired into: `shop.liquid` (homepage), `main-collection.liquid`,
`main-product.liquid` (gallery), `product-details.liquid` ("You May Also
Love", loop var is `p`), `main-search.liquid` (loop var `item`, guarded by
`object_type == 'product'` so non-products just fall through) and
`ritual-shop.liquid`. Each keeps `featured_image` → stock-photo as
fallbacks for unmapped products.

**Product page gallery:** when an approved asset is used, the thumbnail
strip AND the prev/next arrows are suppressed (`card_asset == blank and
product.images.size > 1`) — otherwise clicking a thumb swapped the main
image back to an old Shopify photo, which was the user's actual complaint.
The `width="1000" height="1000"` attrs are omitted on the asset `<img>`
since these shots are 2:3, not square (`.mprod__main img` is
`object-fit: contain`, so it renders correctly).

**Unresolved:** user reports the Aura card image specifically not visible
while the other four work. Verified locally that `assets/product-aura.png`
is a valid, non-truncated PNG (checked header + IEND chunk) and the
matching logic is identical for all five, so it's not a file or code
difference — suspect a transient Shopify asset-sync miss for that one file,
or the Aura product's handle/title not containing "aura". **Diagnostic to
use next time:** if the descriptor under the card name reads something
other than "Advanced Renewal Cream", the handle/title match failed; if the
descriptor is right but the image is missing, it's the asset sync.

**Veil:** confirmed present on the Collection page, so the product exists
and is published — it's missing from the homepage only because it isn't in
the `home-page-products` collection that section reads. Shopify Admin fix,
not code.

## Build log — 2026-09-09 (14): Trust Signals images invisible on tablet/phone (commit `65a0f0e`)
User: "fix the trust signal section for mobile view and tablet — cards must
remain readable and visually balanced when stacked or swiped, the images
also should be visible."

**Root cause (same cascade trap as founders, third time in this file):**
`.pillar__crest--fullimage` (line ~1045) sets `width/height: 100%` +
`border-radius: 20px` and is even commented "Overrides the circle badge's
fixed 220px/border-radius:50%". But **three later blocks re-declare plain
`.pillar__crest` with the circle badge's fixed size** — `140px` at ≤1024
(~2502), `120px` at ≤640 (~2593) and `120px` at ≤700 (~2772). Equal
specificity (0,0,1,0), later source position → **they win**, so the
full-bleed pillar photos rendered as ~120px squares in an otherwise empty
full-width visual row. That's both complaints at once: image barely
visible + card unbalanced.

Compounding it: `.pillar__crest-img` is `position: absolute; inset: 0`, so
it contributes no intrinsic height. `height: 100%` inside the stacked
layout's auto-height grid row has nothing to resolve against — without the
120px rescue it would have collapsed to zero. **A percentage height was
never going to work once the visual moved to its own stacked row; it needs
an `aspect-ratio`.**

Fix appended at the END of `chemistrie.css` using **two-class selectors**
(`.pillar__visual--full .pillar__crest--fullimage`, 0,0,2,0) so it wins on
**specificity, not source order** — a future single-class `.pillar__crest`
rule can't silently undo it again. ≤1024: `width: 100%; max-width: 420px;
height: auto; aspect-ratio: 4/3; border-radius: 18px`. ≤700:
`max-width: none` (full width on phones).

**Why `max-width: 420px` on tablet rather than full width:** tablet keeps
the sticky stack with `.pillar { min-height: 86vh; top: 14vh }`. A
full-width 4:3 image on landscape iPad (944px content width) would be
~708px tall, pushing the card past the 768px viewport — a sticky card
taller than the viewport gets its bottom cut off. Capped at 420px the
image is ~315px tall and the card lands ~555px, inside 86vh in both
orientations. **If tablet cards are ever made non-sticky, the cap can go.**

### (14b) First fix missed — live section renders the CIRCLE variant, not full-bleed (commit `862892a`)
User re-reported "mobile view pics are not visible" with a screenshot
showing a **~35px circular** photo badge. Two deductions from that image:
1. **`border-radius: 50%` was winning**, which only happens if
   `.pillar__crest--fullimage` is absent from the element — its
   `border-radius: 20px` is declared after the base 50%. So the live
   template is rendering **branch 4 of `pillars.liquid` (`--image`, the
   circle badge), not branch 3 (`--fullimage`)** — i.e. the live
   `crest_style` is NOT `full`, even though `git show
   origin/main:templates/index.json` clearly says `"crest_style": "full"`.
   **Another `templates/index.json` desync, same as (4).**
2. The badge was also far smaller than the 120px the ≤640 block sets,
   which the CSS alone doesn't explain — most likely the GSAP crest
   entrance tween (`scale: 0.6`, `chemistrie.js` ~line 151) left stranded
   by a trigger that never resolved in the stacked layout.

**Fix made unknown-tolerant rather than chasing the branch:** the rule now
targets **both** photo variants (`.pillar__visual .pillar__crest--image`
*and* `--fullimage`), so the image is a 4:3 banner on small screens
regardless of how `crest_style` is set live — removing the dependency on a
JSON value that has proven unreliable. Also `display: none` on their
`::before` (the inset ring is circle-only decoration), and
`.pillar__crest { transform: none !important; opacity: 1 !important }` at
≤700 so a stuck entrance tween can't shrink it — consistent with this
section's existing phone policy of skipping its own entrance animations.

**Lesson:** when a screenshot contradicts what the repo's JSON says should
render, **read the rendered CSS effects as evidence of which Liquid branch
ran** (here `border-radius` gave it away) — and prefer a fix that works for
every branch over one that assumes the JSON synced.

### (14c) ROOT CAUSE — markup keyed off the desynced setting (commit `7c4d963`)
Third report ("still too small… idk what are you doing"). Stopped guessing
at the cascade. **Tried to fetch the live DOM: `curl https://chemistrieco.com/`
returns Shopify's "Please Log In" page — the storefront is password
protected** (7995-byte password shell, zero `pillar` matches). Per the
2026-07-24 (5) entry, do NOT ask for / enter the storefront password.
**So live-DOM inspection is unavailable on this project — plan fixes to be
correct without it.**

Actual root cause: `pillars.liquid`'s photo branches each required
`section.settings.crest_style == 'full'`, so with the live JSON's
`crest_style` not being `full` (repo says `full`; live evidently doesn't —
see (14b)), every photo fell through to the **`--image` circle-badge**
branch, which chemistrie.css sizes at 120px. All three of my CSS attempts
targeted the wrong element. **The bug was in the Liquid, not the CSS.**

Fixes, chosen to be immune to the JSON desync:
1. **Five crest branches collapsed to two** — a photo (image_picker *or*
   `image_asset`) *always* renders `.pillar__crest--fullimage`, and
   `.pillar__visual--full` is now unconditional. `crest_style` no longer
   affects photo rendering at all. The `else` mono-badge branch is kept for
   blocks with no photo. **The `crest_style` schema setting is now
   effectively dead for photos — consider removing it if it confuses later.**
2. **Sizing moved into a new `{% stylesheet %}` block inside
   `pillars.liquid`** (the file had none before) rather than chemistrie.css,
   so it ships with the Liquid file — which is the one file type PROVEN to
   sync reliably in this project. Uses `!important` deliberately: it's the
   only way to beat the six-plus scattered `.pillar__crest` declarations
   without depending on file order. Removed the chemistrie.css block from
   (14b) so there's a single source of truth.
3. Empty `crest_sub` no longer renders `.pillar__crest-sub--onimg` — with
   `crest_sub: ""` live it was painting a dark gradient band over the image
   for no text.
4. `transform: none !important; opacity: 1 !important` on the crest ≤1024,
   killing the stuck-pop-in failure mode on tablet and phone.

**Rule for this project going forward:** when a fix must survive, put it in
a **`.liquid` file** (section markup or its `{% stylesheet %}`), never in a
JSON template value or a shared CSS file's breakpoint — and **don't let
markup branch on a JSON setting whose live value can't be verified.**

**Deliberately NOT changed (flagged to user instead):** tablet still uses
the desktop sticky-overlap with 86vh cards, and the JS stacking tween
(`opacity: 0.06` on lower cards, `chemistrie.js` ~line 160) still runs
there — phones neutralise it via `.pillar { opacity: 1 !important;
transform: none !important }` in the ≤700/≤640 blocks (a documented,
deliberate choice: "skip scroll-triggered fade/slide-in on phones"). Did
not extend that to tablet because it would also kill the entrance
animations the user explicitly asked to keep working on tablet in (11e).
**If tablet cards still read as broken/faded, the next step is gating that
stacking tween with `gsap.matchMedia("(min-width: 1025px)")`** — same fix
shape as the founders parallax — rather than more CSS.

## Build log — 2026-09-09 (13): Footer final copy + editable links (commit `d73f5bf`)
Brief: final copy (brand line, SHOP/DISCOVER/HELP columns, legal line),
"ensure all navigation/social/policy links are editable", "don't duplicate
the Founders' Circle email form if it sits immediately above the footer",
"all destinations must resolve to actual pages or be marked TBD", clean
mobile collapse/tap targets, and a Do-not list: keep "Compounded with care
in Houston." and keep the redundant Houston positioning.

**Key architectural finding: the footer is a STATIC section** —
`layout/theme.liquid` line 46 renders `{% section 'footer' %}`, so its
settings live in **`config/settings_data.json`** (`current.sections.footer`),
not in a template JSON. That's the same auto-generated file class as
`templates/index.json`, which has already failed to sync from GitHub once
in this project. **So I deliberately did NOT make the footer links schema
blocks** — if the JSON didn't sync, a block-driven footer would render with
zero links, a far worse failure than the pillar/instagram cases.

Instead used **`link_list` settings + hardcoded fallback**, which is the
pattern `header.liquid` already uses (`section.settings.menu` with an
`{%- else -%}` hardcoded nav). Three columns, each
`heading_*` (text) + `menu_*` (link_list): assign a menu from Shopify
Navigation and labels/URLs become editable with **zero theme-JSON
dependency**; leave it blank and the column renders its built-in approved
links. Columns renamed Shop / **Discover** (was About) / **Help** (was
Support), links per the brief — note "The Ritual" page is relabelled
**"Ritual Finder"** in the footer while still pointing at
`/pages/the-ritual`, and Shipping + Returns merged into one
"Shipping & Returns" link (both already pointed at the same page).

Other details:
- **Legal moved from a 4th nav column into the bottom bar** as inline links
  beside the copyright, using the **`.footer__legal` CSS class that already
  existed in `chemistrie.css` but was never used in markup**. Removing the
  4th column meant dropping the `footer__top--5col` modifier — and the
  **base `.footer__top` is already `1.4fr repeat(3, 1fr)`**, i.e. exactly
  brand + 3 columns, so no new CSS was needed. Deleted the now-unused
  `--5col` rules (base already covers ≤900).
- **Policy links use Shopify's native policy objects** —
  `shop.privacy_policy.url` / `shop.terms_of_service.url` — with optional
  `privacy_url`/`terms_url` overrides. **The links are hidden when neither
  resolves**, rather than shipping a dead `#` href; same treatment applied
  to the social icons (previously they defaulted to `'#'` and always
  rendered). That's my reading of "must resolve to actual pages or be
  marked TBD": don't print "TBD" on a live storefront, just don't ship dead
  links — and report the unverified handles to the user.
- **Copyright:** year stays Liquid-generated (`'now' | date: '%Y'`) with an
  editable `copyright_line` after it → "© 2026 Chemistrie. All rights
  reserved." The required **"Compounded with care in Houston." is hardcoded,
  not a setting**, so it cannot be blanked away — and the redundant
  `.footer__seal` "Pharmacist-formulated · Houston, TX" was **kept**, per
  the Do-not list (this client's "Do not / Remove X" = keep X; see (12b)).
- **No signup form added** — verified `newsletter-cta.liquid` (the section
  immediately above the footer, last in `index.json`'s order) holds the
  `{% form 'customer' %}`, and footer has zero `<form>` tags.
- Mobile: kept the existing collapse (brand spans full row, 2-col nav at
  ≤700) and added `padding: 7px 0` to `.footer__col a` / `6px 0` to
  `.footer__legal a` for real tap targets (~32px) per the brief.
- Removed the footer's own unused `email` setting + its dead `assign mail`
  (never rendered in markup). **The global `settings.social_email` in
  `config/settings_schema.json` is untouched.** Left the orphan `email` key
  in `settings_data.json` alone — Shopify ignores unknown keys, and that
  file is auto-generated so a spurious diff isn't worth it.

**Flagged to the user, unverifiable from the repo:** page templates exist
for the-ritual, the-pharmacists, founders-circle and contact, but there are
**no templates for `faq` or `shipping-returns`** — which proves nothing,
since a plain Shopify page uses the default `page.json`. I have no Admin
access to confirm those two pages exist, so those two footer links are the
ones to verify or mark TBD before launch.

## Build log — 2026-09-09 (12): Follow Chemistrie / social section rebuilt as curated grid (commit `0bf4785`)
Brief: final copy + "keep a curated social grid, manual CMS curation
preferred over an uncontrolled live feed, tiles link to their posts, main
CTA → official Instagram, content-driven assets (approved brand images may
be temporary but **do not hard-code them permanently**), clean mobile grid
rhythm / no awkward crops", and a Do-not list reading "Remove 'Follow the
Formulary.' / Remove fabricated follower counts".

**Reading of the "Do not" block:** as in the earlier briefs, the items are
*don'ts* — i.e. remove that headline and remove the fabricated counts (not
"do not remove"). "Follow the Formulary." was literally this section's
`heading` in `templates/index.json`, replaced by the new headline, which
confirms the reading. Note the **newsletter section's "The Formulary
Journal." heading was left alone** — different section, not in this brief.

`sections/instagram.liquid` rewritten:
- Nine hard-coded `<article class="reel">` tiles (with `stock-*.jpg`
  images) replaced by a `post` **schema block** loop: `image`
  (image_picker) → `image_asset` (temporary /assets filename) → nothing,
  plus `caption` and `link`. `max_blocks: 12`. Tiles get a stretched
  `.reel__link` anchor (same pattern as `.product__link`) so a tile links
  to its own post when a URL is set.
- **Fabricated data removed:** `follower_count` setting ("21.4k"), the
  per-tile like/comment `.reel__stats`, and the `.reel__play` badges +
  `.reel__duration` labels ("0:42" etc.) — the tiles were never videos.
  Their now-dead CSS was deleted from `chemistrie.css` too (verified unused
  elsewhere first).
- **`feed_embed` removed** — the section had an "paste an Instagram feed
  app embed" escape hatch that replaced the curated tiles wholesale. Gone,
  since curation is the intended source.
- Unapproved `sub`/`body` copy cleared (per the (11) judgment call) and
  their schema defaults dropped.
- `.reel__media` aspect ratio **9/16 → 4/5** so portrait source images
  aren't cropped hard (the "no awkward thumbnail crops" note).
- Temporary tile content = the already-approved assets
  (`pillar-pharmacist-formulated.png` + the five `product-*.png`), set via
  block settings in `index.json` so they're editable, **not** hard-coded in
  Liquid. Captions/links left blank deliberately — inventing social post
  copy would be fabrication.

**Flagged to the user, needs confirming:** `instagram_url` was empty, so I
derived `https://www.instagram.com/chemistrie.co/` from the existing
`handle` setting (`@chemistrie.co`). If the real handle differs, that link
404s — it's a derivation, not a verified URL.

### (12b) CORRECTED — misread the Do-not list, headline/follower count restored (commit `86582ea`)
User re-sent the identical mobile-notes/Do-not fragment with no other
comment. On inspection, the "Do not / Remove X / Remove Y" phrasing in
*this* brief is structurally different from the other two Do-not blocks in
this session's briefs (Trust Signals, Collection cards), which both used
"No X" phrasing — a form that reads as a prohibition regardless of the
header. "Remove X" under a "Do not" header instead reads as "do not remove
X" = keep it. **(12)'s original read had this backwards** — treated
"Remove 'Follow the Formulary.'" as an instruction to delete it, when it
meant preserve it. Asked the user directly rather than re-guess; confirmed:
keep both.

This created a genuine conflict with the same message's own "Final copy"
block, which explicitly set `Headline: Behind the formulas. Inside the
ritual.` — that and "Follow the Formulary." can't both be the section's H2.
Asked a second targeted question (replace headline vs. add as a secondary
line); user chose **full revert of the headline** — "Follow the Formulary."
is the H2 again, the approved eyebrow ("Follow Chemistrie") stands, and
"Behind the formulas. Inside the ritual." is dropped entirely, not kept as
a subline anywhere.

Reverted in `sections/instagram.liquid`: `heading` schema default back to
`Follow the<br/><em>Formulary.</em>`, `follower_count` setting restored
(`"21.4k"` default) and its `<em>· {{ follower_count }}</em>` markup back
next to the handle. Same in `templates/index.json`. **Everything else from
(12) stands** — curated block-based grid, removed fake per-tile
like/comment counts and video play/duration badges (not named in the
Do-not list, and structurally a different kind of fabrication — actual
video metadata on tiles that were never videos — so not reinstated), 4:5
crop ratio, no live-feed-embed escape hatch, images sourced via editable
block settings rather than hard-coded Liquid.

**Pattern worth remembering for the rest of this project:** this client's
briefs are not internally consistent in how they phrase "Do not" — some
use "No X" (prohibition), at least one uses bare action verbs ("Remove X")
that invert meaning under the "Do not" header. **Don't pattern-match
phrasing across different brief messages — parse each "Do not" block on
its own grammar**, and when a brief's own sections conflict (e.g. Final
copy vs. Do-not), stop and ask rather than pick one silently.

### (12c) FINAL — headline flip-flopped a third time, settled on Final Copy wording (commit `19dc301`)
Immediately after (12b) restored "Follow the Formulary." as the H2 (per the
user's explicit "replace headline (revert)" choice), user resent just the
"Final copy / Eyebrow: FOLLOW CHEMISTRIE / Headline: Behind the formulas.
Inside the ritual" fragment standalone, with no other text — a direct
reversal of the choice made one message earlier. Asked once more rather
than silently flip again (a second reversal in two turns warranted
confirming intent was real, not a stray re-paste); user confirmed **this**
is the real final answer. `heading` schema default and
`templates/index.json` both set to `"Behind the formulas. Inside the
ritual."` (H2, not HTML-formatted like the old Formulary heading was —
plain sentence, matches how it was specified). Eyebrow ("— Follow
Chemistrie —"), follower count ("21.4k"), and handle were **not** part of
this decision and were left untouched from (12b).

**If "Follow the Formulary." comes up again:** this project's actual
current/live headline is "Behind the formulas. Inside the ritual." as of
`19dc301` — the (12b) restore was superseded, not merged. Don't assume
(12b)'s memory entry reflects current state without checking this one.

## Build log — 2026-09-09 (9): Homepage card order forced to ritual sequence (commit `7fe9a1e`)
Live screenshot showed cards rendering Aura → Velvet → Silken → Cashmere,
i.e. the Shopify collection's own sort order. Client wants Velvet → Veil →
Aura → Silken → Cashmere (ritual order). Rather than depend on the merchant
dragging the collection into order (Shopify-side edits keep not sticking in
this project), `sections/shop.liquid` now computes the order itself: a
`launch_keys` list ('velvet,veil,aura,silken,cashmere') is matched against
the collection's products to build a comma-delimited `ordered` handle
string, then any remaining collection products are appended, and the card
loop iterates handles via `all_products[handle]` instead of
`collection.products` directly.

Details that matter if this is touched again:
- Handles are stored comma-wrapped (`,handle,`) and membership tested with
  `contains ,handle,` to avoid one handle matching another as a substring.
- `all_products` is capped at **20 lookups per template** by Shopify, so the
  card loop keeps `limit: 12`. Don't raise it near/over 20 without switching
  to a nested-loop + card-snippet approach instead.
- `{%- if product == blank -%}{%- continue -%}` guards a nil lookup.
- Unmapped products still append after the five, so scalability holds.

**Also confirmed this round:** the live `index.json` shop_jAJymM block DID
sync this time (heading/lede/CTA/collection all correct), so the JSON
desync in (4) was not a permanent condition — always verify rather than
assume either way. Aura's image also resolved itself with no code change
(was deploy/cache lag), and the (6) card hierarchy + product-data prices
render correctly live.

## Build log — 2026-09-09 (10): Collection card "Do not" constraints (commit `6b6e3c7`)
Client constraint list for the Collection section: cards may carousel on
mobile but all text must stay fully visible and tappable; no fictional
products; no Cleanse/Hydrate/Renew/Refine micro-labels; no truncated
descriptive paragraphs. All four applied:
- **Micro-labels removed** — `card_role` and its `.product__tag` badge
  deleted from `shop.liquid`, `.pcard__badge` from `main-collection.liquid`.
  The `.product__tag` / `.pcard__badge` CSS was left in place because
  **`ritual-shop.liquid` still renders those labels** — deliberately not
  touched, since on The Ritual page the step language is the page's whole
  premise. Flag it if the client wants labels gone sitewide.
- **Fictional products removed** — deleted the entire ~197-line
  `{% if section.settings.collection == blank %}` demo branch from
  `shop.liquid` (Renewal Serum, Vitamin C Elixir, Golden Oil, Velvet Cream,
  Clarifying Tonic, Eye Concentrate + their hand-drawn SVG bottles). It only
  rendered when no collection was picked, but that was a latent way for
  fictional names to reach the storefront. **The section now renders an
  empty rail if the collection setting is ever blank** — that's intended.
- **No truncation** — removed `-webkit-line-clamp: 2` from
  `.product__meta p` (`chemistrie.css`) and `.pcard__copy` (`pages.css`),
  and the `white-space: nowrap` + ellipsis on `.product__meta h3` (added
  back in the 2026-07-24 (18) build to stop 2-line names — no longer needed
  now that names are single words, and it directly violated this brief).
- **New `snippets/product-descriptor.liquid`** — metafield → approved
  launch copy → `product.type`, never a truncated description. Both
  `shop.liquid` and `main-collection.liquid` now capture it, which also
  killed the Collection page's `truncatewords: 20` fallback and its old
  long marketing sentences. Companion to
  `snippets/product-image-asset.liquid`; **descriptor edits go in that one
  file now.** `ritual-shop.liquid` still has its own long copy +
  `truncatewords: 20` — out of scope, not changed.
- Also updated `shop.liquid`'s `foot_link_label` schema default to "Explore
  the Collection" so a theme-editor reset can't restore "Explore the Full
  Collection".

## Build log — 2026-09-09 (11): Homepage Pharmacists section final copy (commit `381fd1a`)
Client final copy for the Pharmacists (Founders) section. Eyebrow
(`— The Pharmacists —`, hardcoded in `founders.liquid`), headline and CTA
label already matched exactly — only the body changed:
- `paragraph1` → "Before Chemistrie, Harin and Zach spent years as
  compounding pharmacists, where precision, formulation, and attention to
  detail were part of the job."
- `paragraph2` → "Chemistrie brings that same thoughtful approach to
  skincare."
- **`lede` cleared** ("Harin and Zach, compounding pharmacists, formulating
  for the women they love.") — it wasn't in the approved copy and repeated
  the body's opening. `.founders__lede`'s `<p>` was unguarded, so
  `founders.liquid` now wraps it in `{%- if section.settings.lede != blank -%}`
  to avoid an empty paragraph's margins leaving a visible gap.
- Schema defaults updated to match (and the `lede` default key omitted
  rather than set to `""`, per the blank-default validation gotcha at the
  top of this file), so a merchant "reset to default" can't bring back
  unapproved copy.

### (11b) Pharmacists CTA + mobile crop (commit `34dbca4`)
- **CTA destination verified, no change:** brief said "dedicated
  Pharmacists/About page if built, else mark TBD". `templates/page.the-pharmacists.json`
  exists, and `button_url` is already `/pages/the-pharmacists` — so it's
  built and correctly wired. Not TBD.
- **Mobile/tablet face crop:** `.founders__photo` frames are absolutely
  positioned percentage boxes inside `.founders__media`, whose phone
  `min-height` was only 260px — a 58%×60% box is then ~156px tall, so
  `object-fit: cover` on a portrait source cut into the faces. Raised the
  phone `min-height` to 380px and added
  `.founders__photo img { object-position: center 22%; }` in the ≤1024 and
  ≤640 blocks only. **Desktop base rule deliberately untouched** (faces
  render fine there at 680px media height) per this project's rule about
  never touching desktop for a mobile fix.
- Cascade note for next time: founders has **three** stacking blocks —
  ≤900 (line ~1333, next to the base rules), ≤1024 (~2559) and ≤640
  (~2642). Because ≤1024 is declared *after* ≤900, it wins at 900px wide.
  Check all three when changing founders responsive behaviour.

### (11c) Founders caption overlap + left-edge alignment (commit `25632f4`)
User asked to "fix the text alignments, make it same as desktop" for
mobile/tablet and sent screenshots. Two real bugs, found only from the
screenshots (no alignment rule actually differed — resist diagnosing this
one from CSS alone):
1. **Tablet: caption overlapped the body copy.** `.founders__caption` is
   `position: absolute; bottom: -32px`, i.e. deliberately hanging *below*
   `.founders__media`. On desktop it hangs into the left column's empty
   space harmlessly; once the layout stacks, that overflow lands directly
   on top of the body paragraphs. Fixed by pulling it inside the frame
   (`bottom: 0`) and reserving space beneath the photos —
   `padding-bottom: 44px` on tablet, and on phone by moving photo B up
   (`top: 34%`, was `bottom: 0`) so the full-width caption has ~76px of
   clear space at the bottom.
2. **Photos/caption not sharing the text's left edge.** Tablet had
   `.founders__media { max-width: 560px; margin: 0 auto }` — centring the
   photo frame so photo A and the caption were indented relative to the
   headline and body. Changed to `margin: 0` (kept the 560px cap so the
   photo boxes stay near-square and don't crop hard). Phone gets
   `max-width: none`.

**Why the caption is absolute at all:** `.founders__media` contains only
absolutely-positioned overlapping ovals, so a `position: static` caption
would render at the *top* of the frame, on top of the photos — don't
"fix" it that way. Reserve bottom space and keep it absolute.

**Deliberately NOT changed:** on mobile the stack is headline → photos →
body (`order: 1/2/3`), so the photos interrupt the headline-to-body flow
that is contiguous on desktop. Left as-is because on desktop the photos
span *both* text rows (`grid-row: 1 / span 2`), so stacking them between
the two is a faithful flattening. Flagged to the user as an option rather
than changed unasked.

### (11d) Founders photo block rebuilt for stacked layouts (commit `a175041`)
The (11c) offset tweaks weren't enough — user: "overall the images are
overlapped, the text looks not proper, check yourself once… fix for all
view". **Root cause: the whole photo block is the wrong mechanism below
desktop.** `.founders__photo--a/--b` are `position: absolute` boxes sized
in *percentages of `.founders__media`* and deliberately overlapped
(`top: 40%; left: 20%`), which only reads correctly inside desktop's tall
680px column. Stacked, it produces overlapping ovals, dead space to the
right, and a caption that has nowhere to go.

Replaced offset-nudging with a mechanism change in the ≤1024 block (so it
covers tablet *and* phone): `.founders__media` becomes
`position: static` + `display: grid; grid-template-columns: 1fr 1fr`,
`.founders__photo` becomes `position: static; width: 100%; aspect-ratio: 4/5`,
and `.founders__caption` becomes `position: static; grid-column: 1 / -1`.
Result: two equal ovals side by side filling the width, caption on its own
row, everything on the section's left edge. No absolute positioning below
1024px at all.

### (11e) Founders parallax was the overlap; dead animation selector (commit `3364fa6`)
User still saw image/text overlap after (11d), and asked that desktop
animations also run on mobile/tablet. Two JS bugs in `assets/chemistrie.js`:
1. **The overlap was the parallax, not the CSS.** Two ungated
   `gsap.to('.founders__photo--a/--b', { y: ∓40, scrub: true })` tweens run
   at every viewport. On desktop the photos are absolutely positioned in
   their own tall column so a ±40px drift is invisible; after (11d) they're
   **static grid items**, so the same drift drags photo A up into the
   headline and photo B down into the caption/body. Wrapped both in
   `gsap.matchMedia().add("(min-width: 1025px)", …)` — desktop keeps the
   effect, stacked layouts don't get shifted. **Lesson: when converting an
   absolutely-positioned element to normal flow, grep the JS for transforms
   on that selector** — CSS-only reasoning missed this twice.
2. **`.founders__copy` does not exist in the markup** — only in
   `chemistrie.css` (now deleted). `founders.liquid` renders
   `.founders__head` / `.founders__body`, so
   `gsap.from('.founders__copy > *', …)` matched nothing and the headline
   and body text **never animated on any device**, desktop included. Now
   targets `.founders__head > *, .founders__body > *` with `.founders` as
   the trigger.

**Audited for a global mobile animation gate — there is none.** GSAP +
ScrollTrigger initialise at all widths; Lenis is created with
`smoothTouch: false` (native touch scrolling, ScrollTrigger still fires).
The only intentional small-screen animation gates are the two pinned
horizontal sections — Actives (`isPhone` ≤700) and Ritual (`isPhone` ≤640)
— which fall back to native horizontal scroll on phones; per the 2026-07-24
(5)/(16) entries that fallback is a deliberate bug fix, **do not "restore"
pinning on phones**. Both still pin normally on tablet (768–1024), so
tablet already matches desktop there.

**Cascade cleanup this required — there are FOUR founders blocks, not
three** (the (11b) note undercounted): ≤900 (~1333), ≤1024 (~2559), ≤640
(~2653) and one inside the **≤700** block (~2833) that I had missed
entirely. Both ≤700 (`min-height: 360px`) and ≤640 (`min-height: 420px`,
plus `--a`/`--b` percentage overrides) are declared *after* ≤1024 and were
overriding the new grid — removed. Also deleted ≤900's now-dead
`min-height: 520px`. **Before editing founders responsive CSS, grep
`\.founders` across the whole file and check every match's line number
against the block you're editing** — last-declared wins, and this file
hides a founders rule inside an unrelated ≤700 block.

**Judgment call worth repeating:** when the client sends a "Final copy"
block listing only Eyebrow/Headline/Body/CTA, treat copy in that section
that isn't on the list as unapproved and clear it, rather than leaving it
alongside. They run strict copy compliance (they send "Do not" lists), so
stray old lines are the bigger risk.

**Still Shopify-side, still open:** Veil renders nowhere on the homepage
because it is not in `home-page-products` on the storefront. User believes
they added it, so the live suspicion is that the collection is an
**automated/smart collection** (products join by matching conditions, can't
be added by hand) — asked them to check the collection type and, if
automated, tag Veil to match. The ordering code above already has Veil's
slot ready; it renders the moment the product is in the collection.

## Build log — 2026-09-18: The Ritual Finder section
- Replaced the horizontal pinned Cleanse / Hydrate / Renew / Repeat steps module with the new Ritual Finder section.
- Moved `ritual_raGNG4` directly above `shop_jAJymM` (The Collection) in `templates/index.json` and `templates/page.home.json`.
- Applied final copy: Eyebrow: THE RITUAL FINDER, Headline: Your skin. Your ritual., Body: A considered routine starts with knowing what belongs in it. Answer a few questions and we'll help you build a Chemistrie ritual around your skin and your priorities., CTA: FIND YOUR RITUAL.
- Visuals: Dark forest-green treatment with ambient glow, apothecary corner accents, and fallback image `hero-ritual.jpg`.

## Build log — 2026-09-18: The Ingredient Index
- Updated Active Index to The Ingredient Index with final approved copy:
  - Eyebrow: THE INGREDIENT INDEX
  - Headline: What's inside, and why it's there.
  - Supporting copy: A closer look at select ingredients behind our formulas, each chosen for the role it plays.
- Replaced 12 placeholder active cards with the 6 verified cards:
  1. Sodium Hyaluronate: Hydration | Velvet & Veil
  2. Beta-Glucan: Skin Conditioning | Veil
  3. Panthenol: Moisture Support | Velvet
  4. Centella Asiatica: Skin Conditioning | Aura
  5. Copper Tripeptide-1: Peptide | Aura
  6. Pracaxi + Patauá Oils: Botanical Conditioning Oils | Silken
- Implemented card hierarchy: ingredient name -> category -> short explanation -> Found in product(s).
- Product names in "Found in" link to their respective product pages (`/products/velvet`, `/products/veil`, `/products/aura`, `/products/silken`).
- Preserved existing site typography and horizontal scroll interaction.


