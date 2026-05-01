# AGENTS.md

## Project state

- **Early scaffold** — no code implemented yet. All source files are empty stubs.
- Node.js, CommonJS (`"type": "commonjs"` in package.json).

## Architecture (intended)

```
src/
  index.js             — app entrypoint
  config/db.js         — database connection
  .env                 — environment variables
  APIs/
    controllers/
    routes/
    middlewares/
    services/
```

The intended pattern is MVC-style: routes → controllers → services, with middlewares for auth/validation. This is not yet implemented.

## Database schema

The full schema is in `DB_Schema.html`. Key tables:

| Domain | Tables |
|--------|--------|
| Users & Sellers | `users`, `sellers`, `addresses` |
| Products | `categories` (self-ref tree), `products` (with tsvector search) |
| Cart | `cart_items` (composite PK: `user_id` + `product_id`) |
| Orders | `orders`, `seller_orders`, `seller_order_items`, `seller_order_status_history` |
| Payments | `payments`, `refunds` |
| Coupons | `coupons`, `coupon_products`, `coupon_usages` |
| Reviews | `reviews` (unique per user+product), `restock_requests` |

Notable schema details:
- `addresses` has soft-delete (`deleted_at`) and partial unique index for `is_default`.
- `orders` stores a frozen shipping address and `total_price` snapshot.
- Payments support `method` (card/paypal/cod) and `status` (pending/completed/failed/refunded).
- Refunds are per-seller-order, support partial amounts.
- Coupons are seller-scoped, can be scoped to specific products via `coupon_products`, with usage tracking in `coupon_usages`.
- `restock_requests` rows are deleted after notification email is sent.

## Commands

None are configured yet. The `test` script is a stub. No build, lint, or typecheck commands exist.
