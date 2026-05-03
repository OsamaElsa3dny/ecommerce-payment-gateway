# ecommerce-payment-gateway

An e-commerce payment gateway API built with Node.js, Express, and PostgreSQL.

## Features

- **Auth**: Register and login with JWT authentication
- **Product Search**: Full-text search + trigram fuzzy search combined
- **Health Check**: Simple health endpoint

## Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Fill in your database credentials and JWT secret in `.env`.

3. **Create the database**
   ```bash
   createdb ecommerce_db
   ```

4. **Run migrations**
   ```bash
   psql -U postgres -d ecommerce_db -f migrations/001_initial_schema.sql
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET | `/api/user/profile` | Yes | Get authenticated user profile |
| GET | `/api/products/search` | No | Search/browse products |
| GET | `/api/health` | No | Health check |

### Product Search

```
GET /api/products/search?q=wireless&category_id=5&min_price=10&max_price=100&page=1&limit=20
```

- `q` — search query (optional; if omitted, returns all products with filters)
- `category_id` — filter by category
- `min_price` / `max_price` — price range filter
- `page` / `limit` — pagination (default: page=1, limit=10)

Uses PostgreSQL `tsvector` (full-text) + `pg_trgm` (fuzzy/typo-tolerant) search combined, with results ranked by relevance score.

## Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Framework**: Express 5
- **Database**: PostgreSQL with `pg` driver
- **Auth**: JWT (`jsonwebtoken`) + bcrypt
- **Validation**: `validator`

## Project Structure

```
src/
  index.js                 — Express server + global error handler
  config/db.js             — PostgreSQL connection pool
  APIs/
    controllers/           — HTTP adapters
    routes/                — Express routers
    middlewares/            — Validation & auth middlewares
    services/               — Business logic & DB queries
    utils/
      AppError.js          — Custom error class (message + statusCode)
migrations/
  001_initial_schema.sql   — Full database schema
```