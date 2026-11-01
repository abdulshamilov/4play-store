# 4PLAY — Живи игрой

Responsive football storefront built with React, TypeScript, Vite and React Router.

## Run

```sh
npm ci
npm run dev
npm run build
```

Vercel: framework **Vite**, build command `npm run build`, output directory `dist`.
`vercel.json` keeps direct links to product, catalog and cart pages working.

## Storefront

- Campaign photography, four club collections, 12 correctly illustrated products.
- Catalog search, category, brand, size, club and maximum-price filters; price/name sorting. Filters stay in the URL.
- Product details, photo zoom, care instructions and sizing help.
- Quick size selection, persistent favorites and cart, quantity controls and calculated totals.
- Mobile navigation, keyboard-accessible dialogs, reduced-motion support and error/empty states.
- Demo checkout with client-side validation. It does **not** send customer data, create real orders or collect payments.

Product data lives in `src/data.ts`. Prices, availability, product variants and fulfillment options are demonstration data; connect the actual inventory/order service before accepting purchases. Existing cart product IDs have been preserved where products remain in the collection; invalid saved items are discarded safely.

All displayed photography and fonts are served locally from `public/`. Image references are documented in [ASSET_SOURCES.md](ASSET_SOURCES.md). Google fonts include their SIL Open Font License files in `public/fonts/`.
