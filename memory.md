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

## Build log — 2026-09-18: Chemistrie Ritual Finder Page Rebuild
- Replaced the educational "The Ritual" page with the customer-facing interactive Chemistrie Ritual Finder (`/pages/the-ritual`).
- Removed obsolete sections:
  - Statistic strip (`stat-bar`)
  - "Why This Order" section (`ritual-why`)
  - Static routine steps scroller (`ritual-steps`)
  - Static product carousel (`ritual-shop`)
  - Generic page CTA (`page-cta`)
- Updated `page-hero`:
  - Eyebrow: THE RITUAL FINDER
  - Heading: Your skin. Your ritual.
  - Deck: A considered routine starts with knowing what belongs in it. Answer a few questions and we'll help you build a Chemistrie ritual around your skin and your priorities.
  - CTA: START MY RITUAL (smooth-scrolls to `#ritual-finder-app`).
- Built new `sections/ritual-finder-app.liquid`:
  - 4-question luxury consultation (Skin Feel, Primary Goal, Routine Pace, Sensitivity).
  - One-question-at-a-time slide cards with progress bar and auto-advance.
  - Dynamic client-side recommendation engine generating personalized AM & PM regimens across Chemistrie's 5 launch products (`Velvet`, `Veil`, `Cashmere`, `Aura`, `Silken`).
  - Dynamic pricing summary and direct "Add Complete Ritual to Bag" button via Shopify cart API + "Retake Consultation" link.
- Replaced static routine FAQ with 3 focused Ritual Finder FAQs in `templates/page.the-ritual.json`.
- Added quiet luxury styling in `assets/pages.css` and interaction engine in `assets/chemistrie.js`.

## Build log — 2026-09-18 (2): Collection page rebuilt to the approved launch brief (commit `2695bbd`)
Large multi-section brief covering `templates/collection.json` and its 5
sections, plus two global elements (announcement bar, footer). **Session
notice mid-task: another agent was concurrently editing
`sections/ritual-finder-app.liquid`, `assets/chemistrie.js` and
`assets/pages.css`** (an in-progress, uncommitted diff was already present
on `ritual-finder-app.liquid` when this task started, plus a stray
`.kilo/worktrees/spectacular-devourer/` directory holding an older copy of
`main-collection.liquid` from a different tool/worktree). **Deliberately
did not touch any of those three files or that directory** — committed only
the 6 files this brief's sections actually live in, verified via `git
status --short` before every `git add`, and used exact filenames rather
than `git add -A`.

**01 Announcement bar** (`sections/header.liquid` + `config/settings_data.json`):
added `show_announcement` checkbox, default `false`. The $120 shipping
claim is removed from the code entirely (was previously baked into a
Liquid `default:` filter as a fallback even without a schema default) —
not just hidden — so switching the bar on later can't resurrect it. New
schema default and the live `settings_data.json` value both changed to
"Pharmacist-formulated skincare, thoughtfully made." Confirmed this is the
file Shopify actually reads for the header's static-section settings
(`templates/index.json`/`page.home.json` have no header entry — header is
rendered directly in `layout/theme.liquid`, config-driven).

**02 Collection hero** (`templates/collection.json` `page-hero` block):
eyebrow → "THE COLLECTION", both old five-product deck lines removed,
single new deck copy in their place. **`show_visual` set to `false`**
rather than picking a different stock photo for `hero_fallback_asset` —
the brief explicitly bans "developer-selected stock product imagery" as a
substitute, and every option here would have been exactly that. Flagged to
user: needs the real Collection hero asset from Chemistrie; until then the
hero renders text-only (no image, so no stock-photo risk).

**03 Statistics bar** (`sections/stat-bar.liquid` + `collection.json`):
added `show_bar` checkbox, default `false`. Also cleared all four blocks'
`number`/`label` values in the template (not just hidden the section) —
defense in depth, so an early/accidental toggle-on can't publish the named
unverified figures (6,000+ Women Served, 1–2 Days, ★4.96, 200/batch). The 4
empty block slots stay in place as the "preserve as optional module"
structure Chemistrie can fill in later.

**04 Product grid** (`sections/main-collection.liquid` — largest change):
deleted the entire `<aside class="col-side">` filter sidebar (availability
+ price filters, the whole `.col-layout` two-column grid) and the
`col-toolbar__count`/`col-side__count` "N formulas" displays — sort
dropdown kept, now alone in the toolbar. Grid went from `240px 1fr`
sidebar+content to a single full-width `.col-body`, gap widened
(`clamp(20px,2.4vw,32px)` → `clamp(24px,2.8vw,40px)`) rather than adding a
4th column, to read as "more generous" per the brief rather than smaller
cards — a judgment call, flagged to user. Card markup, CTA format ("View
{{ name }} →", CSS-uppercased to "VIEW NAME"), dynamic price, and the
already-correct `product.available` sold-out branch were untouched — all
already compliant with this brief's requirements from earlier work.
Removed `.col-callouts` (the two below-grid links) entirely — the brief
explicitly names both for removal and replaces them with the grid card
below, not a new below-grid link.

**05 Ritual Finder grid card** — new `snippets/ritual-finder-card.liquid`,
rendered via `{% render %}` inside the product loop. Position is a
**number setting** (`ritual_finder_position`, default 6) on
`main-collection.liquid`'s schema, not a hard-coded slot: the loop tracks
`forloop.index` and inserts the card the instant it matches, or appends it
after the loop if the position exceeds the current product count (handles
"fewer than 6 products" and "more than 6 products" without any code
change — this is the actual mechanism satisfying "repositionable... final
position does not need to be determined now"). Styled visibly dark/forest
(`.rfcard`) against the light `.pcard` product cards specifically so it
can't be mistaken for a sixth product, per the brief's explicit warning.
CTA destination `/pages/the-ritual` — **not a TBD**, since that page is now
the real built Ritual Finder experience (see the two entries above this
one) rather than the old educational Ritual page it used to be. Copy,
eyebrow and CTA label are all section settings, independently editable
from position.

**06 Ritual Finder CTA** (`collection.json` `page-cta` block): swapped
"Start with one, add as you're ready" two-button copy for the approved
single-CTA version. `button2_label`/`button2_url` cleared so
`{% render 'page-cta' %}`'s existing `if button2_label != blank` guard
hides the second button automatically — no template edit needed there,
the snippet already supported single- or dual-button use.

**07 Pre-footer statement**: unchanged — `closing-statement.liquid`'s
schema default already exactly matches the approved copy, `collection.json`
already used `settings: {}` (schema default), brief says Keep.

**08 Footer** (`sections/footer.liquid`): single change — removed
"Compounded with care in Houston." from the copyright line entirely
(brief: "Do not describe Chemistrie cosmetics as 'compounded.'"). Nav
columns (Shop/Discover/Help with exactly the approved links, all
`link_list`-editable), `brand_line` default, and Founders' Circle already
pointing at `/pages/founders-circle` (built and live) were **already
correct from the earlier footer rebuild** — nothing else needed changing.
Left the `.footer__seal` "Pharmacist-formulated · Houston, TX" badge alone
(judgment call, flagged to user): it doesn't use the word "compounded" and
isn't named in this brief's removal list, and "Keep: Overall footer layout
and styling" argues for preserving it as a brand mark rather than treating
it as the "redundant Houston positioning" the Do-not clause targets.

**No-em-dash rule**: this brief introduced a hard "no em dashes in
consumer-facing copy" requirement. Applied it to every new/edited eyebrow
on this page — dropped the sitewide "— X —" wrapping convention in favor
of plain caps ("THE COLLECTION", "THE RITUAL FINDER"), matching the
pattern the two most-recent 2026-09-18 builds (Ingredient Index, homepage
Ritual Finder) already established as current house style. **Did not
retroactively strip em dashes from older, unrelated sections** (e.g.
Trust Signals' "— Trust Signals —", Follow Chemistrie's "— Follow
Chemistrie —") — out of scope for a Collection-page brief; flagged as a
possible future sitewide pass if the client wants full compliance.

**Open items for the user, not fixable from code:**
- Collection hero asset — needs the real photo from Chemistrie (`show_visual: false` until then).
- Final product prices — already pull from live product data (`product.price | money`); the brief's own TBD list says confirming *approved* pricing is a Chemistrie/dev task, not a code gap.
- Ritual Finder destination — resolved to `/pages/the-ritual` (built); confirm this is the intended final URL before launch.
- Founders' Circle destination — resolved to `/pages/founders-circle` (built); same, confirm before launch.

### (2b) Hero placeholder reverted back on (commit `625a1ad`)
User: "use the older images that were already there." The `show_visual:
false` judgment call from (2) was wrong — turned back to `true` in
`templates/collection.json`'s `page-hero` settings. `hero_fallback_asset`
was never changed (still `stock-lineup.jpg`), so this single-field flip is
the whole fix: the pre-existing placeholder photo is visible again, same
as before this brief, until Chemistrie supplies the real Collection hero
asset. **Lesson: "do not substitute NEW stock imagery" ≠ "hide the
existing placeholder" — when a brief says retain a temporary placeholder,
default to keeping what's already there rather than removing it out of
caution.**


### (2c) Pre-footer statement given a real visual treatment (commit `374d392`)
User: "I want this part better looks simple" with a screenshot of the
plain closing-statement band (small sans-serif text, flat dark box). Note
this overrides the brief's own "07 Pre-Footer Statement: Keep current
visual treatment" line from (2) — direct user feedback in the moment beats
a generic brief instruction. Copy untouched (brief still says keep it).

`sections/closing-statement.liquid`: text switched from body sans
(15-18px) to `--ff-display` italic serif at 20-28px — matches how the site
already treats other single-line emphasis moments (testimonial
blockquotes, founders signature). Added a small tan accent mark above
the line (same character/color already used in `.founders__caption-mark`)
and roughly tripled the vertical padding so it reads as a considered
pause before the footer rather than a thin utility strip.

## Build log — 2026-09-18 (3): Ritual Finder results view redesigned for simplified layout (commit `f17e4e5`)
Restructured the results display from a two-column AM/PM card layout to a
streamlined single-column view where product recommendations display as compact
horizontal cards with clear AM/PM separation and individual routine pricing.

**Visual & structural changes:**
- Removed column headers describing "Morning Routine" and "Evening Routine" — replaced with simple "AM" and "PM" labels
- Product cards now render horizontally (flex-wrap) instead of in vertical lists
- Each product card shows thumbnail + product name + individual price + View link (description/why text hidden by default)
- AM routine shows its subtotal price below its product row; PM routine shows its subtotal
- Form card background changed from pure white (#ffffff) to theme cream (var(--c-cream)) for visual cohesion
- Overall layout simplified to reduce visual density on the results screen

**Responsive behavior:**
- Desktop (>900px): 4 products per row
- Tablet (≤900px): 3 products per row
- Mobile (≤600px): 2 products per row
- Products wrap naturally; no fixed-height containers that could clip on small screens

**What stays the same:**
- Dynamic recommendation engine (based on skin_feel/primary_goal/routine_pace/sensitivity answers)
- Product data (prices, images, URLs, roles)
- Action buttons (Add Complete Ritual to Bag, Retake Consultation, Explore All Formulas)
- Total ritual price calculation across all unique products

### (3b) Results recommendations moved to background page view (commit `1519b18`)
User: "the recommendations should be on the background page not on the card view."
Restructured recommendation display so results render on a separate full-page
background element (using absolute positioning behind the form card) rather than
swapping views inside the form card. Creates visual layer separation: form stays in
focus on top (z-10), recommendations visible behind (z-1).

Implementation:
- Moved `rf-slide--results` article out of `.ritual-finder-app__slides`
- Created new `.rf-results-page` element as direct child of `.ritual-finder-app__inner`
- Positioned absolutely (inset: 0) to fill available space and sit behind card
- `showResults()` now shows/hides `.rf-results-page` instead of swapping slides
- Retake button resets state and calls `renderStep()`, which hides results page and
  re-displays form card with fresh question flow
- Z-index layering: results (1), form card (10), ensures card stays interactive on top

### (3c) Ritual Finder simplified: close form, show results directly (commit `bb8f36f`)
User: "wtf is this... once i done with question just close the card and display
the recommendations on main page." Removed the layered overlay approach —
now the form card simply hides when consultation completes, and recommendations
display directly on the main page where the form was.

Flow:
1. User answers 4 questions → form card visible
2. Clicks final "Reveal My Custom Ritual" → `showResults()` hides card, shows results
3. Results render inline on the page (no absolute positioning)
4. Click "Retake Consultation" → `renderStep()` shows card, hides results, resets answers

Simplified styling: removed absolute positioning, z-index layering, and
background-page wrapper — results are just a normal block-level sibling to the
form card that gets hidden/shown together.

### (3d) Fix recommendation product cards not appearing (commit pending)
User: "the cards are not appearing please fix it".
Root cause:
- Previous commits added `.rf-results-page` outside the card while leaving the old `#rfResult` `<article>` inside `#rfSlides`.
- Both blocks had identical IDs (`#rfResultTitle`, `#rfResultRationale`, `#rfListAM`, `#rfListPM`, `#rfPriceAM`, `#rfPricePM`, `#rfTotalPrice`, `#rfBtnAddRitual`, `#rfBtnRetake`).
- When `showResults()` ran, `document.getElementById('rfListAM')` returned the element inside `#rfCard` (which had just been hidden with `card.style.display = "none"`).
- The product HTML was injected into the hidden element, while the visible `#rfResultsPage` stayed empty.
- Also, an orphaned `</div>` was present in the template.

Fix:
- Removed the old duplicate `<article class="rf-slide rf-slide--results" id="rfResult">` inside `#rfSlides` completely.
- Fixed the orphaned closing `</div>` tag.
- Scoped all DOM selectors in `showResults()` and button bindings to `resultsPage` directly (e.g. `resultsPage.querySelector("#rfListAM")`).
- Updated `.rf-item` in `assets/pages.css` to use proper flex and max-width sizing across desktop, tablet, and mobile so cards render crisply with zero clipping.

### (3e) Add Complete Ritual to Bag CTA wired to Shopify cart API (commit pending)
User: "add complete to ritual bag cta not working properly".
Root cause:
- Previously `#rfBtnAddRitual` only executed a dummy redirect `window.location.href = "/collections/all"`.
- It did not add the recommended products to the shopping cart, did not update the header bag counter, and did not open the cart drawer.

Fix:
- Dynamically populated `variantId` for all 5 products via Liquid (`all_products` + collections search fallback) and asynchronous `/products/{handle}.js` fallback.
- In `showResults()`, track all unique recommended products in `currentRitualHandles`.
- On clicking "Add Complete Ritual to Bag":
  - Button switches to loading state (`Adding Ritual to Bag...`, disabled).
  - Resolves variant IDs for all items in the user's recommended ritual.
  - Submits batch item add via Shopify's `/cart/add.js` API (`items: [{ id: vId, quantity: 1 }, ...]`).
  - Updates the header bag count (`.nav__bag-count`) using `/cart.js`.
  - Triggers the cart drawer (`[data-cart-open]` / `#cartDrawer`) so the customer sees their full ritual ready in the drawer.
  - Button displays confirmation feedback (`Complete Ritual in Bag ✓`) with luxury styling before smoothly resetting.

## Build log — 2026-09-21: Ritual Finder result cards enlarged, pill AM/PM badges (commit `d80b7b4`)
User screenshot showed products finally rendering correctly (the earlier
missing-DOM-query bug from 2026-09-18 was fixed by another session in the
interim — `e6aeeb0` and prior commits). Follow-up visual request: cards
should fill the full horizontal width of the section, images/text bigger,
AM/PM badges changed from circles to capsule/pill buttons.

`assets/pages.css` `.rf-item`: switched from `flex: 0 0 250px; max-width: 260px`
(fixed-width cards that left dead space after the last card in a row) to
`flex: 1 1 220px; max-width: none` — items now flex-grow to fill their row
evenly, whether AM has 3 products or PM has 4. Same pattern applied to the
1100px/768px/480px breakpoints (was percentage-based `flex: 0 0 calc(33%/50%...)`,
now flex-basis + grow so rows still stretch full-width at every size).

`.rf-item__thumb`: 116px fixed → `clamp(140px, 16vw, 200px)`.
Text bumped: `.rf-item__name` 18px → `clamp(20px,2vw,24px)`, `.rf-item__price`
14.5px → 17px, `.rf-item__step-tag` 10px → 12px.

`.rf-result__routine-label` (AM/PM badge): was a fixed 48×48 circle
(`border-radius: 50%`); changed to `padding: 11px 28px; min-width: 72px;
border-radius: 999px` — a pill that sizes to its own text instead of a
fixed square.

### Follow-up: image filled to card width, mobile fixed-px overrides removed (commit `85cc178`)
User screenshot showed the real cause of "lots of empty space": the
thumbnail was a fixed `clamp(140px,16vw,200px)` square, so once cards grew
wide to fill their row (previous commit), the small square sat centered
with big gutters left/right, disconnected from the text below it. Fixed
by making `.rf-item__thumb` `width: 100%; aspect-ratio: 1/1` — it now
spans the same edges as the card's padding, matching the text block width
exactly. **Also had to delete the 768px/480px breakpoints' fixed-pixel
thumb overrides** (`width: 120px`/`92px` etc, both `!important`) — those
would have won at mobile widths and reintroduced the identical small-square
bug there. Text sizes bumped again (name → clamp(26,2.6vw,32px), price →
21px) since the card now reads as a bigger, more premium tile.

### Follow-up: PM row not filling, white thumb background removed (commit `0431034`)
User: PM (4 products) had a gap on the right side that AM (3 products) didn't.
Root cause: the flex-grow approach filled the row correctly only when items
wrapped/didn't-wrap the same way for both counts; with a fixed flex-basis,
AM's 3 items and PM's 4 items could hit different wrap points in the same
container width, leaving a partially-filled last line un-stretched for one
of them.

**Fix — dynamic per-routine grid, not flex:** `.rf-result__product-list`
changed to `display: grid; grid-template-columns: repeat(var(--rf-cols, 3), 1fr)`.
`buildList()` in `sections/ritual-finder-app.liquid` now counts how many
items it actually rendered and calls
`container.style.setProperty('--rf-cols', count)` on that specific list
element. Each routine's row is therefore always an exact N-column grid
matching its own real product count — guaranteed full width, identical
padding, regardless of whether AM and PM have the same or different counts.
**Lesson: don't rely on flex-wrap to "just work" for two sibling rows with
different item counts — a fixed flex-basis can wrap them at different
points. A dynamic explicit column count sidesteps the whole class of bug.**

Mobile (`≤768px`/`≤480px`) forces a fixed `repeat(2, 1fr)` regardless of
`--rf-cols`, both as a legibility call and to avoid the "lone odd item
alone in a row" look at very narrow widths — grid's per-row fill trick
doesn't extend to catch that case, and 2-up is an accepted card-grid
pattern.

Also removed `.rf-item__thumb`'s `background: var(--c-paper)` (was
creating a visible off-white box behind each product photo) — set to
`transparent`, and thumb padding removed (`16px` → `0`) since the photos
already have breathing room baked into the source images.

### Follow-up: right-side-only gap on result rows was a container width bug (commit `e5dc011`)
User screenshots of AM and PM both showed the exact same problem: cards
filled maybe 65% of the section width with a large empty strip on the
right only (not symmetric — ruled out a centering/padding issue and
pointed at a hard max-width). Found it: `.rf-results-page` had
`max-width: 1240px; margin: 0;` (not `0 auto`) sitting inside its parent
`.ritual-finder-app__inner` (`max-width: 1320px`, centered) — so the
results page itself was flush-left and ~80px narrower than the section
around it, and every grid row (AM/PM) computed its columns against that
too-narrow box. The previous `--rf-cols` fix (0431034) was correct for
*even column distribution* but couldn't fix this, since the container
those columns filled was itself the wrong width. Removed the max-width
cap entirely (`.rf-results-page` now `max-width: none`, filling its
parent 100%) — rows now bound to the same edges as the rest of the
section.

## Build log — 2026-09-21: Pharmacists page rebuilt to credibility-first brief (commit `630d346`)
Full-page brief for `templates/page.the-pharmacists.json` (8 numbered
sections). Note: user's IDE had `page.the-ritual.json` open when this brief
arrived, but the brief content is unambiguously about the Pharmacists page —
didn't touch page.the-ritual.json (that page belongs to the other
concurrently-running agent's in-progress Ritual Finder work, per the
"don't interfere" instruction from earlier this session).

**Hero** (`page-hero`): eyebrow/heading/deck already matched the approved
copy exactly, untouched. `show_visual` set to `false` — the brief itself
flags the current `stock-lab.jpg` as looking like "a lab/vape cartridge"
and explicitly bans a developer-picked replacement photo ("Until supplied,
retain clean placeholders without using AI-generated people"). Same
judgment as the Collection hero situation, but this time the direction is
reversed: there the existing placeholder was fine to keep, here the brief
itself says the existing image is wrong, so hiding it (not swapping it for
another guess) is the correct read of "clean placeholder."

**Stat bar**: this is the first page in the project where a stat bar was
turned **on** rather than off — replaced 6,000+/ship-time/rating/batch-count
(unverifiable) with 3 blocks the brief calls out as real: "2" / Pharmacists,
"23 Years" / Combined Pharmacist Experience, "Pharmacist-Formulated" /
"Thoughtfully Selected & Refined". `show_bar: true` set specifically on
this template's stat-bar settings (global schema default from the
Collection-page work is still `false`, unaffected — each page's block
independently opts in). **Gotcha caught before commit:** first draft used
`&amp;` in the label field, but `label` is a Shopify `text` setting (not
`html`/`richtext`), which doesn't unescape entities — would have rendered
literal "&amp;" on the page. Fixed to a plain `&` character.

**Founder profiles**: only the `body` field changed on both blocks — new
approved bios verbatim. `eyebrow`, `role`, `name`, and the
no-photo-uploaded fallback (cycles through `founder-1/2/3.jpg`, confirmed
real stock photos already in `assets/`, not AI-generated — per
2026-07-24 memory entry) were already correct/compliant, left untouched.

**Origin story** (`pharmacists-credentials`): cut from 6 blocks to the
approved 3 (The Beginning / The Reunion / The Idea) — dropped the old
"Two Careers," "What Their Wives Actually Wanted," and "Why Chemistrie"
cards. The old card 6 had the Harin/Zach quote baked into its body text;
the brief keeps that quote only in the final CTA, so it's not duplicated
anywhere now. Section's grid CSS was already `repeat(3,1fr)` — 3 blocks
is literally its preset shape, no CSS change needed.

**New section — "why pharmacists matter"**: `sections/pharmacists-statement.liquid`,
inserted between credentials and the final CTA. Checked for an existing
fit first — `pharmacists-philosophy.liquid` exists in the theme but is
unused anywhere and built as a 4-icon value-grid, wrong shape for the
brief's single flowing paragraph (and a 1-block grid would leave 3 empty
grid cells, the same visual bug fixed in the Ritual Finder cards this
session). Built a small new section instead: eyebrow + heading + one
richtext paragraph, centered, reusing existing `--ff-display`/`--ff-body`/
`--c-forest`/`--c-ink-soft` tokens — no new visual system, matches "no
major redesign requested."

**Final CTA** (`page-cta`): `button_label`/`button_url` → "Find Your
Ritual" / `/pages/the-ritual` (was "Explore the Collection"); `button2_label`/
`button2_url` → "Explore the Collection" / `/collections/all` (was "Read a
Letter from the Founders" → `/pages/founders-circle`). Quote and dark-green
`page-cta` snippet treatment untouched — brief says keep both.

**Section 7 (global Houston/compounding corrections)**: already fully
satisfied by the earlier Collection-page work this session (announcement
bar off-by-default with no $120/Houston text, footer copyright's
"Compounded with care in Houston." removed) — verified, no new changes
needed. Did not touch the footer's `.footer__seal` "Pharmacist-formulated ·
Houston, TX" badge, same standing judgment call as before (not literally
"compounded," not named in either brief's removal list, "Keep: standard
legal/company info" argues for it staying).

### Follow-up: real hero photo supplied for Pharmacists page (commit `f63429e`)
User provided the compounding/formulation photo directly (hands mixing a
cream in a beaker on a lab bench) and asked to add it as the hero image —
overrides the earlier `show_visual:false` placeholder decision from the
main rebuild. Saved as `assets/hero-pharmacists.jpg` (following the
existing `hero-*.jpg` naming convention), `show_visual` set back to
`true`, `hero_fallback_asset` updated from `stock-lab.jpg` to
`hero-pharmacists.jpg`. Also flagged to the user separately: this is a
compounding-bench photo, not literally "Harin + Zach together" as the
original brief specified — if a portrait of the two founders is supplied
later, swap `hero_fallback_asset` again the same way.

### Follow-up: stat bar scroll-in animation added (commit `0c6da3f`)
User screenshot confirmed the new 3-stat credibility strip is live (sync
delay from the previous "can't see changes" report resolved itself — no
code fix was needed, just time/cache). Asked for it to animate in on
scroll. Added a `gsap.fromTo(".statbar__cell", ...)` block in
`assets/chemistrie.js` right after the Shop section's reveal block,
matching the exact pattern used throughout the file (fade + slide-up,
`power2.out`, staggered, `scrollTrigger: { trigger: ..., start: "top 80%",
once: true }`) rather than introducing a new animation style. `.statbar`
is the ScrollTrigger, `.statbar__cell` is the staggered target — applies
to every page using the stat-bar section, not just Pharmacists.

**Process note:** user rejected a `shopify theme list --store=...` CLI
call after supplying the store's Admin URL — did not retry or push for
CLI/store access again. Stick to the GitHub-push workflow unless the user
explicitly asks for direct CLI/theme access.

## Build log — 2026-09-21: Contact page rebuilt to remove custom-compounding claims (commit `92cb1dc`)
Brief covering `templates/page.contact.json` + hardcoded markup in
`sections/contact-main.liquid`. Core theme: this page previously described
Chemistrie as a custom-compounding-per-customer pharmacy (skin
consultation → pharmacist review → custom formula → compounded &
numbered), which the brief says is factually wrong for the business model
and must be scrubbed everywhere, including hardcoded strings the JSON
template doesn't control.

**Hero**: heading/layout kept, `deck` replaced (old copy promised "a real
compounding pharmacist reads every message, and picks up the phone" — a
banned personal-review/response promise). No image swap — brief says the
approved Contact hero asset is "supplied separately" and hasn't arrived,
so `hero-contact.jpg` stays rather than guessing at a replacement (same
judgment as the Collection hero: don't invent stock imagery, keep what's
already there until the real asset lands).

**Form**: subject `<option>` list is hardcoded HTML in
`contact-main.liquid` (not schema-driven) — replaced with the approved 7
options. **Also fixed the hardcoded success message** ("your message
reached the lab. A pharmacist will write back.") — this is markup, not a
JSON setting, so it wouldn't have been touched by editing the template
alone. Now a neutral receipt confirmation with no personal-review or
response-time promise.

**GoHighLevel + support-email routing — explicitly NOT implemented,
flagged instead.** Two separate reasons: (1) the brief itself says "tell
us what GoHighLevel access/permissions or form-field mapping you need
before implementation" — it's asking for a requirements list, not a blind
build, and I have no GHL credentials/API access to build or test against.
(2) Shopify's native `{% form 'contact' %}` (what this section already
uses) sends to whatever address is set in Shopify Admin → Settings →
Notifications — that's an Admin Settings value, not something theme
Liquid code can set. Changing the recipient to support@chemistrieco.com
needs someone with Admin access to update that setting directly; theme
code can't do it. **If this comes up again: the real GHL integration
would need either (a) a GHL inbound webhook URL to POST form data to via
a custom AJAX handler replacing the native `{% form %}`, or (b) a
Zapier/native Shopify-GHL app connecting the existing customer/contact
webhook — either way requires the client's GHL API key or webhook URL,
which should be asked for directly rather than guessed at.**

**Reach Us** (`contact-main` blocks): Email → support@chemistrieco.com,
added Customer Care / Monday–Friday, removed the Compounding Lab /
Houston, TX block entirely. Also updated this section's own schema field
default (`value: "hello@chemistrie.co"` → `"support@chemistrieco.com"`)
and its **preset** (which still listed Compounding Lab/Houston as one of
the two default blocks) — same "don't leave a reset-to-default trapdoor"
principle applied throughout this project.

**Stat bar**: `show_bar: false` (this page's stat-bar previously had
`"settings": {}`, which already inherited the global default of `false`
from the Collection-page work — so the bar was arguably already hidden
before this brief, but set it explicitly + cleared the 4 fake values for
defense in depth, matching every other page's pattern this session).

**Process steps**: swapped the compounding-pharmacy 4-step flow for the
real customer journey (Discover your ritual / Understand what you're
using / Build your routine / We're here when you need us). **FAQ**: all 4
entries replaced with the approved launch FAQ verbatim, including the
explicit "No, not custom-made per customer" answer that directly
contradicts the page's old premise.

**Compliance sweep run before commit** (grep across every file touched for
"custom-compound", "individually formulated", "pharmacist-review",
"hello@chemistrie.com", "Compounding Lab", "Houston", "free shipping",
"1-2 days", "refund", "reformulat") — came back clean except the schema
defaults/preset caught above, which were then fixed. **Worth repeating
this exact sweep pattern on any future "remove all mentions of X" brief.**

### Follow-up: Contact Steps redesigned as vertical scroll-progress list (commit `45dfd9d`)
User linked a Framer marketplace component (`Section-1-eqw28t.js`) as a
style reference for the 4-step "how it works" section, asking to match
its look while keeping the current palette/typography/text content.
**Fetched and inspected the component via the web-fetch agent** (the URL
resolves to a `.js` module, not a renderable page — the agent traced it
to the real bundle at `framerusercontent.com/modules/.../R2zubtsZ5.js` and
read the source directly rather than trying to screenshot it). Component
identity: `displayName="Progress Steps"` — a single-step horizontal card
(large step number left, thin vertical pill "connector" in the middle
that fills top-to-bottom via `onScrollTarget`-triggered scroll animation,
title+richtext on the right), meant to be duplicated per step into a
vertical stack — not a grid, not a carousel.

Rebuilt `sections/contact-steps.liquid`: `.csteps__grid` (4-column card
grid) → `.csteps__list` (vertical stack of horizontal rows). Each
`.cstep` is now `num | line | content` in a flex row. Deliberately
dropped the reference's purple fill color for `var(--c-forest)` (site's
existing accent), track color a soft forest tint matching the border
treatment already used elsewhere on this section — "same color palette"
instruction taken literally, not just "similar mood."

Animation in `assets/chemistrie.js`: added a **scrub** (not once-only)
ScrollTrigger per `.cstep__line-fill` — `scaleY: 0→1` as that specific
`.cstep` scrolls from `top 75%` to `bottom 55%` of viewport — this is the
continuous scroll-tied fill the reference actually does (its
`__framer__transformTrigger: "onScrollTarget"` mechanism), not a
one-time reveal. Kept a separate one-time stagger/fade-in on the `.cstep`
rows themselves for entrance, layered on top — matches the file's
existing pattern of combining a reveal-once animation with a
continuous scrub effect on the same elements (see product bottle float
next to the product-card reveal).

**Reusable approach for "make it look like [external URL/component]"
requests: don't guess from a thumbnail or the tool name — fetch and read
the actual source/markup via web-fetch when the target is inspectable
(a Framer/CodePen/component URL often resolves to readable JS/CSS even
without visual rendering), extract the concrete structural facts (layout
axis, what animates, what triggers it, spacing ratios), then reimplement
using the project's own design tokens rather than copying the reference's
literal colors/fonts when the user says to keep those the same.**

### Follow-up: Contact Steps background matched to supplied swatch (commit `725feba`)
User sent a flat color swatch screenshot and asked to match it. Sampled
the exact pixel value via PowerShell's `System.Drawing` (`Add-Type
-AssemblyName System.Drawing` + `Bitmap.GetPixel`, since Python/PIL isn't
installed in this environment) rather than eyeballing it — came back
`#F5EDD9`, an exact match for the existing `--c-paper` token. Changed
`.contact-steps` background from `var(--c-tan)` to `var(--c-paper)`; no
new color added to the palette. **Reusable technique: when a user pastes
a flat color-swatch screenshot and wants a pixel-accurate match, sample
it directly (PowerShell System.Drawing on this Windows box) instead of
guessing from the rendered thumbnail — check the result against existing
CSS custom properties before assuming a new color is needed.**

Also confirmed via direct file dump that the Contact Steps redesign
(commit 45dfd9d) never dropped any content — all 4 step titles/bodies
matched the user's screenshot verbatim. The earlier "where is it" report
turned out to be the scroll-based progress-line fill (steps not yet
scrolled to show a lighter/unfilled connector) being misread as missing
content, not an actual bug — confirmed together with the user, no design
change needed for that part.

### Follow-up: another swatch match + entrance distance increase (commit `fdd93a8`)
User's IDE had `page.the-ritual.json` selected/open at this point (a file
belonging to the other agent's concurrent work), but the message
("use this color for that bg and start the cards slightly from more
above") read as a direct continuation of the Contact Steps thread — kept
treating "that bg"/"the cards" as `.contact-steps`/`.cstep`, not the
Ritual page, and did not touch page.the-ritual.json or its sections.

Sampled the new swatch the same way as before (PowerShell
`System.Drawing.Bitmap.GetPixel`) — `#E6D9C8`, exact match for
`--c-cream-2`. Applied as `.contact-steps` background (was `--c-paper`
from the previous message).

**"start the cards slightly from more above"** — read as the GSAP
entrance animation's starting Y-offset, not a padding/layout change:
`.cstep`'s `gsap.fromTo` in `assets/chemistrie.js` had `y: 36` (added in
commit 45dfd9d); increased to `y: 70` so cards travel further from above
before settling into place on scroll-reveal. Flagged as a judgment call
in the response — genuinely ambiguous phrasing, could also have meant
"more top padding/spacing above the card row" instead of an animation
change; correct if wrong.

## Build log — 2026-09-21: Pillars (homepage Trust Signals) spacing + lede width fix (commit `3cd22b1`)
Screenshot showed the "Pharmacist-Formulated" pillar card (01/03) with a
lot of empty vertical space and its lede text wrapping across 4 short
lines. This is the homepage's `pillars.liquid`/`sections/pillars.liquid`
sticky-stack section, in `assets/chemistrie.css` (not `pages.css` — this
is one of the older core-site sections, styled in the main stylesheet).

**Root cause of the empty space:** `.pillar { min-height: 90vh; }` (86vh
at ≤1024px) — the card is sized to nearly a full viewport regardless of
how much text it holds, and `.pillar__body { justify-content: center }`
vertically centers the (short) title+lede block inside that oversized
box, producing large gaps above/below. Reduced to 64vh / 62vh at the two
breakpoints. **Checked first that this wouldn't break the sticky-stack
scroll-pin effect** (`assets/chemistrie.js` ~line 119-173): the
ScrollTrigger points are all relative (`"top 90%"`, `"top 10%"`, etc.)
against each `.pillar`'s own or the next sibling's rect, not a fixed
pixel/vh assumption baked into JS — confirmed safe to resize purely in
CSS. Left the ≤700px breakpoint alone (`min-height: auto !important` —
sticky stacking is already disabled on phones there, so no dead-space
issue exists at that width).

**Root cause of the 4-line wrap:** `.pillar__lede { max-width: 30ch; }` —
widened to `52ch`. The three pillars' lede copy varies 100-155 characters
long, so 52ch won't hit exactly 2 lines for every one of them, but gets
close across all three (down from 4-5 lines). No single CSS width value
can guarantee an exact line count when the underlying text lengths differ
this much — flagged as a known limitation, not silently claimed as exact.

### Follow-up: image size restored, side padding reduced instead of height (commit `b4f3db4`)
User: "put the image size it was i wantes the sides of the card reduced" —
the previous min-height cut (90vh→64vh) had a side effect I didn't
predict: `.pillar` is `display:grid; align-items:stretch`, so the image
column (`.pillar__visual`, 320px fixed width) stretches to fill the
row's height — shrinking the row height shrank the image too. **Lesson:
in a stretch-aligned grid, changing the row/container height changes
every stretched child's size, including ones (like an image) that
weren't the actual target.**

Reverted `min-height` to the original 90vh/86vh. The real ask — "sides
... reduced" — was horizontal padding, not vertical height. Split
`.pillar`'s single `padding` shorthand into `padding-block` (kept at the
original clamp value) and `padding-inline` (new, reduced: `clamp(26px,
3.4vw, 48px)`, `24px` at ≤1024px) so the card's left/right inset shrinks
without touching row height or the image size at all.

### Follow-up: cards resized to wrap the image, not a fixed 90vh (commit `16eddff`)
User: "change the cards dimension such that they are only a little taller
wider than image card for all 3 cards... it creates lot of empty and
unused spaces." Root cause was always `.pillar { min-height: 90vh }` (the
same property touched twice before this in the session) combined with
`.pillar__crest--fullimage { height: 100% }` — the image was being
force-stretched to fill whatever height the card happened to be, so
shrinking the card shrank the image (previous commit's problem), and
restoring the card height brought back the empty space (this commit's
problem). **The actual fix was to stop coupling image size to card size
at all**, not to keep tuning one fixed-height number back and forth.

Removed `min-height: 90vh`/`86vh` entirely. Gave
`.pillar__crest--fullimage` an intrinsic `aspect-ratio: 4/5; height: auto`
instead of `height: 100%`, so the image now has its own natural size
(full 320px column width, portrait ratio) independent of the row. Changed
`.pillar__visual--full`'s `align-items` from `stretch` to `center` to
match. Card height now falls out naturally from its tallest column's
real content — in practice the image — instead of a fixed viewport
fraction, so the card wraps tightly around it as asked.

**Lesson for next time a "card is too tall for its content" complaint
comes up: check whether a child element's size is coupled to the
parent's via `height: 100%` + `align-items: stretch` before reaching for
`min-height` tuning — shrinking/growing the fixed height will drag the
coupled child along with it, which is what happened across the last three
follow-ups on this exact section.**

### Follow-up: last Pillars change reverted (commit `a6a5d35`)
User: "undo it" — reverted `16eddff` (the image-driven card sizing:
removed min-height, gave the image `aspect-ratio: 4/5`) via
`git revert --no-edit 16eddff`, confirmed with `git diff b4f3db4 HEAD --
assets/chemistrie.css` returning empty (exact match to the prior commit).
Pillars section is back to fixed `min-height: 90vh`/`86vh` with the image
stretched to `height: 100%` of that row — i.e. back to the state right
before the "size cards around the image" attempt, side-padding reduction
from `b4f3db4` and the lede-width/height-reduction from `3cd22b1` still
stand (not part of what was undone). If asked to revisit the empty-space
complaint again, don't just re-apply `16eddff` — ask what specifically
was wrong with that version first, since three consecutive attempts on
this exact section (height cut, image restore, image-decoupled sizing)
each got undone or corrected by the next message.

### Follow-up: re-applied with measured aspect-ratio, "don't change image size" resolved (commit `414877e`)
User sent a red-outline screenshot showing the target card size (tight
around title+lede+image), then mid-turn added "but dont change the
images size" — a real technical tension with the previous revert: the
image was `height: 100%` of `.pillar` (min-height 90vh), so shrinking the
card was IMPOSSIBLE without also shrinking the image *unless* the image
gets its own intrinsic size. Worked out why: percentage `height` needs a
definite ancestor height to resolve against — once `.pillar`'s
`min-height` is gone, `height:100%` on the image has nothing to resolve
against and would collapse toward 0, not "stay the same." There's no CSS
way to honor "shrink the card, don't touch the image" literally when
they start out height-coupled like this — one of them has to change.

**Resolved the ambiguity by measuring instead of guessing**: sampled the
user's own reference screenshot's pixel dimensions (`System.Drawing`,
Full image 792×345, product-photo box ≈165×265px within it) →
height:width ≈ 1.6, i.e. `aspect-ratio: 5/8` (0.625) — nearly exact
match. This replaced the previous `4/5` (0.8) guess from `16eddff`, which
was almost certainly too short/squat compared to what the user actually
pictured — likely why that attempt got reverted. **Lesson: when a
mockup/reference screenshot is available and a size/ratio decision is
being made, measure its actual proportions (PowerShell
`System.Drawing.Image.FromFile` + pixel math) instead of eyeballing a
round-number guess — this project's had at least two incidents now where
an eyeballed value was rejected and a measured one wasn't.**

Same `min-height: 90vh/86vh` removal as `16eddff` (reverted in `a6a5d35`),
plus `.pillar__visual--full`'s `align-items: stretch → center`. Explained
the height:100%-requires-definite-ancestor mechanic directly in the
commit message and to the user, rather than silently picking a ratio
again with no explanation if it turned out wrong a second time.

## Build log — 2026-09-21: Removed homepage hero's decorative grid lines (commit `4bb5628`)
User sent a tall narrow crop of the dark hero background showing a faint
vertical line. Traced it to `.hero__grid-lines` in `sections/hero.liquid`
(line ~7) — 4 empty `<span>` columns with `border-right: 1px solid
rgba(255,255,255,.05)`, purely decorative (`aria-hidden`), rendered
full-height across `.hero__bg`. No JS hook referenced it. Removed the
markup entirely plus its two CSS rules in `chemistrie.css` (the base
`.hero__grid-lines`/`span` rules, and its entry in the ≤700px
`display:none` mobile-hide list) rather than just hiding it, since it had
no other purpose.

## Build log — 2026-09-21: Homepage Shop + Ritual Finder cards standardized on .pcard (commit `1bdcffd`)
User sent a screenshot of an Aura product card and asked for "such card"
on the homepage Collection section and the Ritual Finder recommendation
cards. Recognized it immediately as the existing `.pcard` component
(already used on the Collection page, `main-collection.liquid`) — square
image, wishlist heart, name+price row, descriptor paragraph, full-width
dark "View X →" button — rather than a new design to build.

**Homepage `sections/shop.liquid`**: was running its own older card
system (`.product`/`.product__media`/`.product__cta` as a text link, an
SVG placeholder-bottle fallback for products with no image). Swapped the
card markup to `.pcard` structure, reusing the same `product-descriptor`
and `product-image-asset` snippets Collection already uses — same
component, same data source, zero duplicated styling logic. **Checked
first** whether `.product` classes were used elsewhere before touching
any shared CSS (`grep` across sections/snippets): `product-details.liquid`
still references them and `.pcard`/`.product` share a `position: relative`
rule in `shop-ux.css` (`.pcard, .product { position: relative; }`,
comment: "ensure card can anchor the heart") — so left the old
`.product`/`.product__*` CSS in `chemistrie.css` completely untouched,
only removed the section-local `.product__link`/`.product__photo` rules
that were specific to `shop.liquid`'s own stylesheet block (dead once the
markup changed). Kept the existing horizontal scroll-rail behavior
(`.shop__rail`, scroll-snap) — added one scoped rule
(`.shop__rail .pcard { flex: 0 0 300px; ... }`) rather than reinventing
the rail.

**Ritual Finder recommendation cards** (`sections/ritual-finder-app.liquid`,
the AM/PM product cards worked on repeatedly this session): `buildList()`
now generates `.pcard` markup instead of the bespoke `.rf-item` layout —
including a working wishlist heart button (`data-wishlist-toggle`, same
global JS hook every other `.pcard` uses; the products JS object already
had handle/title/price/image/url for this). Used `p.stepSubtitle` (e.g.
"Conditioning Cleanser" for Velvet) as the descriptor line — matches the
same slot `product-descriptor.liquid` fills elsewhere, though **noted a
pre-existing minor copy mismatch**: that snippet says "Foaming Facial
Cleanser" for Velvet, this JS object says "Conditioning Cleanser" —
different phrasing for the same product, not introduced by this change,
not fixed (out of scope, flagging for whoever reconciles product copy
next).

Removed the entire `.rf-item*` CSS block (~115 lines across the base
rules and two mobile breakpoints) from `assets/pages.css` — fully dead
once the markup stopped using those classes. The `--rf-cols` dynamic
grid-column mechanism from `0431034` needed no changes — it targets
`.rf-result__product-list`'s direct children generically, so it applies
to `.pcard` exactly as it did to `.rf-item`.

**Validation note**: `node -c` can't directly syntax-check this file's
embedded `<script>` block because it contains raw Liquid tags (`{{ ... }}`)
mixed into the JS — false positive "Unexpected token '{'" isn't a real
error. Extracted the script and ran a manual paren/brace/bracket balance
count instead (all nets to 0) — that's the right validation method for
this specific file going forward, not `node -c`.

## Build log — 2026-09-22: Trust Signals (Pillars) redesigned as a tabs card (commit `b49c9f4`)
User linked a Framer "Tabs card" component (`Tabs-card-f58s7K.js@...`) as
the target redesign for the homepage Pillars/Trust Signals section, with
the constraint: keep image size, content text, font, and color palette
as-is — only the interaction/layout changes.

**Fetched the component's actual compiled bundle** (same method as the
earlier "Progress Steps" investigation: the given URL is a stub re-export,
resolved via WebFetch to the real bundle at
`framerusercontent.com/modules/vybaxS7cvvVyBVVq16nZ/.../qs9tZHZbw.js`) —
confirmed structure: vertical tab list (4 rows, 72px each) beside a
content panel that swaps on click, each panel = image + title +
description, spring transition on switch. Used this to build a
same-spirit (not pixel-identical) tabs UI rather than guessing.

**What changed**: the old sticky-stack scroll effect (3 `.pillar`
articles, `position: sticky`, each scaling/fading out as the next
scrolled over it) → a click-driven tabs card. `.pillars__tabcard` wraps
`.pillars__tablist` (numbered clickable tab buttons, one per pillar) and
`.pillars__panels` (one `.pillars__panel` per pillar, `.is-active` shows
it, plain JS click handler swaps which one).

**What was deliberately kept untouched** to satisfy the "keep as-is"
constraint: the entire image-rendering path (`pillar__crest--fullimage`
full-bleed photo + aspect-ratio, circle-badge fallback with
`crest_mod`/`mono_mod` per-pillar variants) — reused verbatim inside each
new panel; all title/lede/list copy — same `section.blocks` data, no
content edits; fonts — same `--ff-display`/`--ff-body` throughout; color
palette — reused the exact same `pillar--trust`/`pillar--luxury`/
`pillar--warmth` background classes as panel modifiers, same forest/tan/
cream tokens on the new tab list.

**Cleanup discipline**: went through every `.pillar`/`.pillar__index`/
`.pillar__num`/`.pillar__count`/`.pillars__stack` reference across
`chemistrie.css` (5 separate locations: the base rule, and dead rules
inside four different mobile breakpoints built up over many past sessions
tuning the sticky-stack effect) and `chemistrie.js` (the entire
sticky-stacking + parallax ScrollTrigger block, ~55 lines) — removed only
what was actually dead, left every rule still targeting a class present
in the new markup (`pillar__title`/`lede`/`list`/`visual`/`crest`/`mono`
sizing overrides at each breakpoint) completely alone. Also fixed one
now-stale code comment elsewhere in `chemistrie.js` that referenced
"pillars sticky-stack" as a live example.

**This is the section that had 3+ rounds of height/image-coupling fixes
earlier this session (16eddff → a6a5d35 revert → 414877e re-apply)** —
all of that CSS (the aspect-ratio: 5/8 image sizing, the measured
proportions) carried forward unchanged into the new panel structure,
since "keep image size as it is" meant exactly that state, not the
original pre-session sticky-stack sizing.

## Build log — 2026-09-22: Homepage Brand Story expanded to three-beat timeline (commit `133c759`)
Brief for `sections/story.liquid` (homepage timeline, id `story_88GJLB` in
`templates/index.json`): expand from 2 chapters to 3 (The Meeting → The
Idea → Chemistrie), with approved copy and specific asset guidance per
beat.

**Checked the JS/CSS infrastructure before touching markup**: the
rail-dot progress indicator and per-chapter scroll-reveal animations in
`assets/chemistrie.js` (`$$(".story__chapter")`, `chapters.length` used
generically for the progress fraction, `.story__chapter--reverse` class
read dynamically per element) already scale to any chapter count with
zero hardcoding — confirmed no JS changes were needed to add a third
chapter, unlike the Pillars sticky-stack removal earlier this session
which needed real JS surgery.

**Per-chapter images**: replaced the old two hardcoded stock photos
(`stock-lab.jpg`/`stock-product.jpg`) with `image_picker` +
asset-filename-fallback pairs per chapter (same pattern as
`page-hero.liquid`'s `hero_image`/`hero_fallback_asset`):
- Ch. I (2011, Meeting): `founder-1.jpg` — brief calls this "the first of
  the three founder photos shared," which matches the already-established
  real (non-AI) founder photo already used elsewhere in the project.
- Ch. II (Idea): **left with no image at all** — brief explicitly says
  this is PENDING an authentic Japan/travel photo and bans a fabricated/
  stock substitute; the section already renders cleanly with the photo
  column omitted when both image fields are blank (confirmed via the
  `{%- if ...image != blank or ...image_asset != blank -%}` guard), so
  this is the correct "wait for the real asset" state, not a bug.
- Ch. III (Chemistrie): `pillar-designed-together.png` — reused the
  already-approved brand photography from the Pillars section rather
  than picking new stock, matching "polished current Chemistrie
  product/brand photography."

**Concurrent-work note**: `sections/pillars.liquid` and
`assets/chemistrie.js` had unrelated uncommitted changes on disk from the
other agent's Pillars redesign (a story-carousel with prev/next nav,
replacing my earlier tabs-card build from `b49c9f4`) at the time of this
commit. Confirmed via `git status` before staging and added only
`sections/story.liquid` + `templates/index.json` by exact filename — left
both of the other agent's files completely untouched and unstaged.

### Follow-up: timeline "not looking nice" traced to Chapter II's missing photo (commit `b978632`)
User gave no screenshot, just "the timeline is not looking nice design it
properly." Re-read the section's own CSS before guessing: `.story__chapter`
is a strict 3-column grid (text | rail-dot meta | photo), and Chapter II
was rendering with the `.story__chapter-photo` element omitted entirely
(the `{% if image != blank %}` guard from the previous commit,
`133c759`) since that chapter deliberately has no photo yet. That leaves
one of the three grid cells empty only on the middle chapter — breaking
the alternating left-right-left rhythm that Chapters I and III both keep,
which is almost certainly what read as "not nice" without needing a
screenshot to diagnose.

Fixed by always rendering `.story__chapter-photo` for Chapter II, using
a neutral gradient placeholder (soft tan-to-cream gradient, faint italic
"II" watermark) at the exact same size/shadow footprint as a real photo,
only when both image fields are blank. **Re-read my own earlier
interpretation of the brief and corrected it**: I'd read "otherwise use
an approved neutral placeholder until supplied" as "render nothing,"
but a placeholder that isn't a placeholder isn't actually following that
line — a full gap wasn't the "neutral placeholder" the brief called for.

Did not touch the broader timeline design (right-aligned body text on
alternating sides, thin center rail, photo aspect-ratio) — that's a
deliberate, coherent existing pattern, and with no screenshot pointing at
a specific problem beyond "not nice," further changes would've been
guessing. Told the user to send a screenshot if something else is still
off after this fix, rather than redesigning the whole section blind.

## Build log — 2026-09-22: Homepage Journal preview built, newsletter branding conflict fixed (commit `c55badc`)
Brief: "the journal on home page" wanted Eyebrow "THE JOURNAL" / Headline
"Notes on skin, formulation, and the ritual behind it.", a 3-article grid
(latest or manually featured), real article imagery, content-driven (no
fake posts to fill the grid), each card → its article, section CTA →
Journal landing page, and explicitly: don't call this "The Formulary
Journal" or "Letters from the Bench."

**Key discovery before building anything**: the homepage had no article
grid at all. The section that LOOKED like it should be "the Journal"
(`sections/newsletter-cta.liquid`, eyebrow "— Letters from the Bench —",
heading "The Formulary Journal.") is actually just an email-signup CTA —
zero article content, just a subscribe form. So the "Do not call this X"
instruction wasn't about renaming an existing article section; it was
flagging that the WRONG section (a newsletter form) had claimed the
Journal's name. Fixed both problems as genuinely separate items.

**New `sections/journal-preview.liquid`** (inserted right after
`story_88GJLB` in `templates/index.json`'s order, per "after timeline"):
- Resolves `blogs.journal`, falling back to the first blog with any
  articles — same pattern `footer.liquid` already uses for its Journal
  nav link, kept consistent rather than inventing a new resolution
  method.
- **Renders nothing at all if the blog has zero articles** — direct
  implementation of "do not create fake permanent blog posts just to
  fill the grid." No empty-state UI shown on the homepage either; the
  section just doesn't exist until there's real content.
- Supports up to 3 optional "Featured article" blocks (native Shopify
  `article` picker setting) for manual curation; if none are set, falls
  back to the 3 latest articles automatically — satisfies "latest or
  manually featured" without needing two separate section types.
- New `snippets/journal-preview-card.liquid` holds one card's markup,
  shared by both the featured and latest-articles code paths.

**Reused, not reinvented**: found `sections/journal-grid.liquid`
(Journal landing page) already had a proven `.jcard` component — same
image/category-tag/title/meta/excerpt/read-link structure the brief
describes. Copied that markup and its CSS into the new homepage section
rather than designing a new card from scratch, for visual consistency
between the two places articles appear. **Deliberately duplicated the
CSS rather than assuming it's shared** — `{% stylesheet %}` blocks are
section-scoped in this theme's actual behavior (confirmed by this
project's own pattern of putting cross-page shared components like
`.pcard` in `pages.css`, a real separate asset file, rather than relying
on any one section's stylesheet leaking to other pages) — didn't want to
gamble on unstyled cards.

**Branding fix**: `newsletter-cta.liquid`'s eyebrow/heading defaults
changed from "— Letters from the Bench —" / "The Formulary Journal." to
"Join the List" / "Occasional notes, worth your inbox." — both in the
section's own schema defaults and in `templates/index.json`'s live
override (which had the same banned copy hardcoded, would have kept
showing it regardless of the schema change). Left the newsletter form's
`sub` text and functionality completely untouched — only the name/
framing was the problem, not the feature itself.

**Flagged, not fixed (out of scope for a homepage brief)**:
`journal-grid.liquid` (the Journal landing page itself) has its own
separate "— Letters from the bench —" eyebrow on its embedded newsletter
capture block (`.jgrid__capture`) — same naming pattern, different page.
Noted to the user but not touched, since this brief was scoped to the
homepage specifically.

**Process note**: `sections/pillars.liquid`, `assets/chemistrie.js`, and
a new `preview_chain.html` all showed as modified/untracked from the
other agent's concurrent Pillars-carousel work at commit time — checked
via `git status` and staged only the 4 files this task actually touched,
by exact name.

## Build log — 2026-09-22: Trust Signals redesigned as automated Testimonial Chain
User requested redesigning the Trust Signals section to match Framer's Testimonial Chain component with full automation, while strictly preserving text content, fonts, color theme, and images without any extra filler content.

**What changed**:
- Replaced the tabbed card in `sections/pillars.liquid` with the layered Testimonial Chain layout (`.pillars--chain`, `.pchain-card`).
- Active center card features the pillar title, lede, and optional items on the left, and the portrait photo on the right.
- Left and right flanking pills show the portrait photos of adjacent pillars with clean frames and interactive click-to-activate.
- Added automated 5s cycling with animated progress pill indicators in `assets/chemistrie.js` (`initPillarsChain`), pause-on-hover, and mobile touch swiping.
- Strictly preserved all existing copy (titles, ledes, list items, eyebrow, heading, CTA), typography tokens, and image assets without any extra injected content.


## Build log — 2026-09-22: Founders' Circle CTA (commit `381ed0a`)
Brief: "create founders circle just above the footer on home page" -
recognized this maps onto the section that was already last-before-footer
on the homepage (`newsletter_cta_bQgTWH`, just renamed to generic "Join
the List" the turn before this one) rather than needing a brand-new
section — rebuilt its content/purpose in place instead of adding a
redundant second email-capture block right next to it.

**Copy**: exact approved text (Eyebrow "THE FOUNDERS' CIRCLE", "Come
closer.", early-access/first-looks/pharmacist-notes body, "JOIN THE
CIRCLE" button) — verified no discount language anywhere, per the
brief's explicit ban.

**CMS-editability gap closed**: button label and the success message
were both hardcoded strings before this (`<span>Subscribe</span>`, and a
fixed "the first letter arrives at the start of next month" message) —
both are now schema settings (`cta_label`, `success_message`), directly
satisfying "copy, CTA, success message, and offer should be
CMS-editable."

**Consent/privacy**: added a `consent_text` setting rendered under the
form, with the store's real Privacy Policy link (`shop.privacy_policy.url`)
appended automatically when set — same resolution pattern already used
in `footer.liquid`, kept consistent rather than inventing new logic.

**CRM/automation — explicitly NOT wired, flagged instead**: same
reasoning as the Contact page's GoHighLevel ask. The form still only
reaches Shopify's native customer list via `{% form 'customer' %}` (no
external CRM push) — changed the tag from generic `newsletter` to
`founders-circle` so submissions are at least distinguishable once a real
integration happens, but did not attempt to guess at CRM credentials or
webhook endpoints. If this comes up again: need the same thing as the
GHL ask before — an inbound webhook URL or API access, asked for
directly.

**Naming overlap flagged, not resolved**: `/pages/founders-circle`
already exists as a much more elaborate "invite-only, request an
invitation" page (`templates/page.founders-circle.json` — also still has
the banned 6,000+/ship-time/rating/batch-count stat-bar numbers,
untouched, out of scope for this brief). This new homepage CTA is a
lighter, simpler email-capture entry point that happens to share the
"Founders' Circle" name — did not link one to the other or try to
reconcile the two framings, since the brief didn't ask for that and they
serve different purposes (broad email capture vs. an exclusive
invitation narrative).

### Follow-up: Founders' Circle form redesigned, collapsed input fixed (commit `d1eb14e`)
User screenshot showed the form badly broken: the email input rendered
as just "you@", the "YOUR EMAIL" label wrapped to two lines, and the
consent text was crammed inline to the right of the button inside the
pill. Asked to redesign the section keeping content/font/colours.

**Root cause**: `.cta__form` in `chemistrie.css` is a single pill
(`display: flex; border-radius: 999px; padding: 6px`) designed for
exactly TWO flex children — `.cta__field` and the button. The consent
paragraph I added the turn before (`381ed0a`) became a third flex child;
its `flex-basis: 100%` did nothing because the pill has no
`flex-wrap: wrap`, so it just stole width from the input instead of
wrapping below. **Lesson: before adding a child to an existing flex
container, check whether it's sized/structured for a fixed number of
children — `flex-basis: 100%` only wraps if the parent wraps.**

**Fix/redesign**: `.cta__form` is now a centered flex COLUMN, and only
the input+button pair keeps the pill (`.cta__form-row`). Consent sits
below the pill, error line above it, success message still overlays but
now only over the row. Added focus-within (tan border) state, 16px input
text, and replaced the cramped floating "YOUR EMAIL" label with a
`placeholder="Your email address"` plus a `.visually-hidden` label for
screen readers (that class is global, `chemistrie.css:58` — verified
before using).

**Scoping**: all new rules live in the section's own `{% stylesheet %}`
under a new `.cta--circle` modifier, NOT in `chemistrie.css`. Confirmed
first via grep that `.cta__form`/`.cta__field`/`.cta__sent` are used by
this section only — but `.cta`/`.cta__card` are shared with the
`page-cta` snippet, so scoping keeps that untouched. Deliberately left
the now-redundant base `.cta__form`/`__field`/`__sent` rules in
`chemistrie.css` rather than deleting them: the scoped rules win on
every property that matters, and `chemistrie.css` is actively being
edited by the other agent right now — not worth a conflict for dead-CSS
tidying.

## Build log — 2026-09-22: Proof stats section scaled down (commit `6889d5b`)
User: "revamp this section also it looks too big" (homepage Proof stats —
"Numbers, not noise." with the 0 / 100% / 28 / 14 days row).

**Why it was so tall** — four compounding values, all in `chemistrie.css`:
`--section-pad-y` (up to 160px, top AND bottom), `.proof__head`'s 80px
bottom margin, `.proof__cell`'s 36px vertical padding, and `.proof__num`
at `clamp(72px, 9vw, 140px)`. Tightened all four (92px / 52px / ~26px /
68px max respectively).

**The other half of the problem was alignment, not size**: `.proof__cell`
was `flex-direction: column` with default left alignment inside wide
grid columns, so every numeral sat hard left with a big void to its
right. Centred the cells — that alone tightened the visual density more
than the type scaling did. Added a 1200px cap on `.proof__grid` so the
four columns don't stretch indefinitely on wide screens.

**Scoping**: `proof.liquid` had no `{% stylesheet %}` block at all (all
its styles lived in `chemistrie.css`). Added one and wrote the overrides
`.proof`-prefixed (0,2,0 specificity) so they beat the base `.proof__x`
rules (0,1,0) regardless of stylesheet load order — avoids editing
`chemistrie.css` while the other agent has it open. Used `.proof.proof`
for the section padding override since the base is also a single class.
Count-up animation untouched (keys off `.proof__num`/`.proof__num-n` in
markup, CSS-only change).

**Content compliance flagged to user, NOT changed** (design-only request,
and this project has a hard-learned rule about not silently editing copy
during a design task): this section still publishes "14 days —
Money-back, no-questions ritual trial." (an explicit refund promise, and
the Contact page brief's do-not list expressly named refunds) and "28 —
Pharmacist-respected actives." (a specific unverified figure of the same
shape as the 6,000+/4.96/200 stats that were stripped everywhere else
this session). Raised both; left the decision to the user.

## Build log — 2026-09-22: Ritual Finder form changes + Why Pharmacists revamp (commits `367405d`, `27457ac`)

### Ritual Finder (`367405d`)
Two user-requested changes to `sections/ritual-finder-app.liquid`:

1. **Eyebrow promoted to section title**: "— Personalized Consultation —"
   moved out of `.rf-form-card__header`'s meta row (where it sat at 11px
   beside the "Question 1 of 4" counter) into a new
   `.ritual-finder-app__head` above the card, restyled at display-serif
   title scale (clamp 22-32px, italic, forest). Card meta row now holds
   only the step counter, so its `justify-content` switched from
   `space-between` to `flex-start`. **Also removed the JS line in
   `renderStep()` that rewrote `eyebrowEl.textContent` every step** — it
   was per-step state handling for an element that's now static section
   furniture; left in place it would have been harmless but misleading.
2. **Auto-advance removed**: the option-click handler had a 350ms
   `setTimeout` that jumped to the next question automatically. Now
   selecting only marks the choice and unlocks Continue. Removed
   `advanceTimer` and all three `clearTimeout(advanceTimer)` guards
   (in Next / Instant / Back handlers) — they existed solely to cancel
   that pending jump.

New CSS went into a `{% stylesheet %}` block added to the section (it had
none — all its styles were in `pages.css`), scoped under
`.ritual-finder-app__head` so the base `.ritual-finder-app__eyebrow`
rule in `pages.css` stays untouched.

### Why Pharmacists statement (`27457ac`)
User: "revamp this section" on `sections/pharmacists-statement.liquid`
(the section I built earlier for the Pharmacists page). Screenshot showed
the heading running at full `.display-h` size over a 760px centred
column — four enormous lines dominating the viewport, with a small
centred six-line paragraph stranded under it.

Rebuilt as an asymmetric editorial two-column grid (1.05fr / 1fr):
eyebrow + heading left, body right behind a `border-left` hairline, both
left-aligned. Heading dropped to `clamp(30px, 3.3vw, 46px)` — **the
layout carries the section now, so the type doesn't have to**, which is
the same principle that fixed the Proof section's "too big" complaint.
Body gets a 60ch measure instead of centred ragged text. Section padding
cut from the global `--section-pad-y` (up to 160px) to 56-96px. Stacks
to one column ≤860px with the vertical rule becoming a top border.

**Pattern worth reusing**: three separate "too big / doesn't look nice"
complaints this session (Pillars, Proof, this one) all came down to the
same two root causes — a global `--section-pad-y` of up to 160px top AND
bottom, and centred single columns letting oversized display type wrap
into many lines. Scaling type down plus changing alignment/layout fixed
all three; reaching straight for padding tweaks alone would not have.

## Audit — 2026-09-22: Collection page re-verified against the launch brief (commit `34a1d73`)
User re-sent the full Collection page brief (same one implemented in
`2695bbd` + follow-ups). Rather than re-implementing, ran a line-by-line
audit of the live files against every requirement. **Result: everything
already satisfied except one leftover**, plus one open conflict the user
themselves created.

Verified in place: announcement bar `show_announcement: false` default in
both `header.liquid` schema and `config/settings_data.json`, with the
approved copy and zero `$120`/"complimentary shipping" matches anywhere
in the repo; hero eyebrow/headline/supporting copy exact, `deck2` blank;
stat-bar `show_bar: false` with all four values cleared; grid has no
`col-side`/`col-filters`/`col-callout`/`price_range` references and no
"N formulas" count; CTA format `View {{ card_name }} →`; `product.available`
driving the sold-out branch; Ritual Finder card copy matching the brief
word-for-word with a `ritual_finder_position` number setting (default 6,
appends if product count is lower) making it repositionable; page-cta
copy replaced and second button cleared; closing statement untouched;
footer copyright free of "Compounded with care in Houston"; no em dashes
in any consumer-facing Collection copy (only in code comments).

**The one leftover found and fixed**: the grid's empty state still read
"No formulas match your filters." with a "Clear filters" button — dead
copy pointing at the sidebar filters that same brief removed, and reusing
the "formulas" vocabulary it also asked to drop. Now "Nothing here yet."
with a link to all products, which is what that state actually means
post-filters (it only fires when the collection itself is empty).
**Lesson: when removing a feature, grep its user-facing strings too, not
just its markup and CSS — the empty state survived three passes over this
file because it sits in an `{%- else -%}` branch that never renders in
normal browsing.**

**Open conflict flagged to user, not silently resolved**: the brief says
to remove the current placeholder hero image and explicitly bans
substituting developer-selected stock imagery ("Do not retain the current
placeholder brands/products shown in the hero image"). I originally set
`show_visual: false` for exactly that reason (`2695bbd`), but the user
then instructed "use the older images that were already there", so it was
set back to `show_visual: true` with `stock-lineup.jpg` (`625a1ad`). That
verbal instruction and this brief line directly contradict each other —
left as the user last asked for it and raised the conflict rather than
flipping it back unannounced.

### Follow-up: Why Pharmacists two-column grid was mis-placing its children (commit `ce68631`)
User: "put the content on the left to right and place the below content
to its place" — decoded against the markup rather than guessed at, and it
described a real bug I'd shipped one commit earlier in `27457ac`.

`.pstate__inner` became a two-column grid but still had **three** direct
children (eyebrow `<span>`, heading `<h2>`, body `<div>`). Grid
auto-placement filled them left-to-right, top-to-bottom: eyebrow →
col 1, heading → col 2, body → col 1 of a *new row*. So the heading was
separated from its own eyebrow and the body sat below-left instead of
right — exactly what the user described ("content on the left [should go]
to right", "the below content [goes] to its place").

Fixed by wrapping eyebrow + heading in a `.pstate__lead` div so the grid
has exactly two children, one per column.

**Lesson worth carrying: when converting a stacked block to a
multi-column grid, count the direct children first.** A grid doesn't know
which elements belong together — any element left loose becomes its own
grid item. Same class of mistake as the earlier `.rf-item`/consent-line
flex bug (`d1eb14e`), where an extra child in a container sized for a
fixed number of children silently broke the layout. Both times the symptom
looked like a styling problem and the cause was child count.

## Build log — 2026-09-22: Trust Signals drag-to-slide + dark image edge removed (commit `cca7cb0`)
Two user requests on the Pillars "Testimonial Chain" (the other agent's
carousel build — checked `git status` first and confirmed they had no
uncommitted work in `pillars.liquid` before touching it).

**Drag to slide**: the chain already had `touchstart`/`touchend` swipe
for mobile but no mouse drag. Replaced the touch-only path with a single
**Pointer Events** implementation (mouse + touch + pen) — keeping both
would have double-fired on mobile, since touch devices emit pointer
events too. Live feedback translates the **stage**, not the cards, at
0.28 damping capped at ±70px; snaps past a 45px threshold. Translating
the stage matters: each card carries its own per-state transform
(`is-active` / `is-prev-1` / `is-next-1` / `is-prev-2` / `is-next-2`), so
a per-card drag offset would have fought those.

Two gotchas handled: (1) a `dragMoved` flag guards the flanking-card
`click` handler so releasing a drag over a card doesn't *also* jump to
it — cleared in `requestAnimationFrame` so the click following pointerup
still sees it; (2) `-webkit-user-drag: none` + `pointer-events: none` on
the images, because browsers natively drag images and that hijacks the
gesture entirely.

**Dark edge on images** — diagnosed rather than guessed: measured the
pillar PNGs with PowerShell `System.Drawing` (all three are 1024×1536 =
exactly 2:3, matching their containers' `aspect-ratio: 2/3`). So the
edge wasn't an aspect mismatch. Cause was `object-fit: contain` +
`background: var(--c-forest)` on both `.pchain-card__media` and
`.pchain-card:not(.is-active)` — with a fractional computed height the
contain-fit letterboxes by a sub-pixel sliver, and a dark fill behind it
reads as a thin black edge. Set both to `transparent`. **Left the two
other `var(--c-forest)` backgrounds alone after checking what they are:
`.pchain-card__pill-fallback` (the no-image fallback, needs it) and the
progress-dot fill (unrelated).**

**Lesson: a "slight black border" on a contain-fitted image is almost
always the container's own background showing through sub-pixel
letterboxing — measure the image ratio before assuming a crop/aspect
mismatch, then remove the fill rather than switching to `cover` (which
would crop, undoing a deliberate uncropped-image decision).**

## Build log — 2026-09-22: Trust Signals converted to a scroll rail (commit `30ed4d5`)
User rejected the drag gesture added in `cca7cb0`: "i didnt want it to
drag i just want as i move it with cursor like how it moves for
collection on homepage."

**Asked before acting** (AskUserQuestion) rather than guessing, because
the two readings meant very different work: a ~10-line gesture tweak vs.
replacing an entire carousel architecture the *other agent* had iterated
on across four commits (tabs card → carousel → testimonial chain →
sequence numbers/uncropped images). User picked "make it a scroll rail."

**What the Collection rail actually is** — checked before copying it:
`.shop__rail` has **no JS at all** (grepped `chemistrie.js`; the only
"rail" hit is `story__rail-dot`, unrelated). It's pure CSS:
`display:flex` + `overflow-x:auto` + `scroll-snap-type: x mandatory` +
`scroll-padding-left` + `scroll-behavior:smooth` + hidden scrollbar, with
an edge `mask-image` on the wrapper. Mirrored that setup exactly.

**Removed**: the absolute stage and its five state transforms
(`is-active`/`is-prev-1`/`is-next-1`/`is-prev-2`/`is-next-2`/`is-hidden`),
the flanking "pill" preview markup + styles, the progress dots, and the
entire `initPillarsChain` IIFE (~190 lines: autoplay timer, rAF dot
fills, pause/resume, card-class bookkeeping, and the pointer-drag I'd
added one commit earlier). Net −475/+79 lines. Kept only the entrance
reveal, repointed to `.pillars-rail-wrap`.

**Kept**: every card now renders the full presentation the active card
used to have (number, title, lede, list, 2:3 image), and the transparent
image backgrounds from `cca7cb0` so the sub-pixel letterbox edge stays
fixed. Renamed `.pillars--chain` → `.pillars--rail` and verified zero
orphaned chain selectors remained in the stylesheet.

**Coordination note**: `sections/pharmacists-statement.liquid` had an
uncommitted tweak from the other agent at commit time (they added
`padding-top` to `.pstate__body`) — checked `git status` and staged only
my two files by name.

## Build log — 2026-09-22: Trust Signals reverted to the automatic carousel (commit `54892c8`)
User: "revert and make jt back to automatic". Only one coherent reading —
reverting my *last* commit would have removed automatic behaviour, which
contradicts "back to automatic". So: undo the whole scroll-rail detour
and restore the auto-playing Testimonial Chain.

**Restored from `c877785`, not `cca7cb0`** — deliberately. `cca7cb0` was
the last chain state, but it contained the pointer-drag the user had
already rejected ("i didnt want it to drag"). `c877785` is the state just
before that went in, so reverting there avoids reintroducing something
they'd explicitly turned down. Then re-applied only the dark-edge fix on
top (the two `var(--c-forest)` fills behind contain-fitted images →
`transparent`), since that was a separate request they did want.

**Verified rather than assumed**: `git diff c877785 -- sections/pillars.liquid`
shows those two background declarations as the entire delta, and the JS
chain block diffs clean against `c877785`. Also grepped both files for
orphan rail references (`pillars-rail`, `pillarsRail`,
`initPillarsRailAutoplay`, `autoplay_speed`) — none left.

**Technique worth reusing for surgical restores**: splicing an old block
back into a file that's changed a lot elsewhere. Hardcoded line numbers
failed twice (off-by-one against `sed` output); finding boundaries by
**marker search** (`findIndex(l => l.includes('Testimonial Chain'))` and
the next section's comment) worked first time and is resilient to the
file shifting. Reach for marker-based slicing, not line numbers.

**Net effect on the section's history**: tabs card → carousel →
testimonial chain → (my rail detour) → back to testimonial chain. The
rail work (30ed4d5, 366ba0a, and the rail half of the other agent's
909633e) is fully undone; the dark-edge fix survives.

### Correction: over-reverted the Trust Signals rail (commits `54892c8` → `ef84476`)
"revert and make jt back to automatic" — I read this as "undo the rail
detour, restore the auto-playing carousel" and reverted all the way back
to the Testimonial Chain (`54892c8`). Wrong. User meant **revert the last
commit only** (`366ba0a`, the auto-scroll), keeping the scroll rail.

Corrected in `ef84476`: back to the rail exactly as at `909633e`
(horizontal scroll + snap, softened `.10`/`.16` shadow, transparent image
backgrounds), with the auto-scroll JS removed **and its plumbing cleaned
up too** — the `data-autoplay-speed` attribute and the autoplay-interval
schema `range` setting, which would otherwise have sat in the theme
editor doing nothing.

**Where the misread came from**: the phrasing looked self-contradictory
("revert" my last change would *remove* automatic, yet they said "back to
automatic"), and I resolved that contradiction by assuming the larger
revert. The safer resolution when an instruction seems internally
contradictory is to ask which of the two readings is meant — I'd asked on
the previous turn (AskUserQuestion, rail vs chain) and it worked well;
skipping it here cost a full round-trip and a wasted 400-line revert.
**When a revert instruction is ambiguous about scope, confirm the scope —
reverting too far destroys work that was wanted.**

### Resolution: rail + automatic sliding (commit `6f3bb7e`)
"cant see the automatic sliding" — correct, because the revert they'd
asked for (`ef84476`) had stripped it. Re-added autoplay **on top of**
the rail, which is the combination they actually wanted all along:
manual scroll/swipe still native, autoplay layered over it.

Behaviour: one card every 4s, step measured from the real gap between
two cards (`cards[1].offsetLeft - cards[0].offsetLeft`) so it survives
the responsive card widths, looping to the start at the end. Pauses on
hover/focus/pointer/touch with a 1.2s resume grace.

**Two fixes over the first attempt (`366ba0a`), both guessing at why it
may not have been visible:**
1. `visible` now **defaults to `true`** rather than `false`. Previously a
   missed/never-firing IntersectionObserver callback meant `visible`
   stayed false forever and nothing ever slid — a silent total failure.
   Now the failure mode degrades to "slides even when off-screen", which
   is harmless.
2. **Dropped the `wheel` handler.** With Lenis smooth scroll active,
   wheel events fire continuously while scrolling the page; if the cursor
   happened to sit over the rail, each one called `pause()` +
   `resumeSoon()`, pushing the resume a full interval out and effectively
   holding autoplay paused indefinitely.

Also dropped the `autoplay_speed` schema setting in favour of a script
constant — it had already proven to be dead weight (left stranded in the
theme editor when autoplay was reverted).

**Note on when autoplay legitimately does nothing**: the `maxScroll <= 1`
guard means no sliding when all cards already fit without overflow. With
3 cards at `clamp(300px, 78vw, 620px)` that's ~1.9k px of content, so on
a very wide (2560px) monitor there's no overflow and correctly no
movement. Worth remembering before debugging a "not sliding" report —
check the viewport width first.

### Root-cause fix: autoplay isolated from the main IIFE (commit `ad61594`)
Third report of "not sliding" after `6f3bb7e`. Stopped tweaking the same
logic and looked for why it might never execute at all.

**Found a real structural bug, unrelated to the autoplay logic itself**:
the entire file is one `(function(){...})()` starting with
`if (!window.gsap) return;`. Autoplay was defined ~600 lines into that
same IIFE — it has zero functional dependency on GSAP, but was gated
behind that check anyway, and behind every other animation block between
the top of the file and its own position. Two silent-failure paths this
created: (1) if the GSAP CDN script (`unpkg.com`, external, no local
fallback) fails to load for any reason, the entire IIFE body after that
line never runs; (2) if *any* earlier synchronous statement in ~600 lines
of animation code throws, JS execution of the rest of the function stops
there — no console error visibly connects to "pillars", making it
genuinely hard to diagnose from a bug report alone.

**Fix**: moved the autoplay IIFE to a fully standalone top-level script
block at the end of the file, after the main IIFE's closing `})();` —
mirroring the existing pattern the file already uses for the hero-anchor
smooth-scroll handler (also standalone, also after the main IIFE). It now
initializes unconditionally, independent of GSAP load success or any
unrelated animation code elsewhere in the file. Had to swap the shared
`$$` helper for a local `querySelectorAll` + `Array.prototype.slice`
one-liner, since `$$` is scoped inside the other IIFE and unavailable
here. Logic itself (4s interval, pause/resume, measured stride, reduced-
motion check) is unchanged from `6f3bb7e`.

**Lesson for this file specifically**: `assets/chemistrie.js` has a single
choke point at line 21 (`if (!window.gsap) return`) that silently kills
everything after it. Any new feature added to this file that doesn't
*itself* need GSAP should go in its own top-level script block, not
inside the big IIFE, or it inherits that fragility for free. Worth
proposing splitting the whole file this way if more "code that should
obviously work isn't running" reports come up.

## Build log — 2026-09-22: Fixed shared hero image cropping + widened, all inner pages (commit `f854690`)
"make all pages hero sections images display properly and wider" —
`sections/page-hero.liquid` is shared across Collection, Contact,
Founders' Circle, Our Story, Pharmacists and Ritual, so one fix here
covers all of them.

**Measured before touching anything** (PowerShell `System.Drawing`) rather
than guessing what "not displaying properly" meant: the box was a fixed
`aspect-ratio: 16/9.5` (1.684) with `object-fit: cover`. Every page's real
hero asset varies wildly in native ratio (0.75 portrait letter photo up
to 2.08 wide product shot), and `cover` crops whatever doesn't match the
box. Computed exact crop loss per page:

- Founders' Circle (`stock-note.jpg`, 0.75 — portrait): **45% of the image
  kept**, 55% cropped off the sides. This is almost certainly the actual
  "not displaying properly" bug.
- Collection (`stock-lineup.jpg`, 1.12 — near-square): 67% kept.
- Contact / Our Story / Pharmacists / Ritual (1.6–2.1 — landscape/wide):
  81–96% kept, all reasonably fine already.

**Fix**: `object-fit: cover` → `contain`. This is the only technique that
guarantees the full photo is always visible regardless of native shape —
fixes every current mismatch at once, and won't newly break whichever
image gets uploaded next (this project swaps hero images often). Added
padding inside `.page-hero__visual` so a contained image reads as a
deliberately framed photo against the existing forest background rather
than looking like accidental letterboxing.

**Widened**, the other half of the request: grid split
`1fr 1.15fr` (~46/54) → `0.82fr 1.3fr` (~39/61), box ratio `16/9.5` → `4/3`
(a better middle-ground across the actual asset ratios, and taller so the
wider box isn't just empty framing under `contain`). Text column keeps
its own measure caps (`.page-hero__title` 15ch, `.page-hero__deck` 56ch),
so narrowing its grid share doesn't hurt line length/readability.

**Scope note**: this is the shared `page-hero` section only — the
homepage's own hero (`sections/hero.liquid`, a different, bespoke split
layout) wasn't touched, since "all pages hero sections" most naturally
reads as the repeated inner-page component, and the homepage hero has its
own separate design already tuned earlier this session (grid-lines
removal, etc.).

## Build log — 2026-09-22: Removed mismatched hero frame fill, fixed homepage hero (commit `e07c4a0`)
User: "remove the green extra bg from those images and home page hero is
still the same" — two issues in one message.

**Green bg**: the padding+fill I added in `f854690` was the actual
problem. `.page-hero__visual` had a flat `background: var(--c-forest-2)`,
but `.page-hero`'s own background is `var(--grad-deep)` — a diagonal
gradient sweeping through several shades, not one flat colour. So on any
page where `object-fit: contain` left a letterbox gap (the exact pages I
was fixing crop for), the flat fill never matched what was around it and
read as a visible mismatched green box. Removed the fill and padding
entirely; letterbox gaps now show the section's real gradient through
transparency instead of a foreign flat rectangle. Kept the border and
shadow — those weren't the reported problem (translucent cream line,
black shadow, neither reads as "green").

**Homepage hero unchanged**: correct observation, and a genuine scope
gap, not a bug in the previous fix — `f854690` only ever touched
`sections/page-hero.liquid`, the *inner-page* hero. The homepage has its
own separate, bespoke hero (`sections/hero.liquid`, styled in
`chemistrie.css` since that file has no stylesheet block of its own) that
was never part of that commit. Measured `hero-home.jpg` before editing:
2.077 ratio in a 16:9.5 (1.684) `cover` box was already losing ~19% off
top/bottom — same crop-risk pattern as the inner pages, just less severe
on this particular image. Applied the identical fix: `cover` → `contain`,
box ratio `16/9.5` → `4/3` (base rule **and** the `≤700px !important`
mobile override — found by grepping every `.hero__visual-frame` rule
first, so nothing got missed the way a hidden `!important` easily could
have fought the base change), image column widened
(`.hero__inner` `1.1fr/1fr` → `0.9fr/1.15fr` — text previously got *more*
room than the image, now the reverse). **Did not** remove
`.hero__visual-frame`'s own background here — `.hero`'s section
background is already the identical flat `var(--c-forest-2)`, so there
was never a mismatch on this page the way there was on the gradient-
backed inner-page hero; removing it would have been a no-op copied
reflexively from the other fix rather than an actual improvement.

**Found but deliberately not touched**: `sections/hero.liquid` markup
references `section.settings.hero_image`, but `templates/index.json` sets
a field called `bottle_image` (empty string) that doesn't correspond to
any markup reference at all — looks like a leftover from an incomplete
field rename, currently harmless (the image just falls through to
`hero_fallback_asset`/`hero-home.jpg` correctly either way) but worth
cleaning up if anyone touches this section's schema again.

**Coordination note**: `assets/chemistrie.js` had unrelated uncommitted
changes at commit time — the other agent had reverted the pillars-
autoplay fix from `ad61594` back out (removed the standalone script,
restored the old inline comment). Not part of this task; confirmed via
`git diff` what it was before leaving it alone, and flagged it to the
user directly since it silently undoes a fix they'd explicitly asked for
twice this session.

## Build log — 2026-09-22: Two undos per explicit request (commit `efbb4d6`)
User asked to undo both the Trust Signals autoplay situation and the hero
image work, with the hero scope confirmed via AskUserQuestion ("revert
both hero commits") after "the git commit" read as genuinely ambiguous —
could have meant just the last commit (green-bg fix) or both hero commits
(widen + contain + green-bg fix). Asking rather than guessing was the
right call this time, given the earlier over-revert mistake this session.

**Trust Signals**: the other agent had an *uncommitted* local change
removing the autoplay fix from `ad61594` (reverting `initPillarsRailAutoplay`
back out, ~78 line removal). Diffed it first to confirm it was a clean,
isolated reversion with nothing else mixed in, then `git checkout --
assets/chemistrie.js` to discard it and restore the committed
(GitHub-matching) state. No new commit needed — HEAD already had what the
user wanted; the working tree just needed to catch back up to it.

**Hero images**: `git revert --no-commit e07c4a0 f854690` (newest first),
reverting both hero-image commits in one commit. Verified by diffing the
result against `909633e` (the last commit before either hero change) —
empty diff, confirming an exact match rather than just "looks about
right." `sections/page-hero.liquid` and the homepage hero rules in
`assets/chemistrie.css` are both back to: `object-fit: cover`, the
original `16/9.5` box ratio, the original grid column splits, and the
flat `var(--c-forest-2)` fill.

**Net effect**: the cropping bug on Founders' Circle/Collection hero
images (45%/67% of the photo visible) is back, since that's what
reverting these commits necessarily undoes along with the widening/green-
fix work. Not flagging this as a mistake — it's the direct, known
consequence of an explicit revert request, worth remembering if a future
message references "hero images look cropped/wrong" again, since that
exact diagnosis was already done once (measured via PowerShell
System.Drawing) and doesn't need re-deriving from scratch.

## Build log — 2026-09-22: Trust Signals rebuilt from a supplied design preview (commit `8f01af5`)
User pasted a `file:///` path to a standalone HTML mockup (built by a
different tool, judging by the path — `.gemini/antigravity-ide/.../scratch/
test_preview.html`) titled "Trust Signals Testimonial Chain Preview" and
said "i want like this." Read the file directly (Read tool handles local
file paths) rather than asking for a description — it was a complete,
self-contained HTML/CSS/JS page, so the exact target was unambiguous
once opened.

**Design**: one active center card (2-column body — title/italic
blockquote/byline on the left, full-bleed image with a rounded pill
badge overlay bottom-right) flanked by narrow numbered preview "pills"
that shrink and fade with distance (`is-prev-2`/`is-prev-1`/`is-active`/
`is-next-1`/`is-next-2`/`is-hidden`), auto-advancing with a progress-dot
row underneath. This replaces the plain scroll rail from the previous
several commits entirely.

**Content honesty check before porting anything**: the preview's image
paths (`pillar-pharmacist-formulated.png` etc.) and quote text ("Every
formula answers to two pharmacists, by name, not a lab Chemistrie
doesn't own.") are **exact matches** to the live site's existing approved
`lede`/`image_asset` block data — confirming the preview was built from
this project's real content, not invented. But the preview's byline row
("Chemistrie Standard" / "Chemistrie Formulations · Pharmacist Rigor",
etc.) doesn't correspond to any approved copy or existing schema field —
that part *is* new/fabricated text from whatever tool generated the
mockup. Per this project's standing rule, didn't copy it into a live
default: added `meta_name`/`meta_role` as new optional block settings,
both blank by default, with an explicit schema `paragraph` note ("not
filled in with placeholder text since this copy needs approval") and a
Liquid guard so the byline only renders once a merchant sets both
fields. The rest of the design ports through untouched since it's just
layout/styling, not copy.

**Cleaned up while rebuilding schema**: dropped the now-orphaned
`item1`/`item2`/`item3` (bullet list) and `crest_sub` fields — the new
design has no slot for them. Checked `templates/index.json` first: all
of those are already empty strings on every live block, so nothing was
actually lost.

**JS**: kept the exact architectural lesson from `ad61594` even though
this was a full rewrite, not a patch — `initPillarsChain` is its own
top-level script block, outside the big `if (!window.gsap) return`-gated
IIFE, since none of this carousel logic (card classes, autoplay timer,
dots, touch swipe) actually needs GSAP. Added one thing neither the
preview nor any earlier version of this carousel had: a
`prefers-reduced-motion` check that renders the first card statically
(clicks/dots still work) instead of auto-advancing.

**Validation**: `node -c` syntax check, CSS brace balance, schema JSON
parse, HTML tag-count balance (div/article/section/button), and an
explicit grep sweep for stale `pillarsRail`/`pillars-rail` references
after the rewrite — all clean before committing.

## Build log — 2026-09-22: Trust Signals badges removed, autoplay faster, manual drag added (commit `8c9f51b`)
Three changes to the just-rebuilt Testimonial Chain (`8f01af5`):

1. **Removed the badge/number overlays** — `.pchain-card__badge-overlay`
   (Rx/C./for-her floating on the active card's real photo) and
   `.pchain-card__pill-num` (01/02/03 on each flanking pill), markup and
   CSS both. **Deliberately kept `crest_mono`'s no-image fallback**
   (`.pchain-card__placeholder`/`.pchain-card__pill-fallback`) — that's a
   different case, only shown when a pillar has no photo at all rather
   than layered on top of a real one, and moot in practice since all
   three live pillars have images configured.
2. **Autoplay** 5000ms → 3800ms ("slightly fast").
3. **Manual drag added** — the chain previously only advanced via click
   (flanking card/dot) or touch swipe; no desktop drag. Replaced the
   touch-only `touchstart`/`touchend` pair with a single **Pointer
   Events** implementation (mouse + touch + pen) on `#pillarsChainStage`
   — same reasoning as the rail-drag work earlier this session: a
   separate touch listener alongside pointer events double-fires on
   touch devices. A `dragMoved` flag (cleared on the next
   `requestAnimationFrame` after pointerup) suppresses a flanking card's
   click when a drag ends on top of one, so dragging never also
   jump-navigates to that card. `touch-action: pan-y` on the stage keeps
   vertical page scroll working; images get `user-drag: none` since
   browsers natively drag them otherwise.

**Context this session had already established, reused here rather than
re-learned**: (a) touch + pointer event double-firing, (b) the
click-vs-drag suppression pattern via a moved-flag, (c) keeping non-GSAP
carousel logic in its own top-level script outside the GSAP-gated IIFE —
all three came directly from the rail-drag and autoplay-reliability work
earlier in this session (`cca7cb0`, `ad61594`), applied to a different
component without needing to re-derive them.

## 2026-09-22 — Pharmacists statement: center body, scroll fade-in, smaller heading (4927491)
Task: right column ("Chemistrie was built around...") should sit vertically more toward the middle, fade in from left to right as the section scrolls into view, and the left heading ("Skincare doesn't need more complexity...") should be slightly smaller.
- sections/pharmacists-statement.liquid: `.pstate__body` now `align-self: center` (was inheriting grid `align-items: start`), so it centers against the taller heading column instead of pinning to the top. Reset to `align-self: auto` in the <=860px stacked layout so it doesn't fight the single-column flow. `.pstate__heading` font-size clamp reduced from `clamp(30px,3.3vw,46px)` to `clamp(27px,2.9vw,40px)`.
- assets/chemistrie.js: added a standalone `gsap.from(".pstate__body", {opacity:0, x:-50, ...})` ScrollTrigger block (trigger `.pstate`, start "top 75%", once: true), placed alongside the file's existing per-section ScrollTrigger blocks (Stat Bar, Contact Steps, Founders) — same pattern used elsewhere, not a new animation system.

## 2026-09-22 — Contact page: launch FAQ, bottom CTA, mobile gap fix (0a701c3)
Task: full Contact page developer-handoff brief (Sept 2026). Audited the page against it first — most of it (hero copy, form fields/subject options, Reach Us block, 4-step journey, stat strip hidden) was already correct from an earlier rebuild. Real gaps fixed:
- templates/page.contact.json `contact-faq`: only had 4 of the 8 required FAQs. Added faq_5–faq_8 verbatim from the brief (sensitive skin, ship timing, order/product problem resolution — using the brief's exact "may include product guidance, replacement, or store credit" copy — and prescription-medication disclaimer).
- `page-cta` on this template still said "Begin your ritual / Shop the Collection" (old generic CTA). Replaced with brief's "Not sure where to start?" + Find Your Ritual (/pages/the-ritual) + Explore the Collection (/collections/all), mirroring the exact button_url/button2_url pattern already used in templates/page.the-pharmacists.json.
- snippets/page-cta.liquid eyebrow was `{{ eyebrow | default: '— Ready when you are —' }}` — an empty string still counts as blank to Liquid's `default` filter, so setting `"eyebrow": ""` for Contact would have silently shown the wrong fallback text. Changed to only render the `<span>` when `eyebrow != blank`. Checked all 5 templates using page-cta first — none relied on the schema default, so this was safe everywhere.
- sections/contact-faq.liquid: added the "Still have a question?" footer prompt as CMS-editable `footer_heading`/`footer_body` (richtext, so the support@chemistrieco.com mailto link can live in it) — optional/blank-safe, doesn't force onto other doesn't-apply cases.
- Brief's mobile complaint ("remove the large blank/dead-space area between the FAQ and bottom CTA") was two independent paddings stacking: `.page-section` bottom padding (`--section-pad-y`, ~56–80px on mobile) on contact-faq, plus `.cta--page`'s own `padding-top: clamp(56px,8vw,110px)` on the CTA card right after it. Scoped a `@media (max-width:700px) { .page-section.contact-faq { padding-bottom: ... } }` override to *only* this section (double-class selector for source-order-independent specificity) rather than touching the shared `--section-pad-y`/`.cta--page` values other pages also use.

**Not done — flagged, not faked:** (1) hero image — brief says "approved Chemistrie Contact hero asset supplied separately," nothing was actually attached, so the existing `hero-contact.jpg` fallback stays. (2) GoHighLevel form wiring — brief explicitly asks the dev to request GHL access/field-mapping before implementation; no credentials or API details exist in this repo, so the form still posts to Shopify's native contact form handler only. Both need the user to supply the asset / CRM access before they can be finished.

## 2026-09-22 — Contact FAQ: one-line heading, full design revamp (6dc7f4b)
Task: "Frequently asked questions" heading was wrapping to two lines; also revamp the FAQ's visual design.
- Root cause of the wrap: the heading used the shared `.display-h` class — clamp(40px,6vw,88px) inside a 720px-capped `.page-section__head` — sized for hero-scale headings, way too large/narrow-boxed for a 27-character section label. Gave it a dedicated `.contact-faq__heading` class: clamp(15px,5vw,36px), `white-space: nowrap`, and `max-width: none` on its head wrapper. Verified by hand-computing worst case (320px viewport, 20px mobile pad-x → 280px available) against the vw-scaled font size — comfortable margin at every breakpoint, not just eyeballed.
- Redesigned the accordion itself: swapped the bordered/rounded card list (`.faq-item`) for an editorial numbered-row list (`.cfaq-item`) — hairline dividers instead of per-card borders, italic serial number (01, 02...), question set in the display serif instead of body sans, and a two-bar icon that morphs plus-to-minus instead of rotating a "+" glyph. Open state now tints number/question/icon to the sage accent.
- Renamed classes to `.cfaq-*` (scoped to this section) and updated the click-handler JS to match. Checked first — `sections/ritual-faq.liquid` has its own separate `.faq-item`/`.faq-list` with independent scoped styles, untouched by this rename.

## 2026-09-22 — Fix: FAQ open row showed a solid sage strip instead of text (bf46972)
User screenshot: clicking a FAQ question replaced the text with a solid green/sage bar. Real bug, not a rendering guess — the open-state selector list `.cfaq-item__q[aria-expanded="true"] .cfaq-item__num, ...__question, ...__icon-line { color: var(--c-sage); background: var(--c-sage); }` (added in the FAQ redesign, 6dc7f4b) applied `background: var(--c-sage)` to ALL three selectors, including `.cfaq-item__question` — meant to only recolor icon-line bars' fill. That painted the full-width flex-grown question span solid sage with sage text on top of it (invisible). Split into two rules: color-only on `__num`/`__question`, background only on `__icon-line`.

## 2026-09-22 — FAQ heading sized to match Reach Us (6c76e02)
Task: "Frequently asked questions" heading (shrunk to clamp(15,5vw,36) in the earlier one-line fix) should be the same size as "Reach Us" or just slightly smaller.
- Reach Us uses `.display-h`: clamp(40px,6vw,88px), line-height .98, letter-spacing -.015em. Matched those secondary properties on `.contact-faq__heading` and raised its desktop/tablet size to clamp(30px,5vw,80px) — same shape, capped a bit under Reach Us's max.
- That size alone would overflow one line on phones again, so kept a `@media (max-width:640px)` step-down to clamp(13px,5vw,26px), re-verified by hand against 320/360/414/480/640px viewport widths (all ≥13% width margin) so the earlier one-line fix ([[contact-faq-one-line-heading]] if referenced later) doesn't regress.

## 2026-09-22 — Ritual Finder FAQ matched to Contact FAQ redesign (4cc67a5)
Task: "make the ritual finder faq same" — apply the Contact FAQ redesign ([[contact-faq-one-line-heading]]-adjacent work, 6dc7f4b/bf46972/6c76e02) to sections/ritual-faq.liquid too.
- Rebuilt its accordion to the identical numbered-row pattern (hairline dividers, italic 01/02 index, serif question, plus-to-minus icon, sage accent on open) under an `.rfaq-*` prefix (kept distinct from contact's `.cfaq-*` — separate pages, but cleaner than sharing names). Heading got the exact same size rule (clamp(30px,5vw,80px) desktop / clamp(13px,5vw,26px) ≤640px, line-height .98, letter-spacing -.015em), kept centered since that's this section's existing layout (contact's is left-aligned).
- **Found while doing this, not something the user reported**: `.ritual-faq`'s old markup used bare `.faq-item`/`.faq-list`/`.faq-item__q` classes, but those base rules only ever lived in contact-faq.liquid's own `{% stylesheet %}` block. Shopify scopes a section file's stylesheet to pages that render THAT section — ritual-faq.liquid never got contact-faq.liquid's CSS, on any page, ever. Its accordion had no borders/padding/icon/expand-animation of its own, independent of my earlier contact-faq rename. Giving ritual-faq.liquid a complete self-contained rule set (as this task required anyway) fixed that pre-existing bug as a side effect.
**Pattern worth remembering**: a section's `{% stylesheet %}` block is NOT global CSS — it only loads on pages where that exact section is rendered. Never assume one section's styles are available to another; each section file must be fully self-contained.

## 2026-09-22 — Replaced all 5 product images with approved bottle photography (2b2218f)
Task: user uploaded 5 real product shots (Velvet foaming cleanser, Silken scar gel, Veil serum, Cashmere lotion, Aura cream) to replace the images shown wherever products appear — product detail page, collection page, etc.
- Traced the image source: `sections/main-product.liquid`'s left gallery calls `{%- render 'product-image-asset', product: product -%}` first, before falling back to `product.featured_image`/stock photo. That snippet (`snippets/product-image-asset.liquid`) matches on product handle/title substring and echoes a fixed theme-asset filename (`product-velvet.png` etc.) — a documented deliberate choice ("Client-approved shots live in the theme because the matching Shopify product images are not the approved ones"). Grepped for the snippet's usage first: it's also called from main-collection.liquid, shop.liquid, main-search.liquid, product-details.liquid, ritual-shop.liquid — so this one snippet is the single source of truth for these 5 products' images site-wide.
- Also found two OTHER hardcoded references that don't go through the snippet: `sections/ritual-finder-app.liquid`'s JS result-card data (`image: "{{ 'product-velvet.png' | asset_url }}"` ×5) and `templates/index.json`'s homepage product showcase blocks (`"image_asset": "product-velvet.png"` ×5). Both needed the same filename swap or they'd have kept showing the old photo.
- Saved the 5 uploaded photos as `.jpg` (source format) at the same asset basenames — `product-{velvet,veil,cashmere,aura,silken}.jpg` — verified each one's label against the intended product name via Read before copying (all matched: 26=Velvet, 27=Silken, 28=Veil, 29=Cashmere, 30=Aura). Updated all three files (snippet, ritual-finder-app.liquid, index.json) from `.png` to `.jpg`, then deleted the 5 old `.png` files since nothing referenced them anymore.
**Pattern worth remembering**: when a "replace the image" task comes in, grep for the asset filename across the whole repo first — a single snippet may not be the only place a filename is hardcoded (this theme also embeds asset filenames directly in JS data objects and JSON template blocks, bypassing the shared snippet).

## 2026-09-22 — Founders' Circle CTA revamped to split layout (94f11e2)
Task: "revamp this section on home page" with a screenshot of the CURRENT centered-card Founders' Circle CTA (no target design given). Asked two rounds of AskUserQuestion since "revamp" alone was too open-ended after past costly wrong-direction guesses in this project — landed on: two-column split, copy left (eyebrow/heading/sub), email field + button stacked as a compact block on the right, replacing the old single-column centered layout (eyebrow → heading → sub → wide inline pill form, all centered).
- sections/newsletter-cta.liquid: new `.circle__grid` (1.15fr/1fr) wrapping `.circle__copy` and `.circle__panel`; form panel is `.circle__form` (flex column, max-width 360px) with `.circle__field` (bordered box, full width) and `.circle__submit` (full-width button) stacked, instead of the old inline pill row. Single column under 860px, copy and panel both centered there.
- Renamed the scoped classes driving the old inline pill (`.cta__form`/`__field`/`__submit`/`__form-row`) to `.circle__*` since the shape changed; kept `.cta__sent`/`__consent`/`__error` since those didn't change shape, just position.
- **Found and removed while doing this**: assets/chemistrie.css had a global `.cta__form`/`.cta__field`/`.cta__form--sent` block (+ mobile query) that turned out to be dead — grepped every `.liquid` file first and confirmed newsletter-cta.liquid was the only place ever rendering those bare classes, and it no longer does post-rewrite. Removed rather than left orphaned, per the project's standing "delete code you're certain is unused" rule. Left the *global* `.cta__sent` rule alone even though it's now fully shadowed by `.cta--circle .cta__sent` — that class still renders in the one remaining usage, so it's redundant, not dead.
**Pattern reinforced**: for a bare "revamp this section" with no reference design, ask for a direction before touching code — this project has repeatedly cost extra round-trips when a specific direction was assumed instead of confirmed (see the Trust Signals over-revert incident).

## 2026-09-22 — Fix: Founders' Circle body text off-center on mobile (09e5f84)
User screenshot: on mobile, the body paragraph under "Come closer." was visibly centered around a point ~50px left of the eyebrow/heading's true center — text looked centered within itself but the whole block was shifted left.
Root cause: the split-layout revamp ([[94f11e2]]-ish, prior commit) reset `.circle__copy .cta__sub`'s margin with longhand `margin-left:0; margin-right:0;` (desktop, unconditional — to flush the paragraph left under the left-aligned desktop heading), then the `@media (max-width:860px)` override tried to re-center it with shorthand `margin: 28px auto 0;`. Equal specificity, later in source, should cascade cleanly in theory — but never trust mixed longhand/shorthand overrides across a breakpoint split without checking the rendered result. Fixed by making both rules fully self-contained (`max-width` + `margin` together, both as shorthand): desktop drops `max-width` and flushes left with `margin:20px 0 0`, mobile restores `max-width:48ch` + `margin:28px auto 0`.
**Pattern worth remembering**: when overriding a property across a min/max-width split, write both sides as complete equivalent-shorthand rules rather than partial longhand resets — avoids exactly this class of "should cascade correctly but doesn't visually" bug.

## 2026-09-22 — Homepage hero: top-align heading/image, smaller heading, bigger image (003e3e1)
Task: heading and image should be "equally aligned" (screenshot showed heading top higher than image top), reduce heading size slightly, increase image size.
- Root cause of the alignment gap: `.hero__inner` (assets/chemistrie.css) is `display:grid` with `align-items:center`. The copy column (title+deck+cta+trust) is much taller than the stage column (bounded by the visual frame's `aspect-ratio:16/9.5`), so centering the short stage column within the tall row pushed the image down from the heading's top, leaving equal empty space above and below it instead of the two starting level. Changed to `align-items:start`.
- Grew the image: shifted `grid-template-columns` from `1.1fr 1fr` (favoring copy) to `1fr 1.15fr` (favoring image) — box grows proportionally since it's aspect-ratio-locked to column width, no object-fit/crop change (avoided touching aspect-ratio itself, since hero image aspect-ratio changes were explicitly reverted earlier this session per user request — [[chemistrie-theme-repo]] history).
- `.hero__title` font-size clamp(40px,5.2vw,76px) → clamp(36px,4.6vw,66px).
- Noted but did not touch: sections/hero.liquid had an uncommitted change from the concurrent `.kilo` agent (removed a schema field's `label`) sitting in the working tree at the same time — staged only assets/chemistrie.css by exact filename, left their file alone.

## 2026-09-22 — Hero copy nudged down slightly (609091f)
Follow-up to the top-align fix ([[a12501f]]-ish, prior commit): user wanted the hero text a little lower than the image's top edge, not exactly flush. Added `margin-top: clamp(10px, 1.4vw, 22px)` to `.hero__copy` — small, deliberately subtle per "only a little".

## 2026-09-22 — Reduce hero top padding (5d51f26)
User screenshot showed a large green gap between the nav and "Some rituals don't need..." heading. Two contributors were stacking: `.hero`'s own top padding (clamp 24-52px) and `.hero__inner`'s top margin (clamp 36-68px, added just before for the copy-nudge-down request) — combined into a much bigger gap than either alone. Reduced both: `.hero` padding-top -> clamp(12px,1.8vw,28px), `.hero__inner` margin-top -> clamp(18px,2.4vw,36px).

## 2026-09-22 — Hero trust strip nudged up (d46543c)
User wanted the "2,400+ / 28 / ★4.96" trust strip block (bottom of hero copy) moved slightly up. Reduced its spacing: `.hero__trust` margin-top clamp(8,1.5vw,16) -> clamp(2px,0.6vw,8px), padding-top clamp(20,3vw,32) -> clamp(14px,2vw,22px) — keeps the divider line, just tightens the gap above and below it.

## 2026-09-22 — Investigated "Explore the Collection CTA missing on full load" (f59b700)
User: works on reload, missing "when the full website is loaded." Audited all three layers before touching anything:
- sections/hero.liquid: `.hero__cta-row` markup unchanged, renders unconditionally, no `{% if %}` guard.
- templates/index.json: `cta_primary_label`/`cta_primary_link` both set (not blank).
- assets/chemistrie.css: no `display:none`/hidden rule on `.hero__cta-row`/`.hero__cta-primary` anywhere; confirmed no CSS pre-hides it (so a GSAP load failure alone can't explain persistent invisibility — CSS default is visible, JS only adds the fade-in).
- No duplicate `<script src="chemistrie.js">` (only one, in layout/theme.liquid) and no page-transition/PJAX system that could cause a stale re-render.
Real fragility found: GSAP/ScrollTrigger load render-blocking from a third-party CDN (`unpkg.com`, layout/theme.liquid lines 36-37) with no self-hosted fallback, and the CTA row's entrance animation (`gsap.from(".hero__cta-row > *", ...)`, assets/chemistrie.js) had `delay:1.1 + duration:1` — not fully visible until ~2.1s after the script runs. On a slower real-world load (more assets competing, slower CDN fetch), that window stretches, which would look exactly like "the CTA isn't there" if checked before it resolves. Shortened cta-row to delay:0.5/duration:0.7 and trust strip to delay:0.7/duration:0.7.
**Not fully confirmed as THE root cause** — could not reproduce directly — but is the only concrete fragility this audit surfaced, and the fix is safe/beneficial regardless. If still reported missing after this, next step is asking for a HAR/screen recording or checking if it's mobile-specific.
