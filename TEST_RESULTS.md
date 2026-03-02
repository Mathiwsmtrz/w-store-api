# Test Results

Last run: generated from `npm run test:cov`

## Summary

| Metric        | Value  |
| ------------- | ------ |
| Test Suites   | 12 passed |
| Tests         | 45 passed |
| Snapshots     | 0      |
| Statements    | 93.16% |
| Branches      | 86.52% |
| Functions     | 60.52% |
| Lines         | 95.37% |

## Coverage by File

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| **All files** | 93.16 | 86.52 | 60.52 | 95.37 |
| app.module.ts | 100 | 100 | 100 | 100 |
| main.ts | 100 | 87.5 | 100 | 100 |
| commerce.module.ts | 100 | 100 | 100 | 100 |
| customers.service.ts | 100 | 100 | 100 | 100 |
| create-order.dto.ts | 83.33 | 100 | 0 | 86.95 |
| orders.service.ts | 100 | 90 | 100 | 100 |
| create-wompi-transaction.dto.ts | 100 | 100 | 100 | 100 |
| wompi-payments.service.ts | 95.27 | 80.45 | 93.75 | 95.96 |
| list-products-query.dto.ts | 100 | 100 | 100 | 100 |
| products.service.ts | 100 | 100 | 100 | 100 |
| order-method.enum.ts | 100 | 100 | 100 | 100 |
| order-status.enum.ts | 100 | 100 | 100 | 100 |
| payment-status.enum.ts | 100 | 100 | 100 | 100 |
| customer-address.entity.ts | 84.61 | 100 | 0 | 90 |
| customer.entity.ts | 73.33 | 100 | 0 | 81.81 |
| order-detail.entity.ts | 75 | 100 | 0 | 83.33 |
| order.entity.ts | 75 | 100 | 0 | 82.6 |
| payment.entity.ts | 90 | 100 | 0 | 94.11 |
| product-category.entity.ts | 81.81 | 100 | 0 | 87.5 |
| product.entity.ts | 80 | 100 | 0 | 87.5 |
| orders.controller.ts | 100 | 100 | 100 | 100 |
| payments.controller.ts | 100 | 100 | 100 | 100 |
| catalog.controller.ts | 100 | 100 | 100 | 100 |
| database.module.ts | 87.5 | 100 | 0 | 83.33 |
| typeorm.config.ts | 100 | 100 | 100 | 100 |

## Test Suites

| Suite |
|-------|
| PASS database.module.spec.ts |
| PASS wompi-payments.service.spec.ts |
| PASS customers.service.spec.ts |
| PASS catalog.controller.spec.ts |
| PASS main.spec.ts |
| PASS app.module.spec.ts |
| PASS commerce.module.spec.ts |
| PASS typeorm.config.spec.ts |
| PASS orders.service.spec.ts |
| PASS products.service.spec.ts |
| PASS payments.controller.spec.ts |
| PASS orders.controller.spec.ts |

## Commands

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```
