# Status

Everything on the **public website**, the whole **backend API**, and all
**8 admin screens** (plus the optional change-password form) are now built.
Nothing in the admin sidebar is a placeholder anymore.

## 1. Admin screens — all built

- `/admin/inquiries` — filters (status/type/search), table, detail drawer
  with status + notes, delete. Supports the dashboard's `?open=<id>` link.
- `/admin/registrations` — filters (status/workshop/search), table, detail
  drawer with status + notes, delete.
- `/admin/products` — reorderable list, search, category filter, delete.
- `/admin/products/new` and `/admin/products/[id]` — full form (category,
  description, price, availability, materials, up to 8 images with upload,
  featured/published), with inline field errors from the API.
- `/admin/categories` — reorderable list with inline add/edit form,
  publish toggle, delete (surfaces the API's "still has products" message).
- `/admin/workshops` — reorderable list with inline add/edit form, shows
  booked/capacity/full status, publish toggle, delete.
- `/admin/content` — tabbed `ContentTypeEditor` instances for all six
  content types, including the read-only `slot` field on `site_image`
  (added a `readonly` field type to `ContentTypeEditor` for this).
- `/admin/settings` — full settings form (auto-prefixes `https://` on
  social links) plus a change-password section calling
  `POST /api/admin/auth/change-password`.

New shared helper: `lib/admin-errors.ts` (`errorInfo()`) normalizes the
two API error shapes — `{ message, errors: {field: msg} }` from custom
`BadRequestException`s, and the default NestJS ValidationPipe's
`{ statusCode, message: string[], error }` — into one `{ message, fields }`
result the forms can render inline.

## 2. Content the studio still has to supply

Unchanged from before — the site hides these, or shows an honest empty
state, until they're filled in through the admin screens above:

- Real category names and descriptions, then publish them.
- Products. The shop shows "New pieces are on the way" until some exist.
- Real workshop titles, descriptions and dates, then publish them.
- 6 FAQ answers.
- Studio story, craft philosophy, Home studio summary, address, hours,
  email, phone, map image, social links, team profiles, About photo captions.

## 3. Features deliberately not included

- **Cart and online checkout** — only inquiry mode is built (see prior notes).
- **Email notifications / auto-replies** — inquiries and registrations are
  saved but no email is sent.
- **Policies pages** (shipping, returns, privacy) — no design exists for them.

## 4. Not verified

- **No network access in this build environment** (same limitation noted
  previously) — `npm install` was blocked (`403` from the npm registry) in
  both `frontend/` and `backend/`, so `npx tsc --noEmit`, `npm run
  install:all`, and actually running/clicking through the apps were not
  possible here. Every new file was instead checked by hand against the
  existing type definitions (`lib/types.ts`), the shared UI helpers'
  exact prop signatures (`components/admin/ui.tsx`,
  `ContentTypeEditor.tsx`), and each admin endpoint's DTO in the backend
  (field names, nullability, validation rules) to catch mismatches without
  a compiler. The fractional-Tailwind-spacing grep check was run and is
  clean. Please run `npm run install:all`, `npx tsc --noEmit` in both
  folders, and click through the 8 admin screens once before relying on
  this in production.
- `Young_Serif` is loaded with `next/font/google`. If your Next.js version
  doesn't include it, switch to a `<link>` to Google Fonts in `app/layout.tsx`.
