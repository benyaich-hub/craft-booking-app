# Replit.md

## Overview

**Essence Services** is an Arabic-language mobile-first web application for booking home maintenance artisans/craftsmen. Think of it as an Uber-like marketplace connecting customers with plumbers, electricians, carpenters, painters, AC technicians, and general maintenance workers. The app is designed as a PWA (Progressive Web App) with RTL (right-to-left) layout support.

The platform has three user roles:
- **Customers** can browse categories, explore artisan profiles, view ratings/reviews, and book services
- **Artisans** can manage their profiles, accept/reject bookings, toggle online status, and track earnings
- **Admin** can access the admin dashboard at `/admin` to manage users, bookings, reviews, and view platform stats

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Structure
The project follows a monorepo structure with three main directories:
- `client/` — React frontend (SPA)
- `server/` — Express.js backend (REST API)
- `shared/` — Shared types and database schema (used by both client and server)

### Frontend
- **Framework**: React with TypeScript (no SSR, `rsc: false`)
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming, custom blue & gold/orange color scheme
- **Build Tool**: Vite
- **Fonts**: Cairo (Arabic) and Outfit (headings) from Google Fonts
- **Layout**: Mobile-first design constrained to `max-w-md` centered container, simulating a phone app. Bottom navigation bars differ by role (customer vs artisan)
- **Auth**: Client-side auth state stored in `localStorage` (no session cookies or JWT tokens on client). User object saved/cleared via helper functions in `lib/api.ts`

### Backend
- **Framework**: Express.js v5 on Node.js
- **Language**: TypeScript, run with `tsx` in development
- **API Style**: RESTful JSON API under `/api/` prefix
- **Auth**: Simple phone + SHA-256 hashed password authentication (no session management, no JWT — stateless, user data returned on login/register)
- **Build**: esbuild bundles server code to `dist/index.cjs` for production. Vite builds client to `dist/public/`

### Database
- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation
- **Schema Location**: `shared/schema.ts` — defines tables for `users`, `categories`, `artisan_profiles`, `bookings`, and `reviews`
- **Migrations**: Drizzle Kit with `drizzle-kit push` command (schema push approach, not migration files)
- **Connection**: `pg.Pool` in `server/db.ts`

### Key Database Tables
- **users** — id (UUID), name, phone (unique), password, role (customer/artisan), avatar, isOnline
- **companies** — id (UUID), name, logo, description, phone, location, rating, reviewCount, priceMin, priceMax, isVerified, type (artisan/contractor), latitude, longitude
- **company_services** — id, companyId, categoryId (many-to-many link between companies and categories)
- **company_bookings** — id, customerId, companyId, service, date, time, status, totalPrice
- **company_reviews** — id, companyId, customerId, bookingId, rating, comment
- **categories** — id, name, icon, color (seeded on server start)
- **artisan_profiles** — linked to user and category, includes profession, location, price, rating, experience
- **bookings** — links customer to artisan profile with service, date, time, status
- **reviews** — links customer to artisan profile with rating and comment
- **store_categories** — id, name, icon, color (seeded on server start)
- **products** — id, name, description, price, image (emoji), categoryId, stock, unit, isAvailable
- **cart_items** — id, userId, productId, quantity

### API Routes (all under `/api/`)
- `POST /api/auth/register` — Create new user
- `POST /api/auth/login` — Authenticate user
- `GET /api/categories` — List service categories
- `GET /api/artisans` — List artisan profiles (optional category filter)
- `GET /api/artisans/:id` — Get single artisan profile
- `POST /api/artisans` — Create artisan profile
- `GET /api/artisans/stats/:id` — Artisan dashboard stats (bookings, earnings, rating)
- `GET /api/artisans/by-user/:userId` — Get artisan profile by user ID
- `PATCH /api/artisans/:id` — Update artisan profile
- `GET /api/bookings/customer/:id` — Customer's bookings
- `GET /api/bookings/artisan/:id` — Artisan's bookings
- `POST /api/bookings` — Create booking
- `PATCH /api/bookings/:id/status` — Update booking status
- `GET /api/reviews/artisan/:id` — Artisan's reviews
- `POST /api/reviews` — Create review
- `GET /api/reviews/booking/:bookingId` — Check if booking has been reviewed
- `PATCH /api/users/:id/online` — Toggle online status
- `POST /api/admin/login` — Admin authentication (returns Bearer token)
- `GET /api/admin/stats` — Dashboard statistics (requires admin token)
- `GET /api/admin/users` — List all users (requires admin token)
- `GET /api/admin/bookings` — List all bookings (requires admin token)
- `GET /api/admin/reviews` — List all reviews (requires admin token)
- `DELETE /api/admin/users/:id` — Delete user (requires admin token)
- `DELETE /api/admin/bookings/:id` — Delete booking (requires admin token)
- `GET /api/admin/artisans` — List all artisan profiles with user data (requires admin token)
- `GET /api/admin/categories` — Category stats with artisan/booking counts (requires admin token)
- `PATCH /api/admin/bookings/:id/status` — Admin update booking status (requires admin token)
- `POST /api/store/orders` — Create store order (checkout)
- `GET /api/store/orders/user/:userId` — Get user's store orders
- `GET /api/store/orders/:id` — Get single store order
- `GET /api/admin/store-orders` — List all store orders (requires admin token)
- `PATCH /api/admin/store-orders/:id/status` — Update store order status (requires admin token)

### Development vs Production
- **Development**: Vite dev server with HMR proxied through Express, uses `server/vite.ts`
- **Production**: Static files served from `dist/public/`, uses `server/static.ts`

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets` → `attached_assets/`

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Must set `DATABASE_URL` environment variable. Used via `pg` driver + Drizzle ORM

### Key NPM Packages
- **Frontend**: React, wouter, @tanstack/react-query, shadcn/ui (Radix primitives), Tailwind CSS, vaul (drawer), embla-carousel, react-day-picker, recharts
- **Backend**: Express v5, drizzle-orm, drizzle-zod, pg, zod, nanoid, crypto (built-in)
- **Build**: Vite, esbuild, tsx

### Google Fonts (CDN)
- Cairo (Arabic text)
- Outfit (headings)

### Replit-specific Plugins
- `@replit/vite-plugin-runtime-error-modal` — Error overlay in development
- `@replit/vite-plugin-cartographer` — Dev tooling (dev only)
- `@replit/vite-plugin-dev-banner` — Dev banner (dev only)
- Custom `vite-plugin-meta-images` — Updates OG meta tags with Replit deployment URL