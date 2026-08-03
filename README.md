# Nirog — Full-Stack Pharmacy E-commerce

A full-stack online pharmacy platform built with **Next.js 14 (App Router)**, **PostgreSQL** (via **Prisma**), **NextAuth**, and payment integrations for **Stripe**, **bKash**, and **Nagad**.

This is an original build inspired by the *category* of product Arogga.com represents (an online pharmacy in Bangladesh) — it doesn't copy Arogga's code, design assets, or content, since those aren't public and aren't something I can reproduce. Branding, copy, and product data here are original/generic.

## Features

- Full category hierarchy — 12 top-level categories (Medicine, Beauty, Healthcare, Baby & Mom Care, Food & Nutrition, Homecare, Pet Care, Herbal, Sexual Wellness, Supplement, Veterinary, Homeopathy) with subcategories (Skincare, Haircare, Feminine Care, Medical Devices, Dermatological Preparations, Maternal Care) — 18 categories total
- Dedicated landing page per category (`/category/[slug]`) with its own banner color, description, and subcategory navigation — not just a filtered product grid
- Header mega-menu listing every category and subcategory
- Product catalog with categories, search, and filtering
- Cart (persisted client-side) and checkout flow
- User registration/login (NextAuth, credentials + bcrypt)
- Delivery address capture at checkout
- Prescription upload for Rx-only products, with pharmacist approve/reject workflow
- Order creation, tracking with status timeline, and order history
- Three payment methods: **Cash on delivery**, **bKash**, **Nagad**, and **card via Stripe**
- Admin panel: dashboard stats, product CRUD, order status management, prescription review

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Server Components + API routes) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (JWT sessions, credentials provider) |
| State | Zustand (cart, persisted to localStorage) |
| Styling | Tailwind CSS |
| Payments | Stripe SDK, bKash Tokenized Checkout API, Nagad Payment Gateway API |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up PostgreSQL

Create a local database (or use a hosted one — Supabase, Railway, Neon, etc. all work):

```bash
createdb nirog
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `DATABASE_URL` at minimum to get the app running. Payment provider keys are only required if you want to test that specific payment method (see **Payment gateways** below).

### 4. Run migrations and seed data

```bash
npx prisma migrate dev --name init
npm run seed
```

This creates the schema and seeds 14 sample products across 5 categories, plus two accounts:

- **Admin:** `admin@nirog.example` / `Admin123!`
- **Customer:** `customer@nirog.example` / `Customer123!`

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`. Visit `/admin` while signed in as the admin account to manage products, orders, and prescriptions.

## Payment gateways

Each gateway is real, working integration code — not a mock — but each needs credentials from the provider before it will actually process a payment.

### Stripe (card payments)
1. Create a free account at [stripe.com](https://stripe.com), grab your **test** keys from the dashboard.
2. Fill in `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. For webhooks locally, run `stripe listen --forward-to localhost:3000/api/payments/stripe/webhook` and paste the printed signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Note: this example bills in USD since most Stripe accounts can't settle in BDT directly — swap the currency/conversion logic in `src/lib/payments/stripe.ts` to match your actual settlement setup.

### bKash (Tokenized Checkout)
1. Register for sandbox access at [developer.bka.sh](https://developer.bka.sh) and get your sandbox app key/secret and username/password.
2. Fill in the `BKASH_*` variables in `.env`.
3. The flow (`src/lib/payments/bkash.ts`) follows bKash's documented grant → create → execute sequence.
4. Going live requires bKash's production approval process and swapping `BKASH_BASE_URL` to their production endpoint.

### Nagad
1. Nagad's onboarding issues you a merchant ID and an RSA keypair — you can't self-generate these; they come from Nagad directly during merchant registration.
2. Fill in `NAGAD_MERCHANT_ID`, `NAGAD_MERCHANT_PRIVATE_KEY`, and `NAGAD_PG_PUBLIC_KEY`.
3. `src/lib/payments/nagad.ts` implements the documented initialize → complete → verify flow with RSA signing/encryption. Before going live, validate it against Nagad's reference Postman collection with your real sandbox keys, since some implementation details (padding, encoding) can vary by merchant account type.

If you don't have credentials for a gateway yet, **Cash on delivery still works end-to-end** — it's the simplest way to test the full order flow while you wait on gateway approvals.

## File uploads (prescriptions)

Out of the box, prescription uploads are written to `public/uploads` on local disk (`src/app/api/upload/route.ts`). This is fine for local development but **won't persist across deployments** on platforms like Vercel. For production:

1. Set `UPLOAD_DRIVER=s3` in `.env`.
2. Install `@aws-sdk/client-s3`.
3. Fill in the `PutObjectCommand` TODO in `src/app/api/upload/route.ts` with your S3 (or R2, or Supabase Storage) bucket details.

## Project structure

```
prisma/schema.prisma       Database schema
prisma/seed.ts             Sample data + demo accounts
src/lib/                   Prisma client, auth config, payment integrations
src/store/cart-store.ts    Client-side cart (Zustand)
src/components/            Shared UI (Header, Footer, ProductCard, admin forms)
src/app/                   Pages and API routes (App Router)
  ├─ (storefront pages)    /, /products, /products/[slug], /cart, /checkout, /orders
  ├─ /login, /register     Auth pages
  ├─ /account/prescriptions
  ├─ /admin                Admin dashboard, product/order/prescription management
  └─ /api                  All backend routes
```

## Deployment notes

- **Vercel** is the easiest fit for the Next.js app itself. Use a managed Postgres (Neon, Supabase, Railway, or Vercel Postgres) since Vercel's filesystem is read-only in production — this is also why S3-based uploads matter for prescriptions in production.
- Run `npx prisma migrate deploy` against your production database as part of your deploy step.
- Set every variable from `.env.example` in your hosting provider's environment settings.
- Rotate `NEXTAUTH_SECRET` to a strong random value (`openssl rand -base64 32`) before going live — don't reuse the placeholder.

## What's deliberately left as a starting point, not finished

- Product images are placeholder icons, not real photos — wire up real image uploads/URLs via `Product.imageUrl`.
- No search-as-you-type, pagination, or product reviews UI yet — the schema (`reviewCount`) has room for it.
- No email/SMS notifications on order status changes — a good next addition (Resend, Twilio, etc.).
- No refund flow — `PaymentStatus.REFUNDED` exists in the schema but nothing triggers it yet.
