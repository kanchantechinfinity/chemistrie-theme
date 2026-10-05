# Build Log — Chemistrie Theme

Running record of completed build tasks. Newest first.
Detailed reasoning and gotchas live in `memory.md`; this file is the
what-shipped-when summary.

---

## 2026-10-01 — Cart steppers update in place (no reload)

**Task:** stop the quantity steppers reloading the page on every click.

**Shipped.** `sections/main-cart.liquid` — steppers now POST `/cart/change.js`
and patch the page from the response:

| Patched from the response | Hook |
| --- | --- |
| line total (and struck original) | `data-line-price` |
| subtotal / estimated total | `data-cart-subtotal`, `data-cart-total` |
| header bag count | `.nav__bag-count` |
| free-shipping sentence, fill, met state | `data-ship-text`, `data-ship-fill`, `data-ship-bar` |

Every figure is re-read from the response rather than recalculated in JS, so
the page cannot drift from what Shopify holds. Line keys go through
`CSS.escape` — they contain `:` and would break a selector otherwise.

On a failed request the handler reloads rather than leaving a total it cannot
vouch for. The form and Update cart button are untouched, so the page still
works with JS off.

**Verified:** extracted JS passes `node --check`, no Liquid leaked into the
block, all eight hooks present in markup. **Not verified:** not opened in a
browser.

---

## 2026-10-01 — Cart quantity steppers; equal card buttons

**Task:** make View and Buy now equal width; add +/- to the cart quantity column.

**Shipped.**

| Change | File(s) |
| --- | --- |
| Both card buttons `flex: 1 1 0` — equal halves from a zero basis | `assets/pages.css` |
| `.cart__stepper` with -/+ around the quantity input | `sections/main-cart.liquid` |
| Qty grid column 84px -> 124px; native spinners suppressed | same file |
| Stepper JS driving the existing cart form | same file |

The steppers write into the same `updates[]` field the form already posts and
click the real Update cart button — not a parallel `/cart/change.js` path that
could disagree with it. `click()` rather than `form.submit()`, because
`submit()` drops the button's name and Shopify needs `update` to act on
`updates[]`. Minus stops at 1 and disables there: 0 deletes the line, and
Remove is in the same row for that.

**Verified:** extracted `{% javascript %}` block passes `node --check` and
contains no Liquid; section CSS and `pages.css` braces balanced.
**Not verified:** not opened in a browser.

---

## 2026-10-01 — Buy now: collection only, photo click, width fix

**Task:** keep Buy now on the collection page only (homepage keeps View alone),
make the card photo add to cart too, and fix the squashed button row.

**Shipped.**

| Change | File(s) |
| --- | --- |
| Homepage grid reverted to View only | `sections/shop.liquid` (back to `eb5aba1`) |
| Photo click adds to cart, plain left click only | `sections/main-collection.liquid`, `assets/shop-ux.js` |
| `width: auto` inside `.pcard__actions` | `assets/pages.css` |

**The width bug:** `.pcard__btn` has `width: 100%` — it was the card's only
button. Two of them in a flex row both claimed the full card width as their
basis, so `flex: 0 0 auto` on Buy now held 100% and crushed View to "VIE…".

**Photo click** keeps the real `href` and only intercepts an unmodified left
click, so ctrl/cmd/middle-click, crawlers, screen readers and no-JS all still
reach the product page.

**Verified:** `node --check` passes; CSS braces balanced; homepage card is
byte-identical to before the Buy now work; collection card carries exactly one
of each attribute. **Not verified:** not opened in a browser.

---

## 2026-10-01 — Buy now button on product cards

**Task:** add a Buy now button next to View on the product grid, going to the
cart, for impulse buyers.

**Shipped.**

| Change | File(s) |
| --- | --- |
| `.pcard__actions` row with View + Buy now | `sections/shop.liquid`, `sections/main-collection.liquid` |
| Delegated `[data-buy-now]` handler: add variant, then go to `/cart` | `assets/shop-ux.js` |
| Action-row styling; stacks below 560px | `assets/pages.css` |

One-click add only when the product has a single available variant — with
options to choose, the button links to the product page instead of guessing a
variant. Goes to `/cart` rather than the existing drawer: this button is for
someone who has decided, and the cart page leads to checkout.

Handles `/cart/add.js` refusals (sold out, stock taken between render and
click) by restoring the button instead of navigating to a cart that never
received the item.

**Verified:** JS passes `node --check`; CSS braces balanced; both grids carry
exactly one button each. **Not verified:** not opened in a browser.

**Open question:** "on image clicking it should got to cart" was read as the
Buy now button going to the cart. The card image still opens the product page.

---

## 2026-10-01 — Product trust badges: 3 to 5

**Task:** expand the badges under Add to Ritual to five, ordered by strength of
proof, on all products.

**Shipped.** `sections/main-product.liquid` — three hardcoded list items became
five editable `trust_badge_1..5` settings, rendered in order:

| # | Default | Basis |
| --- | --- | --- |
| 1 | Pharmacist-formulated | existing |
| 2 | Hand-numbered | existing |
| 3 | Made in Houston | existing |
| 4 | Free shipping over $[threshold] | reads the real `free_shipping_threshold` setting |
| 5 | Easy returns | policy claim, per the brief |

`[threshold]` is substituted at render time from the same setting the cart's
free-shipping bar uses, so the two can't disagree. If it is 0, the badge is
skipped rather than printed as "over $0".

**Not added, deliberately:** "Fragrance-free" — the theme's own copy claims it
for Veil and Aura only, not Velvet, so it would be false as a site-wide badge.
"Dermatologist-tested" — unsubstantiated anywhere in the repo. Both slots are
editable if the client can stand behind them.

**Verified:** schema parses; render simulated at threshold 120 (5 badges) and
0 (4 badges). **Not verified:** not opened in a browser.

---

## 2026-10-01 — Google Analytics 4 installed

**Task:** add the GA4 tag (G-H1EZ7GHQX3) to every page.

**Shipped.** `layout/theme.liquid` — gtag.js immediately after `<head>`, per
Google's instructions. One layout covers every storefront page.

Added `{%- unless request.design_mode -%}` around it, which Google's snippet
does not include: the theme editor loads the storefront in an iframe, so
without it every edit fires a real pageview.

**Verified:** exactly one `gtag('config'` exists in the theme — a second
Google tag on a page breaks measurement.

**Flagged, not assumed:**
- If GA4 is also connected through Shopify's Google & YouTube channel or a
  Customer Events pixel on the same property, pageviews will double-count.
  Check Settings > Customer events.
- Nothing records until the storefront password is removed.
- Checkout is not covered — a theme layout does not render there.

---

## 2026-10-01 — Footer copyright updated

**Task:** change "2025 The Chemist Pharmacy" to "2026 Chemistrie", in all footers.

**Shipped.** `sections/footer.liquid` — `copyright_line` default is now
"© 2026 Chemistrie – Designed and Developed by Techinfinity . All rights
reserved."

One footer section renders on every page and nothing stores an override, so
one edit covers the whole site. The Techinfinity link still works — it is
matched as a substring, not by splitting the line.

**Left alone:** "The Chemist Pharmacy" in Zach's bio on the Pharmacists page
(2 places) — that is the pharmacy he worked at, not branding.

---

## 2026-10-01 — Hero redesign REVERTED

**Task:** put the homepage hero back.

**Shipped.** `assets/chemistrie.css` and `sections/hero.liquid` restored to
`b38d169` — byte-identical to the state before the redesign, verified with
`git diff`. The two entries below describe work that is no longer live.

Why it failed: the centred stack deployed fine, but at `clamp(42px,7vw,104px)`
the headline was roughly five times the deck's size, so the deck read as a
caption rather than as a second level. The reference tolerates that ratio
because its headline is a heavy sans on far more empty space.

**Known issue reintroduced by the revert:** the legacy
`.hero__title { font-size: clamp(64px, 14vw, 200px) }` under `max-width: 1024`
is live again between 761 and 1024px — a ~143px headline at tablet width. Left
in deliberately; restoring means restoring. One-line fix available on request.

---

## 2026-10-01 — Hero stripped to type + button (second pass)

**Task:** first pass read as "no major difference" — go further.

**Shipped.**

| Change | Detail |
| --- | --- |
| Trust strip + photo moved out of the hero band | new `.hero__below` wrapper in `sections/hero.liquid` |
| `.hero__inner` padding | `clamp(48px,9vw,130px)` top / `clamp(44px,7.5vw,104px)` bottom |
| `.hero__title` | `clamp(38px,5.4vw,78px)` -> `clamp(42px,7vw,104px)` |
| `.hero__cta-primary` | padding 13/26 -> 16/34 |
| `.hero__trust` | lost its `border-top`; gap opened to 24-56px |

Ruled out first: the change *was* pushed, nothing in the later-loading
stylesheets overrides `.hero__inner`, and both `index.json` and
`page.home.json` use the same section. The gap was that keeping the photo and
stats inside the band left it crowded no matter how it was aligned.

**Verified:** braces balanced; one definition each of the hero blocks; div
tags balanced 16/16. **Not verified:** not opened in a browser.

---

## 2026-10-01 — Homepage hero rebuilt as a centred stack

**Task:** redesign the homepage hero to match a supplied reference, without
changing the site's colours or content.

**Shipped** — CSS only, no markup change.

| Change | Detail |
| --- | --- |
| `.hero__inner` | `1fr 1.15fr` split -> one centred column |
| `.hero__copy` | centred, `text-align: center`, max 940px |
| `.hero__title` | centred; `clamp(36px,4.6vw,66px)` -> `clamp(38px,5.4vw,78px)` |
| `.hero__deck` | 42ch -> 48ch, auto margins |
| `.hero__cta-row`, `.hero__trust` | centred; trust gap opened to 18-30px |
| `.hero__stage` | full-width band under the copy, capped at `--maxw` |
| **Removed** 3 legacy `.hero__title` size rules | see below |

Colours untouched — the hero was already cream-on-forest with a tan pill,
the same roles as the reference. All content kept, photo included; it moves
below the centred copy rather than being dropped.

**Bug found and fixed in passing:** a legacy `.hero__title { font-size:
clamp(64px, 14vw, 200px) }` under `max-width: 1024` was live between 761 and
1024px — a 143px headline at tablet width. Two sibling rules at 640 and 380
were dead (beaten by the later 760 rule). All three removed.

**Verified:** braces balanced; no legacy title rules remain; remaining hero
rules in media queries checked for conflicts with the centred layout.
**Not verified:** not opened in a browser.

---

## 2026-10-01 — 404s redirect to the homepage

**Task:** make CTAs and pages that 404 go to the homepage instead.

**Shipped.**

| Change | File(s) |
| --- | --- |
| `redirect_home` checkbox (default on) + `location.replace()` hop to `/` | `sections/main-404.liquid` |

**Link audit result: the theme has no dead internal links.** Three suspects
checked and cleared — a JS-concatenated `/products/` path, an empty CTA URL
that already falls back to the collection route, and three anchor CTAs whose
target ids all exist.

**Could not verify store-side resources:** the Shopify connector is attached to
a different store (`0ww0zm-c1.myshopify.com`), not Chemistrie. Best signal
available: `/pages/faq` and `/pages/shipping-returns` are linked from the
footer and are the only `/pages/*` links with no matching theme template.
Confirm those exist in admin.

**Verified:** schema parses; redirect guarded against a self-loop; 404 page
left intact as the no-JS fallback. **Not verified:** not opened in a browser.

**Caveat:** a theme cannot set a status code, so this is a client-side hop.
Search engines still get a 404 for the dead URL, and blanket 404-to-home is a
soft-404 pattern Google penalises. Real moves belong in Admin > Navigation >
URL Redirects as 301s.

---

## 2026-10-01 — Ship-date promise removed from pre-orders

**Task:** remove "Your ritual ships from 8 October 2026." from ritual bundles.

**Shipped.**

| Setting | Was | Now |
| --- | --- | --- |
| `preorder_note` (under the buy button) | "Pre-order now. Your ritual ships from 8 October 2026." | "Pre-order now." |
| `preorder_property` (cart line + order record) | "Pre-order. Ships from 8 October 2026" | "Pre-order" |

Both in `sections/main-product.liquid`. The date was in two places, not one —
the cart-line property repeated the same promise after checkout started.
`preorder_until` (2026-10-07) left alone: that switches pre-order mode on and
off, it is not shown to customers.

**Verified:** schema parses; no stored override in any template or
`settings_data.json`, so the defaults are what render; grep confirms no
"ships from" or "8 October" left anywhere in the theme.

---

## 2026-10-01 — Portrait image in the Founder's Circle Purpose block

**Task:** use the supplied portrait image in the Purpose section.

**Shipped.**

| Change | File(s) |
| --- | --- |
| New `founders-purpose.jpg` (1172x1342, 289KB, from a 2137KB PNG) | `assets/` |
| `intro_image_asset` default repointed to it | `sections/founders-circle-content.liquid` |
| Slot reshaped landscape -> portrait: row height now content-driven, media gets `aspect-ratio: 1172/1342` at `clamp(240px,27vw,340px)` | same file |
| Mobile frame `width: min(300px,72vw)` centred instead of full-width stretch | same file |

The slot was a fixed 300-420px landscape band with `object-fit: cover`. A
portrait image in it would have had its title cropped off the top, so the
frame had to change shape, not just filename.

**Verified:** schema parses, `intro_image_asset` default is the new file, asset
exists on disk. **Not verified:** not opened in a browser.

---

## 2026-10-01 — Tablet navbar fixed

**Task:** the navbar was broken at tablet width — wordmark colliding with the
first link, labels wrapping to two lines, cart running off the right edge.

**Shipped.**

| Change | File(s) |
| --- | --- |
| Mobile drawer breakpoint `900px` → `1100px` | `assets/pages.css` |
| Compact nav sizes moved from `max-width:1024` (dead, inside the drawer band) to `max-width:1280` | `assets/chemistrie.css` |
| `.nav` gains `column-gap: clamp(16px,2vw,32px)` — the `1fr auto 1fr` grid could squeeze its outer tracks to zero | `assets/chemistrie.css` |
| `.nav__links a` gains `white-space: nowrap` | `assets/chemistrie.css` |

Root cause: the drawer activated at ≤900px, so **901–1024px** laid out the full
horizontal nav — a ~200px wordmark, five uppercase links and four action
controls — with nowhere near the room. Separately, the "compact nav" sizes were
written at `max-width:1024`, entirely inside the drawer band, so they had never
applied to a horizontal nav at all.

**Verified:** both stylesheets parse with balanced braces; no duplicate
selector blocks introduced; drawer markup and JS already existed and are
untouched. **Not verified:** breakpoints were derived from hand-computed text
widths, not measured in a browser. Worth a look at 1101–1280px.

---

## 2026-10-01 — Journal category pills made non-clickable

**Task:** make the Journal filter buttons not clickable.

**Shipped.**

| Change | File(s) |
| --- | --- |
| Pills render as `<ul>/<li>` instead of `<a>`; new `filters_clickable` checkbox (default off) | `sections/journal-grid.liquid` |
| `.jgrid__filters--static` — no marker, `cursor: default`, hover response neutralised | same file |

The pills were built from a hardcoded category list rather than the blog's
real tags, so most linked to an empty `/tagged/…` listing. Static state uses
a list, not a `<nav>`, so screen readers aren't given a navigation landmark
with nothing navigable in it.

**Verified:** schema parses, `filters_clickable` defaults false; `blog.json`
stores no override, so the off state is what renders. No anchors remain in
the static branch. **Not verified:** not opened in a browser.

---

## 2026-10-01 — Founder's Circle hero copy restored

**Task:** the Founder's Circle hero content was missing.

**Shipped.**

| Change | File(s) |
| --- | --- |
| `eyebrow` and `heading` restored from commit `51e5088` | `templates/page.founders-circle.json` |
| Eyebrow and `<h1>` now `blank`-guarded like the deck and CTAs beside them | `sections/page-hero.liquid` |

Root cause: commit `10d92a7` blanked both settings when the designed banner
went in, but the section rendered those elements unconditionally — so the
page kept an empty span's line-height, an empty `<h1>`'s margins, and an
empty `<h1>` in the markup.

**Verified:** all six `page-hero` templates audited — each has both fields,
so the guard is protection for future edits, not a visible change.

**Open for the user:** the restored heading now duplicates the text set into
the banner artwork on the right. A text-free crop of the banner for the hero
visual would resolve it; not done, because the banner on the hero was an
explicit request.

---

## 2026-10-01 — Footer studio credit linked

**Task:** make "Techinfinity" in the footer link to https://www.techinfinity.io/.

**Shipped.**

| Change | File(s) |
| --- | --- |
| New `credit_name` / `credit_url` settings; credit linked by substring replace | `sections/footer.liquid` |
| `.footer__credit` underline + hover; mobile tap padding narrowed to `:not(.footer__credit)` | `assets/chemistrie.css` |

Opens in a new tab (`target="_blank" rel="noopener"`). The copyright line
stays a single editable text setting — blanking either credit setting
renders it as plain text instead of breaking.

**Verified:** schema JSON parses; substring replacement simulated against the
exact default copyright string. **Not verified:** not opened in a browser.

---

## 2026-10-01 — Image delivery: weight and priority

**Task:** make site images load fast on page load; use the supplied
Founder's Circle banner in that page's Purpose block.

**Shipped** — commit `d26cc54`, pushed to `main` (auto-deploys).

| Change | File(s) | Result |
| --- | --- | --- |
| 3 pillar + 20 gallery photos re-encoded PNG → JPEG q85 | `assets/` | 16.1 MB → 2.1 MB |
| 4 oversized stock JPEGs re-encoded q82 | `assets/` | −9% each |
| References rewritten `.png` → `.jpg` | `product-gallery-images.liquid`, `pillars.liquid`, `story.liquid`, `index.json` | 29 refs |
| Page hero un-lazied, `fetchpriority="high"` | `page-hero.liquid` | LCP discovered at parse time |
| Header logo un-lazied | `header.liquid` | — |
| `fetchpriority="high"` on home/journal/article heroes, product gallery | `hero.liquid`, `journal-hero.liquid`, `main-article.liquid`, `main-product.liquid` | — |
| First 3 grid cards eager via `forloop.index <= 3` | `shop.liquid`, `main-collection.liquid` | first row no longer deferred |
| `preconnect` + `dns-prefetch` to `cdn.shopify.com` | `layout/theme.liquid` | DNS/TLS off the hero's critical path |
| Purpose block → `hero-founders-circle.jpg` via new `intro_image_asset` setting | `founders-circle-content.liquid` | — |

**Total theme image weight: 24.3 MB → 9.5 MB (−61%).**

**Verified:** script-checked that every image filename quoted in
`sections/`, `snippets/`, `layout/`, `templates/` and `config/` resolves to a
real file in `assets/` after the rename — no broken references. Per-file
alpha check before converting confirmed every PNG was fully opaque.

**Not verified:** nothing was opened in a browser. The theme needs store
auth from this machine, so the visual result of the re-encodes and the
measured load improvement are unconfirmed.

**Deliberately not done:** eager-loading every image on the site, which is
the literal reading of the request. Below-the-fold images stay lazy —
making them eager would make the hero slower, not faster, by splitting the
browser's early connections across images nobody has scrolled to.

**Still open (user-side):**
- Fill the 12 bundle pickers on the **gift page** (Ritual page is done).
- Set the GoHighLevel webhook URL on the Ritual Finder section.
- Fix the Q5 "Nothing else" dead-end in GoHighLevel.
- Upload approved images to the bundle products in Shopify admin — the
  theme-side fix covers the storefront only; checkout, emails and admin
  still show Shopify's placeholders.
