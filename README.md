# Bond Yield Calculator

A full-stack web application that computes bond yield metrics and generates a cash-flow schedule. Built with **React** (frontend) and **NestJS** (backend), using **TypeScript** throughout.

## Features

- **Current Yield** calculation
- **Yield to Maturity (YTM)** via Newton-Raphson with bisection fallback
- **Total Interest Earned** over the life of the bond
- **Premium / Discount / Par** indicator
- **Cash Flow Schedule Table** with period, payment date, coupon payment, cumulative interest, and remaining principal

## Project Structure

```
backend/    — NestJS API server (port 3000)
frontend/   — React SPA (port 3001)
```

## Getting Started

### Prerequisites

- Node.js >= 20
- npm

### Quick Start (Both Services)

```bash
npm run install:all   # Install all dependencies
npm start             # Start backend + frontend together
```

- Backend runs at `http://localhost:3000`
- Frontend runs at `http://localhost:3001`

### Run Individually

**Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Running Tests

```bash
npm test
# or
cd backend && npm test
```

## API

**POST** `/api/bond/calculate`

### Request Body

| Field                | Type     | Description                          |
| -------------------- | -------- | ------------------------------------ |
| `faceValue`          | number   | Face value of the bond (> 0)         |
| `annualCouponRatePct`| number   | Annual coupon rate in % (>= 0)       |
| `marketPrice`        | number   | Current market price (> 0)           |
| `yearsToMaturity`    | number   | Years to maturity (> 0, decimals OK) |
| `couponFrequency`    | string   | `"annual"` or `"semi-annual"`        |

### Response

Returns computed metrics (`currentYield`, `ytm`, `totalInterest`, `priceStatus`) and a `schedule` array of cash-flow rows.

## Assumptions

- Settlement date is **today**; payment dates are derived by adding period lengths from today.
- **Plain vanilla bullet bond**: principal remains outstanding at face value until maturity, repaid in full at maturity.
- **Total interest** = sum of all coupon payments (no reinvestment assumption).
- YTM is reported as a **nominal annual rate** compounded at the coupon frequency.
- Period count uses `ceil(yearsToMaturity × frequency)` to avoid silently dropping cash flows.

## Formulas

- **Current Yield** = Annual Coupon / Market Price
- **YTM**: solved numerically so that `P = Σ C/(1+r)^t + F/(1+r)^n`, returned as `r × m`
- **Total Interest** = Coupon per period × number of periods
