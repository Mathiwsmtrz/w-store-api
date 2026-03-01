# Store Back API

E-commerce backend API built with NestJS, hexagonal architecture, and TypeORM on PostgreSQL.
It includes product catalog listing, order creation, and order lookup by code.

## Stack

- NestJS
- TypeORM
- PostgreSQL
- Swagger (OpenAPI)
- Class Validator / Class Transformer

## Quick Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

```bash
cp .env.example .env
```

3. Run in development:

```bash
npm run start:dev
```

Base API URL: `http://localhost:80/api/v1`
Swagger UI: `http://localhost:80/docs`
Swagger auth (basic): `admin / admin`

## Environment Variables

```env
PORT=80
# Preferred: full PostgreSQL URL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/store_back

# Optional fallback (if DATABASE_URL is not defined)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=store_back
DB_SYNCHRONIZE=false
```

Connection priority:

- `DATABASE_URL` (or `DB_URL`) if present.
- If not present, split variables (`DB_HOST`, `DB_PORT`, etc.) are used.

## Basic Commands

```bash
# development (watch)
npm run start:dev

# standard run
npm run start

# build
npm run build

# production (requires build)
npm run start:prod

# lint
npm run lint

# tests
npm run test
```

## Main Endpoints

- `GET /api/v1/list-categories` - List categories.
- `GET /api/v1/list-products?category=<slug|id>` - List products with optional category filter.
- `GET /api/v1/product/:slug` - Get full product information by slug.
- `POST /api/v1/new-order` - Create a new order with `PENDING_PAID` status.
- `GET /api/v1/orders/:code` - Find an order by code and return order + customer + products + payments.

## `new-order` Example

```json
{
  "customer": {
    "address": {
      "address": "1 Apple Park Way",
      "city": "Cupertino",
      "state": "CA",
      "country": "USA"
    },
    "fullname": "John Appleseed",
    "email": "john.appleseed@example.com"
  },
  "method": "WOMPI",
  "paymentRefCode": "WOMPI-REF-001",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```
