<div align="center">

# Luxe Ecommerce Store — Backend

**A production-grade REST API for a multi-vendor ecommerce platform, built with NestJS 11, TypeORM, PostgreSQL, and Stripe Connect.**

[![NestJS](https://img.shields.io/badge/NestJS-11-ea2845?logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License: UNLICENSED](https://img.shields.io/badge/license-UNLICENSED-lightgrey)](#license)
[![Swagger](https://img.shields.io/badge/API-Swagger-85ea2d?logo=swagger&logoColor=black)](#-api-documentation)

Multi-vendor sellers · JWT + Google OAuth · Stripe Connect onboarding · Cloudinary media · OpenAPI 3 docs · Rate limiting · Helmet + HPP · Serverless-ready

</div>

---

## ✨ Features

- 🔐 **Authentication** — email/password (bcrypt) + Google OAuth 2.0, JWT in `httpOnly` cookies, password reset flow with one-time tokens
- 👥 **Role-based authorization** — `USER`, `SELLER`, `ADMIN` via a custom `@Roles` decorator + `RolesGuard`
- 🏪 **Multi-vendor stores** — sellers own a one-to-one store, manage their own products, tags, and orders
- 🛍️ **Catalog** — products with image/video media, tags (many-to-many), filtering, pagination
- 🛒 **Cart & orders** — per-user cart, order creation, per-item fulfillment status for sellers
- ⭐ **Reviews** — verified buyers only, 1–5 star ratings, optional media uploads, automatic rating aggregation
- ❤️ **Favorites** — add/remove products, list favorite IDs and full products, per-product favorite count
- 💳 **Payments** — Stripe Connect Express seller onboarding with a one-time registration fee
- 📧 **Transactional email** — Nodemailer for password resets, branded HTML templates
- 🖼️ **Cloudinary integration** — server-side image/video upload, replacement, deletion, and Google avatar proxying
- 🛡️ **Security** — Helmet, HPP, CORS allow-list, global `ValidationPipe` with whitelist + transform, request-size caps
- 🚦 **Rate limiting** — `@nestjs/throttler` with two tiers (short burst + long, per-route opt-out)
- 📚 **OpenAPI 3 docs** — Swagger UI at `/docs`, JSON spec at `/docs/json`
- 🩺 **Health endpoint** — `GET /healthz` for platform probes
- ☁️ **Serverless-ready** — Vercel-compatible wrapper in [api/index.ts](api/index.ts)

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js ≥ 20 |
| Framework | [NestJS 11](https://nestjs.com) |
| Language | TypeScript 5.7 |
| ORM | [TypeORM 0.3](https://typeorm.io) (autoLoadEntities) |
| Database | PostgreSQL 16 (Supabase recommended) |
| Auth | `@nestjs/jwt`, `@nestjs/passport` (Local + JWT + Google OAuth 2.0 strategies) |
| Validation | `class-validator`, `class-validator` whitelist pipes |
| File uploads | `multer` → Cloudinary |
| Payments | Stripe (`stripe` SDK, Connect Express) |
| Email | Nodemailer (Gmail SMTP or any provider) |
| Media | Cloudinary |
| Rate limiting | `@nestjs/throttler` |
| API docs | `@nestjs/swagger` + Swagger UI |
| Deployment | Render · Railway · Fly.io · Vercel (serverless) |

---

## 🗂️ Project Structure

```
src/
├── main.ts                  # Bootstrap (HTTP listener)
├── app.module.ts            # Root module: Config, TypeORM, JWT, Throttler, modules
├── api/index.ts            # Vercel serverless entry (Express + NestFactory)
│
├── auth/                    # JWT, local, Google strategies + guards
│   ├── strategies/          # jwt.strategy.ts, local.strategy.ts, google.strategy.ts
│   ├── guards/              # jwt-auth, local-auth, google-auth, roles
│   ├── dto/                 # CreateUser, ValidateUser, ResetPassword DTOs
│   ├── entities/            # ResetToken (one-time password reset)
│   └── subscribers/         # User.subscriber (bcrypt hash on insert)
│
├── user/                    # User entity (UUID PK, role enum, profile picture)
├── store/                   # One-to-one store per seller
├── products/                # Catalog, media, tags
├── tags/                    # Many-to-many tag system
├── cart/                    # Per-user cart + items
├── orders/                  # Order + OrderItem with per-item status
├── reviews/                 # Verified-buyer reviews with media
├── favorites/               # User-product favorites
├── contact-information/     # Shipping/billing addresses (multiple per user)
├── payments/                # Stripe Connect seller registration
│
├── cloudinary/              # Cloudinary provider + service
├── mail/                    # Nodemailer wrapper + branded templates
├── interceptors/            # ResponseTransform, FileValidation
└── utils/                   # @Public, @Roles decorators
```

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL 14+** (a free [Supabase](https://supabase.com) project works great)
- A **Cloudinary** account
- A **Stripe** account (test mode is fine)
- A **Google Cloud** OAuth client (for the Google sign-in flow)
- A **Gmail** account with an [App Password](https://myaccount.google.com/apppasswords) (or any SMTP)

### 2. Install

```bash
git clone https://github.com/shahzaibalijamro/mastering-nestjs.git
cd mastering-nestjs
npm install
```

### 3. Configure environment variables

Create a `.env` file at the project root (this template matches every variable the app reads):

```env
# --- Server ---
NODE_ENV=development
PORT=3000

# --- Database (use the Supabase "pooler" URL) ---
DB_URL=postgresql://postgres.PROJECTREF:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# --- Auth ---
JWT_SECRET=replace-with-a-long-random-string
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:3001

# --- File uploads (Cloudinary) ---
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MULTER_DEST=./uploads

# --- Email (Nodemailer / Gmail example) ---
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# --- Stripe ---
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# --- Rate limiting ---
SHORT_LIMIT=100
SHORT_LIMIT_DURATION=900000
LONG_LIMIT=5
LONG_LIMIT_DURATION=3600000
```

> ⚠️ **Never commit `.env`.** It's already in `.gitignore`, but if you ever committed it, **rotate every secret**.

### 4. Run

```bash
# Development (hot reload)
npm run start:dev

# Production build + run
npm run build
npm run start:prod
```

The API will be at **http://localhost:3000**, with interactive docs at **http://localhost:3000/docs**.

---

## 📜 NPM Scripts

| Script | What it does |
|---|---|
| `npm run build` | Compiles TypeScript to `dist/` via `nest build` |
| `npm run start` | Runs the compiled app via `nest start` |
| `npm run start:dev` | Hot-reload dev server |
| `npm run start:debug` | Dev server with the Node inspector attached |
| `npm run start:prod` | Runs `node dist/src/main.js` |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier write across `src/` and `test/` |
| `npm test` | Unit tests with Jest |
| `npm run test:watch` | Jest watch mode |
| `npm run test:cov` | Jest with coverage |
| `npm run test:e2e` | End-to-end tests |

---

## 📚 API Documentation

The full OpenAPI 3 spec is generated at runtime by `@nestjs/swagger` and exposed at:

- **Swagger UI** → `GET /docs`
- **JSON spec** → `GET /docs/json`

The app uses two decorators you should know about when reading the spec:

- `@Public()` — bypasses JWT authentication for that route (e.g. public product listings)
- `@Roles(UserRole.SELLER | UserRole.ADMIN | UserRole.USER)` — restricts a route to specific roles

Every successful response is wrapped by a global `ResponseTransformInterceptor`:

```json
{
  "data": { /* your payload */ },
  "timestamp": "2026-06-05T10:23:45.123Z"
}
```

---

## 🗺️ API Surface

> All routes are prefixed with the controller path. 🔒 = JWT required · 🌐 = public.

### 🔐 Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/auth/google` | 🌐 | Start Google OAuth 2.0 flow |
| `GET` | `/auth/google/callback` | 🌐 | OAuth callback, sets JWT cookie, redirects to frontend |
| `POST` | `/auth/signup` | 🌐 | Create account, returns `{ id, message }` |
| `POST` | `/auth/signin` | 🌐 | Local sign-in, sets `jwt` httpOnly cookie |
| `GET` | `/auth/verify` | 🔒 | Re-issue JWT, returns the current user |
| `GET` | `/auth/signout` | 🔒 | Clears the `jwt` cookie |
| `PATCH` | `/auth/update-password` | 🔒 | Update the current user's password (Form signup only) |
| `POST` | `/auth/reset-password-email` | 🌐 | Sends a 30‑min reset link via email |
| `PATCH` | `/auth/reset-password` | 🌐 | Resets password using the email link |

### 🛍️ Products — `/products`

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/products` | 🌐 | Paginated list with filters (tags, search, price) |
| `GET` | `/products/me` | 🔒 SELLER | List products for the current seller |
| `GET` | `/products/:id` | 🌐 | Get a single product |
| `POST` | `/products` | 🔒 SELLER | Create a product (multipart with up to 10 media files, 50 MB each) |
| `PATCH` | `/products/:id` | 🔒 SELLER | Update product fields |
| `DELETE` | `/products/:id` | 🔒 SELLER | Delete a product (cascades to media) |
| `DELETE` | `/products` | 🔒 SELLER | Bulk delete by IDs |
| `POST` | `/products/:id/media` | 🔒 SELLER | Add up to 9 media files |
| `PATCH` | `/products/:id/media` | 🔒 SELLER | Replace one media file by `cloudinaryPublicId` |
| `DELETE` | `/products/:id/media` | 🔒 SELLER | Delete media by `cloudinaryPublicId[]` |

### 🏷️ Tags — `/tags`

`GET /tags` and `GET /tags/:id` are public. `POST /tags`, `GET /tags/me`, and `DELETE /tags/:id` require the SELLER role.

### 🛒 Cart — `/cart` (🔒)

`GET /` · `POST /items` · `PATCH /items/:productId` · `DELETE /items/:productId` · `DELETE /` (clear)

### 📦 Orders — `/orders` (🔒)

- `POST /` — create an order for the authenticated user
- `GET /` — list the user's orders
- `GET /store` — SELLER — list orders containing items from your store (filter by `itemStatus`)
- `PATCH /store/items/:itemId/status` — SELLER — update fulfillment status of an order item
- `GET /:id` — get a single order

### ⭐ Reviews — `/reviews` (🔒 except `GET /check`)

- `POST /:productId` — multipart, optional media files, stars (1–5) + text
- `DELETE /:reviewId` — author or admin only
- `GET /check?id=...` — boolean: is the current user eligible to review this product?

### ❤️ Favorites — `/favorites` (🔒)

- `GET /` — full favorited products
- `GET /ids` — favorite product IDs only
- `GET /status/:productId` — `{ isFavorited, favoritesCount }`
- `POST /:productId` · `DELETE /:productId`

### 🏪 Store — `/store` (🔒 SELLER)

- `GET /` — get the current seller's store
- `PATCH /` — update store info + profile picture (multipart, 20 MB)

### 📇 Contact Information — `/contact-information` (🔒)

Standard CRUD: `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id`

### 💳 Payments / Sellers

- `POST /payments/register` — 🔒 — register and pay the seller registration fee via Stripe
- `POST /api/sellers/register` — 🔒 — same flow, alternative path used by the frontend "become-a-seller" page

### 📧 Mail — `/mail`

- `POST /send` — sends a templated email (Nodemailer)

### 🩺 Health

- `GET /healthz` — liveness/readiness probe

---

## 🏗️ Architecture Notes

- **Auto-loading entities.** `TypeOrmModule.forRootAsync` is configured with `autoLoadEntities: true` and `synchronize: true`, so each `@Entity()` class is automatically registered. **Turn `synchronize` off in production** and use migrations:

  ```ts
  synchronize: config.get<string>('NODE_ENV') !== 'production',
  ```

- **Global response envelope.** `ResponseTransformInterceptor` wraps every payload in `{ data, timestamp }`. Adjust at [src/interceptors/response-transform.interceptor.ts](src/interceptors/response-transform.interceptor.ts) if your client expects raw responses.

- **Two-tier throttling.**
  - `SHORT_LIMIT` / `SHORT_LIMIT_DURATION` — strict per-route, applied globally
  - `LONG_LIMIT` / `LONG_LIMIT_DURATION` — looser limit, opt-in per route
  - Auth-related routes use `@SkipThrottle()` to avoid blocking legitimate login flows

- **Serverless entrypoint.** [api/index.ts](api/index.ts) reuses an initialized Nest app across Vercel invocations via a module-scoped `isInitialized` flag to avoid repeated bootstraps on warm function instances.

- **Security headers.** Helmet + HPP are applied globally. Cookies are `httpOnly`, `secure` in production, and `sameSite: 'none'` in production (so cross-site OAuth callbacks work), `lax` in dev.

---

## 🧪 Testing

```bash
npm test               # unit tests
npm run test:cov       # with coverage
npm run test:e2e       # e2e (uses ./test/jest-e2e.json)
```

Tests use Jest + ts-jest and look for `*.spec.ts` files inside `src/`.

---

## ☁️ Deployment

The app is set up to deploy to:

- **Render / Railway / Fly.io** — run as a long-lived Node service
- **Vercel** — runs as a serverless function via the wrapper in [api/index.ts](api/index.ts)

### Render (recommended for this app)

| Field | Value |
|---|---|
| Source Code | `shahzaibalijamro/mastering-nestjs` |
| Name | `mastering-nestjs` |
| Language | `Node` |
| Branch | `main` |
| Region | `Oregon (US West)` (or Singapore, matching your DB) |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start:prod` |
| Health Check Path | `/healthz` |
| Instance Type | `Free` (test) / `Starter` (real) |

Add every variable from `.env` to **Environment** in the Render dashboard. **Rotate the secrets committed in your repo's history first.**

### Vercel (serverless)

`vercel.json` already points at [api/index.ts](api/index.ts) with `@vercel/node`. The free tier works for an MVP, but a real workload will hit cold starts and per-invocation memory limits. **Do not enable local file uploads in production** — Cloudinary is the source of truth for media.

### Database

The pooler URL pattern works for Supabase, Neon, or any Postgres reachable over TCP. For serverless platforms, always use the **pooler** URL (port `6543` for PgBouncer, or `5432` for Supavisor in transaction mode) — direct connections exhaust quickly.

---

## 🛠️ Troubleshooting

**`tenant/user postgres.<ref> not found` on Supabase.**
Your project is likely paused. Open Supabase → project → Restore. If the ref doesn't match, double-check the URL.

**Stripe webhook signature fails.**
Your webhook route needs the raw request body. Add a raw-body route before any global JSON parser, then verify with `stripe.webhooks.constructEvent(rawBody, sig, secret)`.

**Cookies not set over HTTPS.**
Production requires `secure: true` and `sameSite: 'none'`. If the browser still rejects, ensure `FRONTEND_URL` is the **exact** frontend origin (no trailing slash, no path).

**`Cannot change password of a Google account`.**
By design — Google sign-in users have no local password.

---

## 🔒 Security

- All passwords are hashed with **bcrypt** (cost factor 10)
- JWTs are short-lived (1 day) with a `tokenVersion` claim, so password changes invalidate every active session
- One-time password-reset tokens are **bcrypt-hashed** at rest, expire in 30 min, and are single-use
- All incoming payloads pass through `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })`
- Helmet, HPP, and a 10 KB JSON body limit are applied globally
- Multer file size limits are enforced per route (50 MB for product media, 30 MB for reviews, 20 MB for store avatars)
- CORS is allow-listed via `FRONTEND_URL` (no wildcards when `credentials: true`)

**If you ever leak a secret:** rotate it immediately, then purge the file from git history (`git filter-repo` or BFG). Treat the old value as permanently compromised.

---

## 📄 License

UNLICENSED — private project.

---

## 🙏 Acknowledgements

Built on top of the incredible [NestJS](https://nestjs.com) framework. See [docs.nestjs.com](https://docs.nestjs.com) for framework reference, and [Mau](https://mau.nestjs.com) for an opinionated NestJS-native deploy experience.
