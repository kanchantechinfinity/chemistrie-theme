# Build Log — Chemistrie Theme

Running record of completed build tasks. Newest first.
Detailed reasoning and gotchas live in `memory.md`; this file is the
what-shipped-when summary.

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
