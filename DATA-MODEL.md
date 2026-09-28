# Keystone Craft Studio — extraction notes

Source: `Keystone Craft Studio.dc.html` (single-file comp, no `<dc-import>`s)
+ 10 photographs in `assets/`. The zip's `uploads/` folder is the designer's
tooling (a UI/UX skill + reference screenshots) and is not part of the site.

## Identity

- **Business:** Keystone Craft Studio — handmade goods + creative workshops,
  Harrisburg, Pennsylvania. Tagline: "Crafted with *intention.* Made to inspire."
- **Fonts:** Young Serif (display), Hanken Grotesk (UI/body 400–700), Caveat
  (handwritten accents: "made by hand", "say hello", "Harrisburg, Pennsylvania").
- **Colours:** paper `#F3ECE1` (body, with a 3px dot texture), ink `#2B211B`,
  terracotta `#A64A28` (hover `#8C3C1F`), cream `#FBF7F0`, input `#FFFDF9`,
  sand `#E8DCCB` / `#E6DACA`, dashed rules `#D6C6B1`, borders `#CDBDA8`,
  text `#4A3D34` / `#5A4A3F` / `#6B5848`, moss panel `#3E4A36`, sage rule
  `#7C8B6A`, peach `#E3A27F`, gold `#E3C795`, error `#8E2B14` / border
  `#9E2F1B` / alert `#F6E1D8`+`#7A2A14`. Fully rounded pill buttons; organic
  mixed radii on images (e.g. `999px 999px 28px 28px`, `160px 28px 28px 28px`).
- **Missing-photo fills** (striped): clay, sage, ochre, oat.
- **Motion:** hero crossfade every 6.5s (1.6s fade + slow 1.06 zoom), gallery
  auto-drifts (0.35px/frame, seamless loop) and pauses on hover, focus,
  touch, the Pause button and reduced motion; hover lifts/zooms on cards.
- **Breakpoints (JS in comp → CSS here):** `>= 900px` desktop nav, shop
  sidebar, 2-column product page, 4-col featured grid; `< 900px` menu overlay
  + filter bottom sheet; `< 700px` 2-column product grid and sticky
  "Ask About This Product" bar on product pages; `>= 1100px` workshop panel
  overlaps the image.

## Routes

| Comp hash       | Route             | Sections |
|-----------------|-------------------|----------|
| `#/`            | `/`               | Hero (split or layered, 3-image crossfade, inset beadwork photo, dots), Featured pieces, Categories rail, Workshops preview, Gallery drift, Studio teaser, "Good to know" FAQ, Contact block |
| `#/shop`        | `/shop`           | Intro, sticky search/sort bar + result count, category sidebar (desktop) / bottom sheet (mobile), grid, skeletons while searching, no-results state |
| `#/product/:id` | `/shop/[slug]`    | Breadcrumb, gallery + thumbs + lightbox (keys, swipe), description, price/availability/materials (only when supplied), "Ask About This Product", visiting note, "More from {category}" |
| `#/workshops`   | `/workshops`      | Photo hero, alternating workshop list (status pill, Register / Ask), detail + registration form |
| `#/about`       | `/about`          | Heading, story, craft philosophy, 3 captioned photos, team (only when supplied), "Find us in Harrisburg" |
| `#/faq`         | `/faq`            | Search, topic chips, grouped accordions, empty state, "Still wondering?" |
| `#/contact`     | `/contact`        | Heading, contact block (details + moodboard photo + inquiry form), map |

## Real vs placeholder

**Real → seeded:** 3 hero photos (embroidery-hoop, studio-workspace,
crochet-flatlay) + beadwork inset; 8 gallery photos with their captions
(Workspace, At the bench, Stitching together, Textures, Hand-building,
Materials, Slow work, Finished pieces); About photos (studio-workspace,
jewelry-bench, supplies-flatlay, crochet-flatlay, embroidery-hoop);
workshops hero (workshop-painting); contact moodboard; the 2 answered FAQs
("How do I ask about a product?", "How do I register for a workshop?").

**Placeholder → seeded as unpublished drafts** (keeps the comp's deliberate
photo pairings, hidden until the studio names and publishes them):
4 categories ("Category one"…, "[Short descriptor]") and 4 workshops
("Workshop title 01"…, status "Date to be announced").

**Placeholder → not seeded at all:** the 12 products ("Product name 01"…),
studio story, philosophy quote, street address, hours, email, phone,
captions marked "[Caption]", team profiles, social links. The live site
hides each of these until supplied (the comp's own "renders only when
supplied" rule).

**FAQ:** 8 questions in 6 topics (Orders, Products, Workshops, Materials,
Pickup, Delivery); 6 answers pending → seeded with blank answers, shown with
a "the studio is confirming this answer" note. Home shows the four the comp
picks (o1, w1, m1, k1) via a `showOnHome` flag.

## Forms & validation (verbatim)

`EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`

**Inquiry (contact):** name required → "Please enter your name."; email
required → "Please enter your email so the studio can reply.", invalid →
"That email doesn't look quite right — check for a typo."; type ∈
product | workshop | general required → "Choose what your inquiry is about.";
ref optional; message trimmed ≥ 10 → "Add a short message (at least 10
characters)." Summary banner: "Please check N field(s) below." Failure:
"Your message couldn't be sent. Please try again in a moment." Success:
"Thank you, {first name}." … "You'll hear back at {email}."

**Workshop registration:** name → "Please enter your name."; email required
→ "Please enter your email so the studio can confirm.", invalid → as above;
workshop required → "Choose a workshop."; attendees 1–4 (default 1); message
optional. Success: "Request received." with next steps.

"Ask About This Product/Workshop" pre-fills type + ref and jumps to the form.
Errors re-validate live once shown; submit focuses the first invalid field.

## Feature flags (`data-props`)

- `heroLayout` split | layered (default split) → `settings.heroLayout`.
- `commerceMode` inquiry | cart (default inquiry) → **inquiry mode built**.
  The comp's cart variant has a permanently disabled Checkout ("activates
  when store backend + payments are connected"), so it is not reproduced.
- `showCmsNotes` → designer annotations, not reproduced.

## Simulated in the comp → real here

- Hash routing + in-memory state → real URLs + SQLite via REST API.
- `setTimeout(900)` "sent" → persisted inquiries/registrations with
  server-issued references and admin inboxes.
- Hardcoded product/workshop arrays → admin-managed catalogue; search,
  category filter and sort run on the API.
- Workshop date/duration/price/capacity "render only when supplied" → real
  nullable fields; capacity enforces spots left inside a transaction.
