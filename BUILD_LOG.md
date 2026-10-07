# Build Log — Chemistrie Theme

Running record of completed build tasks. Newest first.
Detailed reasoning and gotchas live in `memory.md`; this file is the
what-shipped-when summary.

---

## 2026-10-07 - Client documents applied (FAQ, Shipping & Returns, Contact, Ritual Finder results)

**Source:** five Word documents supplied by the client.

**Shipped (theme side).**

| Item | Files |
| --- | --- |
| FAQ page: 6 groups, 30 questions, closing CTA | `sections/faq-groups.liquid`, `templates/page.faq.json` |
| Shipping & Returns page: shipping (9 parts), returns (4 parts) | `sections/policy-content.liquid`, `templates/page.shipping-returns.json` |
| Contact page: hero, intro, 3 notes, Professional Inquiry option | `sections/contact-main.liquid`, `templates/page.contact.json` |
| Ritual Finder: personalised "why", secondary, skin note, starting point; ordered ritual list | `sections/gift-ritual-finder.liquid` |
| Claims aligned to the policy: proof stat, 2 product badges | `sections/proof.liquid`, `templates/index.json`, `sections/main-product.liquid` |

**Action needed from the user.** Create two pages in Shopify admin (FAQ,
handle `faq`; Shipping & Returns, handle `shipping-returns`) and assign the
matching templates. Both URLs are in the footer and were 404 before this.

**Footer.** Unchanged. The FAQ and Shipping & Returns buttons already point at
`/pages/faq` and `/pages/shipping-returns`; the user is creating those pages in
admin before anything else.

**Verified:** all 57 section schemas and 18 templates pass a cross-check (no
unknown settings, no empty defaults, block orders match); every source line is
present in the generated pages; 12,600 quiz answer combinations tested in node
with no empty output.

**Omitted on purpose:** chat mentions (no chat on the site); a dangling "We"
at the end of the returns document (the source is cut off).

**Open for the client:** Overall-skin-maintenance secondary line (not in the
brief), the rest of the returns policy, Cashmere/Aura order of use, cart
free-shipping threshold, product naming (Silken/Veil), pre-order wording on
the shipping page.

---

## 2026-10-06 — Pre-order stays on; ship-date tag removed

**Task:** show just "Pre-order" until the merchant changes it; fix the
"delivered in 2-3 days" confirmation text; apply to existing orders.

**Shipped.** `sections/main-product.liquid`:

| Setting | Before | Now |
| --- | --- | --- |
| `preorder_property` | Pre-order. Ships from 8 October 2026 | Pre-order |
| `preorder_enabled` | (none) | checkbox, default on, the real switch |
| `preorder_until` | default 2026-10-07, auto-expired | optional, no default |

**Not done, outside the theme:** the 2-3 days wording is not in the theme at
all; it comes from Shopify checkout / the confirmation email. Existing orders
cannot be edited from here. Admin steps given to the user.

---

## 2026-10-06 — Collection grid restored to five products

**Problem:** the collection page listed 12 products, seven of them bundles.

**Cause:** `8aec730` pointed the grid at the URL's collection (`all`, 12)
instead of `frontpage` (5) so sorting would work.

**Shipped.** `sections/main-collection.liquid` — grid skips products outside the
"Collection to display" setting; new `limit_to_collection` checkbox (default
on). Sorting still runs on the URL collection.

**Verified:** schema parses, no empty defaults, loop/if tags balanced.

---

## 2026-10-06 — Ritual Finder result: image left, contents right

**Task:** on the final result screen, move the image left and list the
bundle's products on the right.

**Shipped.** `sections/gift-ritual-finder.liquid`:

- New `.gfinder__result-grid` — `1.25fr 1fr`, one column below 760px.
- New `.gfinder__includes` column: eyebrow "In this ritual" plus a ruled list
  of each product's name and subtitle.
- List built from `res.items`, the same array the add-to-cart call uses, so it
  cannot disagree with what goes in the bag.

The lineup photo alone never said which bottles were in the set — the labels
aren't legible at that size.

**Verified:** schema parses, no empty defaults, div/ul tags balanced, and the
inline JS passes `node --check` with Liquid neutralised.

---

## 2026-10-06 — Hero headline/subhead gap: an invisible empty row

**Task:** reduce the space between the hero headline and subheadline.

**Cause:** a third `.hero__title-row` was rendering with an empty `<em>` —
~66px of dead space at 66px/line-height 1.

**Two faults, both mine:**

1. The guard tested `!= blank`; Liquid only counts `nil`/`""` as blank, so a
   stray space or newline passed it. All four title fields are now `| strip`-ed
   before testing.
2. **`sections/hero.liquid` had not deployed since `73dea8e`** — its schema
   carried `"default": ""` on `title_em_accent`, the same invalid pattern that
   silently blocked `main-product.liquid`. The new headline *looked* live only
   because copy lives in `templates/index.json`, and templates aren't
   schema-validated.

**Swept every section and snippet schema** for empty-string defaults — all
clean and parsing now.

---

## 2026-10-06 — Collection sorting fixed (it was doing nothing)

**Task:** default the collection page to Best selling instead of A-Z.

**Bug found and shipped.** `sections/main-collection.liquid` rendered the grid
from `section.settings.collection` (set to `frontpage` by Shopify admin) while
the sort toolbar read the URL's `collection`. `?sort_by=` only re-sorts the URL
collection, so **no sort choice changed the grid**. Now both use the same
object, with the section setting as the fallback.

**The default itself is an admin setting, not a theme one.**
`collection.default_sort_by` lives on the collection in Shopify admin
(Products > Collections > [collection] > Sort > Best selling). Liquid has no
sales data to sort by, so the theme cannot do it; the only code route is a
redirect to `?sort_by=best-selling`, which adds a hop on every first visit and
muddies canonical URLs.

---

## 2026-10-06 — Claim tags above each product name

**Task:** three short, genuine tags per product, above the name.

**Shipped.** `sections/main-product.liquid`:

| Product | Tags |
| --- | --- |
| Velvet | NON-STRIPPING · SENSITIVE-SAFE · NO FILM |
| Veil | WEIGHTLESS · ABSORBS IN SECONDS · FRAGRANCE-FREE |
| Cashmere | MAKEUP-READY · LAYERS UNDER SPF · EVERYDAY LIGHT |
| Aura | NATURALLY BLUE · COPPER PEPTIDES · FRAGRANCE-FREE |
| Silken | SCAR CARE · BREATHABLE · BOTANICAL OILS |

Every tag restates a line already in that product's copy. Fragrance-free is on
Veil and Aura only — the two that state it.

**Styling corrected after first attempt.** Sage on a hairline border measured
**2.95:1** contrast, below the 4.5:1 floor for small text — genuinely hard to
see. Now forest on `--c-tan` for the first tag (5.62:1) and on `--c-tan-3` for
the rest (8.96:1), 600 weight.

---

## 2026-10-01 — Review badge shows 4.96 (and why it took four pushes)

**Verified live** on Veil, Aura and Velvet: `★ 4.96`, linking to the reviews
section.

**Root cause of the delay:** `"default": ""` on the `fallback_rating_count`
setting. An empty string is not a valid schema default. Shopify validates a
section's schema on upload, keeps the last valid version when it fails, and
reports nothing back — so the push succeeded, the commit was on `origin/main`,
and the storefront quietly kept serving `sections/main-product.liquid` from
two commits earlier while every other file deployed normally.

**How it was found:** `curl` + `grep` on the raw HTML, not WebFetch's markdown.
The live page still had the class `mprod__reviews-stars` (plural) from commit
`0751ab3`, which pinned the deployed file to an exact commit.

**Rule:** if one file's changes don't appear while others from the same push
do, validate that file's `{% schema %}` — don't wait and don't re-push.

---

## 2026-10-01 — Fixed dead product links (real 404s)

**Found while verifying something else:** `/products/aura` returns 404. The
real handles are full titles — `aura-advanced-renewal-cream`,
`velvet-foaming-facial-cleanser`, etc.

**Dead links fixed:**

| Where | Link |
| --- | --- |
| `sections/actives.liquid` | "Found in product: Velvet & Veil" on all six ingredient cards |
| `sections/ritual-shop.liquid` | card link + "View Velvet →" CTA |

**Shipped.** New `snippets/product-url-by-name.liquid` resolves a formula name
to the real product URL by matching the first handle segment (not `contains`,
so a name can't catch a bundle), falling back to the old short handle.

This is the answer to the earlier "CTAs that 404" request. That audit found
"no dead internal links" because it checked handles were *consistent*, not
that they *existed* — the store was password-protected so nothing could be
resolved. A link audit that never fetches a URL proves nothing.

The two Ritual Finder sections were already safe (they search
`collections.all.products`).

---

## 2026-10-01 — Review badge: rating number + star icon

**Task:** show the rating number with a star icon instead of the word
"Reviews", on all products.

**Shipped.** `sections/main-product.liquid`:

- Badge reads `product.metafields.reviews.rating` first, then falls back to a
  new `fallback_rating` setting (default `4.96`) and optional
  `fallback_rating_count`.
- `★` glyph replaced with an inline SVG star.
- `aria-label` added, since the badge is now an icon and a number with no
  explanatory text.

The fallback is a setting, not a literal: a reviews app takes over per product
automatically, the number is editable in one place, and clearing it hides the
badge rather than rendering an empty one.

**Note:** 4.96 is the site-wide average the trust strip already quotes, not a
per-product figure. Flagged before building; user asked for it.

**Verified:** schema parses, settings present, braces and div tags balanced.

---

## 2026-10-01 — Review jump button on product pages

**Task:** small review button top-right of the product block, linking to the
reviews section further down the page. All products.

**Shipped.**

| Change | File |
| --- | --- |
| `.mprod__eyebrow-row` — eyebrow left, review jump right | `sections/main-product.liquid` |
| `.mprod__reviews-jump` pill styling | same |
| `scroll-margin-top` on the reviews block | `sections/product-details.liquid` |

Shows the real rating from `product.metafields.reviews.rating` when the store
has one, and the word "Reviews" when it does not — no invented number. (The
4.96 elsewhere on the site is a site-wide average, not per product.)

The `#mprod-reviews` anchor already existed. `scroll-margin-top` keeps the
heading clear of the sticky nav; `html { scroll-behavior }` left as `auto`
because this theme has scroll-scrubbed sections a smooth scroll would fight.

**Verified:** section CSS braces balanced, schema parses, div tags balanced,
anchor target confirmed present.

---

## 2026-10-01 — Cart DRAWER checkout button (the one actually on screen)

**Task:** the centred/smaller checkout button still looked wrong.

**Cause:** there are two checkout buttons. The earlier fix hit the cart *page*
(`.cart__checkout`); the screenshot was the cart *drawer*
(`.drawer__checkout`, `assets/shop-ux.css`).

**Shipped.** `.drawer__checkout` now:

| | Before | After |
| --- | --- | --- |
| centring | `text-align: center` (inert on a flex button) | `justify-content: center` |
| width | `100%` | `auto`, `min-width: 190px`, `align-self: center` |
| padding / size | from `.btn` | `13px 34px` / 11.5px |

`text-align` could never have worked: `.btn` is `inline-flex`, so the label is
a flex item. And `.drawer__foot` is a flex column, where a child that sets a
width still stretches unless it sets `align-self`.

Both checkout buttons now match.

---

## 2026-10-01 — Section padding reduced ~30% site-wide

**Task:** reduce top/bottom empty space on all sections; push the founder
portraits down a little.

**Shipped.**

| Scope | Change |
| --- | --- |
| `--section-pad-y` (root) | `clamp(40px,6vw,80px)` -> `clamp(28px,4.2vw,56px)` |
| `--section-pad-y` @640px | `72px` -> `48px` |
| `--section-pad-y` @small | `clamp(32px,6vw,48px)` -> `clamp(24px,4.5vw,36px)` |
| 18 section-level paddings | cut ~30% each |
| `.founders__media` | `margin-top: clamp(14px,2.6vw,38px)` |

Files: `assets/chemistrie.css`, `assets/pages.css`, and the stylesheet blocks
in `closing-statement`, `journal-hero`, `main-article`, `proof`, `ritual-faq`,
`contact-main`, `pillars`.

The token alone was not enough — 18 declarations set their own vertical
padding and ignore it. Also caught a `72px` mobile override that was *larger*
than the shrunken desktop maximum, and an inline 120px spacer div on Contact
that no stylesheet could have reached.

**Verified:** braces balanced in both stylesheets and all seven section blocks.

---

## 2026-10-01 — Cart checkout button centred and shrunk

**Task:** centre the CHECKOUT label and make the button smaller.

**Shipped.** `sections/main-cart.liquid`:

| | Before | After |
| --- | --- | --- |
| width | `100%` | `auto`, `min-width: 190px`, centred with `margin: 18px auto 0` |
| padding | `16px 28px` (from `.btn`) | `13px 34px` |
| font-size | 12.5px | 11.5px |
| selector | `.cart__checkout` | `.cart__checkout.cart__checkout` |

`justify-content: center` was already declared and had no effect: the rule is
in a section stylesheet, which may load before or after `chemistrie.css`, and
at equal specificity with `.btn` the winner depends on load order. Doubling the
class settles it.

**Verified:** section CSS braces balanced, schema parses. Live check after sync.

---

## 2026-10-01 — Founder portraits named; layout rebuilt as a grid

**Task:** identify which founder is which; then remove the role line.

**Shipped** (live-verified on chemistrieco.com).

| Change | File |
| --- | --- |
| Each portrait wrapped in a `<figure>` with its name below | `sections/founders.liquid` |
| `.founders__media` absolute collage -> `1fr 1fr` grid, stagger via `margin-top` | `assets/chemistrie.css` |
| Photo `aspect-ratio: 4/5` instead of filling a fixed parent height | same |
| One column below 700px | same |
| Role line and `founderN_role` settings removed | both |
| Name clearance 14px -> 26px | `assets/chemistrie.css` |

Captions now read simply **Harin** and **Zach**.

Took three attempts. The absolute collage could not hold captions — a caption
is as wide as its figure and lands where the other oval sits — and shifting
the photos was tuning around a structural problem, since an absolute figure
has a fixed height while its contents do not.

**Flagged, not removed:** "Co-founders · Compounding Pharmacists" still appears
in the signature block under the body paragraphs (`sig_sub`), which is not the
line under the photos.

---

## 2026-10-01 — Ingredient cards: "Found in product(s):"

**Task:** add the word "product" to the "Found in:" label on the six
ingredient cards.

**Shipped.** `sections/actives.liquid` — label now reads "Found in product:"
for one product and "Found in products:" for more than one, driven by the
`found_items.size` already computed for the loop.

Pluralised because four of the six cards list a single product; a fixed
"products" would read as a slip on those.

**Verified:** schema parses, no hardcoded label remains, the row already
wraps so the longer label is safe. **Not verified in a browser yet** —
checking the live page after deploy.

---

## 2026-10-01 — Homepage: Shop and Ritual Finder swapped

**Task:** swap the Ritual Finder and collection sections on the home page.

**Shipped.** `templates/index.json` and `templates/page.home.json` — Shop now
sits above The Ritual Finder in both.

Matched by section `type`, not key: the keys differ between the two files
(`ritual_raGNG4` / `shop_jAJymM` vs plain `ritual` / `shop`). Only the `order`
array changed; no section settings touched.

New order: hero -> pillars -> **shop -> ritual** -> founders -> ...

**Verified:** both templates parse; assertion that `shop` now precedes
`ritual` passes in both. **Not verified:** not opened in a browser.

---

## 2026-10-01 — Hero gap closed, proof labels enlarged

**Task:** too much space between hero headline and subhead; labels under the
numbers too small.

**Shipped.**

| Change | From | To |
| --- | --- | --- |
| `.hero__copy` gap | `clamp(10px,1.3vw,16px)` | `clamp(6px,0.7vw,10px)` |
| `.proof__label` | 15.5px / 14.5px mobile | **19px / 17px** |
| `.proof__label` measure | 24ch | 26ch |
| `.proof__head` margin-bottom | `clamp(32px,4vw,52px)` | `clamp(24px,2.6vw,34px)` |

The hero title sets `line-height: 1`, so its last row adds almost no space of
its own — the flex gap was the entire distance to the deck. The proof labels
sit under 68px numerals, so at 15.5px they read as captions and got skipped.

**Verified:** braces balanced in both files; proof schema parses.
**Not verified:** not opened in a browser.

---

## 2026-10-01 — Hero copy rewritten for cold traffic

**Task:** replace the hero headline, subhead and CTA with ad-perspective copy
that says what the brand does.

**Shipped.**

| | New |
| --- | --- |
| Headline | Skincare formulated *by pharmacists.* / Five essentials. |
| Subhead | A simple daily routine of cleanser, serum, lotion and creams, made by licensed pharmacists. |
| CTA | Find your ritual -> `/pages/the-ritual` |

Applied in **both** `sections/hero.liquid` (schema defaults — `page.home.json`
stores none and falls through to them) and `templates/index.json` (stored
settings). The two had already drifted apart.

Also guarded the three `.hero__title-row` spans against being empty — the same
defect fixed earlier in `page-hero.liquid`. Clearing row 3 would otherwise have
left a ~100px hole under the headline.

**Verified:** hero schema and both templates parse; defaults and stored
settings both show the new copy. **Not verified:** not opened in a browser.

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
