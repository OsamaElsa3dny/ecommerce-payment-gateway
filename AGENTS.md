# AGENTS.md

> **Disclaimer:** This project is for learning purposes only. When making changes, explain **why** you are doing what you're doing.

## Project state

- **Active development** — auth (register/login) and product search are implemented. Other features are not yet built.
- Node.js, CommonJS (`"type": "commonjs"` in package.json).

## Architecture

```
src/
  index.js                     — app entrypoint (Express server setup, global error handler)
  config/db.js                 — PostgreSQL connection pool (pg)
  APIs/
    controllers/               — HTTP adapters (extract req data, call service, send response)
      authController.js        — register, login
      product.js                — searchProducts
    routes/                    — Express routers (mount middleware + controller on paths)
      auth.js                  — POST /register, POST /login
      health.js                — GET /health
      user.js                  — GET /profile (auth required)
      product.js               — GET /search (public, FTS + trigram)
    middlewares/               — Request validation & auth
      validator.js             — email/password helpers
      registerValidate.js      — register input validation
      loginValidate.js         — login input validation
      jwtMiddleware.js          — JWT auth middleware
      query.js                 — product search query validation
    services/                  — Business logic (DB queries live here)
      authService.js           — register, login
      product.js                — search (FTS + trigram combined)
    utils/
      AppError.js              — Custom error class with statusCode
migrations/
  001_initial_schema.sql      — Full DB schema (run this first)
```

### Pattern: Routes → Middleware → Controller → Service

- **Routes** define HTTP endpoints and chain middleware.
- **Middlewares** validate input shape/types, authenticate JWTs.
- **Controllers** extract data from `req`, call the service, and send the HTTP response.
- **Services** contain all business logic and database queries. They throw `AppError` for domain errors.
- **AppError** is a custom error class: `new AppError(message, statusCode)`. The global error handler in `index.js` reads `err.statusCode` and returns the correct HTTP status.

### Response format (consistent across all endpoints)

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": { ... }
}
```

### Error handling flow

- Services throw `AppError(message, statusCode)` for expected errors (409, 401, 404, etc.)
- Controllers catch and pass to `next(error)`
- Global error handler in `index.js` uses `err.statusCode` or defaults to 500
- In development mode (`NODE_ENV=development`), error messages are included in responses

## Database schema

Full schema in `migrations/001_initial_schema.sql`. Key tables:

| Domain | Tables |
|--------|--------|
| Users & Sellers | `users`, `sellers`, `addresses` |
| Products | `categories` (self-ref tree), `products` (with tsvector search + pg_trgm) |
| Cart | `cart_items` (composite PK: `user_id` + `product_id`) |
| Orders | `orders`, `seller_orders`, `seller_order_items`, `seller_order_status_history` |
| Payments | `payments`, `refunds` |
| Coupons | `coupons`, `coupon_products`, `coupon_usages` |
| Reviews | `reviews` (unique per user+product), `restock_requests` |

Notable schema details:
- `products.search_vector` is auto-populated by a trigger from `name` (weight A) and `description` (weight B).
- Product search combines full-text search (tsvector) and trigram similarity (pg_trgm) in a single query.
- `addresses` has soft-delete (`deleted_at`) and partial unique index for `is_default`.
- `orders` stores a frozen shipping address and `total_price` snapshot.

## Setup

1. Copy `.env.example` to `.env` and fill in values
2. Create the database: `createdb ecommerce_db`
3. Run migrations: `psql -U postgres -d ecommerce_db -f migrations/001_initial_schema.sql`
4. Start server: `npm run dev`

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with `--watch` (auto-restart on file changes) |
| `npm test` | Not configured (stub) |

No lint or typecheck commands configured yet.