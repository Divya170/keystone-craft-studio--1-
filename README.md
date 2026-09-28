# Keystone Craft Studio — full-stack rebuild

A dynamic rebuild of the "Keystone Craft Studio" design comp: a Harrisburg,
PA studio with handmade goods and creative workshops. Built with **Next.js**
(frontend), **NestJS** (backend) and **SQLite3** via TypeORM.

- `DATA-MODEL.md`: extraction notes (routes, real vs placeholder content,
  validation rules copied exactly from the comp).
- **`TODO.md`: what's still missing and has to be implemented later.**

## Structure

```
backend/     NestJS API (TypeORM + better-sqlite3)
frontend/    Next.js App Router site + admin
database/    app.sqlite is created here on first run
```

## Run it

```bash
npm run install:all
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run dev:backend      # http://localhost:4000/api
npm run dev:frontend     # http://localhost:3000
```

Admin: `http://localhost:3000/admin/login`. The account is created on
first boot and printed in the backend console:

```
Email:    admin@keystonecraftstudio.com
Password: keystone-admin-2026
```

Change `JWT_SECRET` in `backend/.env` before deploying.

## What's built

**Public site** (all pages): Home (split or layered hero, featured pieces,
category rail, workshops preview, auto-drifting gallery, studio teaser,
FAQ, contact block), Shop (search, category and availability filters, sort,
mobile filter sheet, skeleton / empty / error states), Product (gallery +
full-screen viewer, "Ask About This Product" that pre-fills the contact
form, related pieces, sticky mobile bar), Workshops (list, detail,
registration form), About, FAQ (search + topics), Contact, and a 404 page.

**Forms are real.** Inquiries and workshop registrations are validated on
the server with the comp's exact rules and error copy, saved to SQLite, and
answered with a reference number and a success card that offers a next
step. Registrations enforce workshop capacity inside a database
transaction.

**Backend**: every module and endpoint: settings, content (hero, fixed
site photos, gallery, About photos, FAQ, team), categories, products,
workshops, registrations, inquiries, dashboard and uploads. Seeding runs
once on first boot and never overwrites later edits.

**Admin**: login, sidebar layout and dashboard are built. The other admin
screens are placeholders; see `TODO.md`.

## Seeded on first boot

Real photography and copy only: 3 hero slides, 7 fixed site photos,
8 gallery images with their captions, 3 About photos, and 8 FAQ items
(2 answered, 6 pending). There are also 4 categories and 4 workshops with
the comp's photos, seeded **unpublished** because their names are
placeholders. No products are seeded: the comp's 12 products are numbered
placeholders.
