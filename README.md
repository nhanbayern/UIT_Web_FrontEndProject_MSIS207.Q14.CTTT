# Ruou Ong Tu Frontend

React + Vite single-page application (SPA) for the Rượu Ông Tư e-commerce platform. The app renders the full customer journey — product discovery, onboarding, cart, checkout, order tracking, and MoMo/COD payments — by consuming the Express/Sequelize backend over REST.

## Feature Highlights

- **Authentication & onboarding** – Email/password login with refresh-token recovery, OTP-driven signup/reset flows, Google OAuth handoff, and persistent profile editing via `/user/update`.
- **Product discovery** – Region, category, and keyword filters with dedicated endpoints (`/products`, `/products/region/:name`), polished hero sections, and detail pages that reuse Figma imagery.
- **Cart management** – Context-aware add/remove, quantity sync with backend stock validation, and the ability to checkout a subset of cart lines.
- **Checkout & payments** – Recipient-first form, saved-address selector, dual phone options, and payment options for COD or MoMo. Successful e-wallet orders immediately call `/payment/momo/create` and redirect to the returned `payUrl`.
- **Orders & profile** – `ManageOrdersPage` shows calculated totals, statuses, and fulfillment stats; `ProfilePage` keeps local state aligned with backend `user` payloads.

## Tech Stack & Architecture

- **Frameworks** – React 18, TypeScript, Vite, Tailwind utilities, shadcn/Radix UI primitives, lucide icons, Embla carousel, Recharts visualizations.
- **State** – `AppContext` (products, auth, orders, profile) and `CartContext` encapsulate client state, while hooks like `useProductFilters` keep UI logic modular.
- **Services** – `src/services/api.ts` centralizes REST calls using `apiFetch`, automatic token refresh, and helpers for orders, addresses, profile, cart, and payments.
- **Utilities** – Debounce helpers, Recaptcha wrapper, shared UI components (accordion, dialog, toast, etc.) under `src/components/ui`.

## Project Layout

```
src/
	App.tsx            # App shell + routing
	assets/            # hero imagery, fonts, profile assets
	components/        # pages (Home, Checkout, Orders, etc.) + shared UI
	contexts/          # AppContext, CartContext providers
	data/              # mock fixtures when API data is unavailable
	hooks/             # product filter hook and other composables
	services/          # api.ts, cart service, payment helpers
	styles/            # global and feature-specific CSS
	types/             # cart/product/order/user typings
	utils/             # debounce + Recaptcha helpers
```

Refer to each page/component for implementation specifics (e.g., `CheckoutPage.tsx`, `ManageOrdersPage.tsx`, `ProfilePage.tsx`).

## Environment Configuration

Create a `.env` file in the project root with at least the following entries:

```bash
VITE_API_BASE_URL=https://api.ruouongtu.me/RuouOngTu
VITE_API_IMG_URL=https://api.ruouongtu.me

# Optional if Recaptcha is enabled in auth pages
VITE_CAPTCHA_SITE_KEY=your-recaptcha-site-key
```

- `VITE_API_BASE_URL` – required for every REST call in `api.ts` (all helpers rely on `buildApiUrl`).
- `VITE_API_IMG_URL` – consumed anywhere images need the CDN base (product cards, hero sections, etc.).
- The frontend intentionally avoids any other API host variables to keep deployments consistent.

## Installation & Scripts

```bash
npm install   # install dependencies
npm run dev   # start Vite dev server (hot reload, default port 5173)
npm run build # create production build under dist/
```

Ensure the backend server, database, and MoMo/VNPay sandbox credentials are running before testing authenticated or payment flows.

## API & Payment Flows

- `apiFetch` automatically appends the in-memory Bearer token, retries once after `/auth/refresh`, and propagates JSON errors so UI layers can show contextual toasts.
- `createOrder` posts cart items, shipping selection (address ID or formatted string), and payment method (`Cash` or `OnlineBanking`).
- For e-wallet checkouts, `CheckoutPage` grabs the returned `order_code`, calls `createMomoPayment`, and redirects the browser to `payUrl`/`paymentUrl`. Errors bubble up to user-facing toasts.
- Profile editing relies on `updateUserProfile`, while address CRUD maps directly to `/user/address*` endpoints so saved locations appear inside checkout.

## Development Tips

- Run the app through the standard `/manageorders` and `/checkout` flows after touching order or payment logic to ensure the calculated totals, toasts, and redirects still line up with backend responses.
- When updating services, keep the contract of `buildApiUrl` intact so deployments only manage `VITE_API_BASE_URL` and `VITE_API_IMG_URL`.
- Use the existing UI primitives inside `src/components/ui` to keep styling consistent with the Figma spec.

With the environment configured and backend running, `npm run dev` is sufficient to explore the entire commerce experience end-to-end.
