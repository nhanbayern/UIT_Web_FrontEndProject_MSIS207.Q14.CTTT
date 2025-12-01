# FrontEnd Overview

React + Vite single-page application for the Bán Rượu platform. The UI consumes the Express/Sequelize backend and focuses on a frictionless shopping-to-order experience for regional specialty wines.

## Core Features

- **Intelligent Cart** – Real-time quantity sync, stock-aware validation, and user-controlled selection of cart lines before checkout.
- **Guided Checkout** – Recipient-centric form with saved-address picker, flexible contact options, and payloads that mirror backend order constraints.
- **Order Management** – Customer dashboard for tracking statuses, per-item price auditing, and shipping context derived from order records.
- **Content-rich Catalog** – Region filters, hero sections, and product detail flows mapped from the original Figma design.

## Tech Stack

- React 18 with TypeScript, Vite, and Tailwind-based utility classes.
- Context-driven state (AppContext, CartContext) with REST clients in `src/services`.
- UI primitives from Radix + shadcn (cards, tabs, checkbox, radio).

## Getting Started

```bash
npm install        # install dependencies
npm run dev        # start the frontend on the configured Vite port
```

Ensure the backend server is running and `VITE_API_*` env vars point to it before testing authenticated flows.
