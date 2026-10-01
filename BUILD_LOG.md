# Build Log — Chemistrie Theme

Running record of completed build tasks. Newest first.
Detailed reasoning and gotchas live in `memory.md`; this file is the
what-shipped-when summary.

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
