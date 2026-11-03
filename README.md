# IZO PLUS — Penaplast Zavodi

Responsive Uzbek-language product catalog and ordering website for **IZO PLUS**, built with Next.js 16, React 19 and TypeScript. The industrial-premium interface uses a navy, white and orange palette, locally bundled Manrope (a Google Fonts family), optimized illustrative photography, lightweight scroll reveals and an accessible native order dialog.

## Run locally

Requires **Node.js 22+**.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The development server binds to `0.0.0.0` for hosted previews.

```bash
npm run lint       # ESLint
npm run typecheck  # Next route types + strict TypeScript
npm test           # Catalog, contact, validation, Telegram and rate-limit unit tests
npm run build      # Production build
npm start          # Serve the production build
npm run check      # Lint + types + unit tests + production build
```

Browser tests use a separate production server on port **3100** with Telegram credentials explicitly cleared. They never send a real customer order or inquiry.

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

For an existing Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Desktop and mobile Chromium projects cover the product detail disclosures, every density/thickness choice, calculations, order and contact form validation, delivery states, navigation, image loading, focus handling and widths from 320 to 1440 px.

## Catalog and contact

Each product card has a **Batafsil** control that opens the existing density, thickness and quantity calculator. A selection remains intact if the card is closed and reopened. The order button carries that exact selection into the order dialog; server-side calculation remains the source of truth.

The separate contact form accepts a name, an Uzbek phone number and a message without inventing a product order. Both forms validate inputs on the client and server. They use the same server-only Telegram configuration and the same explicit manual fallback described below. The contact form retains its inputs on a failed submission.

## Telegram setup — required for automatic delivery

The public contact destination is **https://t.me/penaplast_uz**. Automatic delivery for both orders and inquiries uses the Telegram Bot API **only from the server**.

1. Create a bot with Telegram's official `@BotFather`.
2. Choose the private chat, group or channel that the factory's order operator monitors.
3. Make the bot a member; for a channel, grant permission to post. For a private chat, the recipient must first start the bot.
4. Obtain the actual numeric destination chat ID. A public username is not automatically a usable bot chat ID. A channel can use its `@channelusername` if the bot is an administrator.
5. Set these **server-side** variables in your deployment provider:

| Variable | Purpose |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | BotFather token. Never expose with `NEXT_PUBLIC_`. |
| `TELEGRAM_CHAT_ID` | The operator's destination chat/group/channel ID. |
| `NEXT_PUBLIC_SITE_URL` | Public HTTPS origin, used for canonical metadata and Open Graph URLs. Set before building. |

6. Redeploy/restart and send an explicitly agreed test order and test inquiry. Confirm receipt in the operator's chat.

**Do not paste tokens into chat, source code, browser storage or client components.** `.env*` is ignored except `.env.example`.

### Honest unconfigured fallback

When both Telegram variables are absent, each API returns a prepared message and the UI opens a clearly labeled **manual** step:

- “Buyurtmangiz Telegramga tayyor” or “Xabaringiz Telegramga tayyor”
- “Hali yuborilmadi.”
- Copy the complete text, open `@penaplast_uz`, paste and send it yourself.

The site never reports automatic success without a successful Telegram API response. An incomplete or invalid bot configuration returns an error rather than a false success. Clipboard failure falls back to selectable text.

Loading, success, failure and retry states are distinct. Repeated clicks are disabled during submission, and a stable request UUID becomes a short reference to help an operator recognize retries. Delivery is **not claimed to be exactly-once** across network failures or serverless instances.

## Pricing assumptions

The brief gives density prices but no sheet length/width. Therefore sheet quantities are explicitly **m³**, not an invented number of sheets:

- Oq/qora penaplast unit price: **USD/m³**.
- Total: `volume (m³) × density unit price`.
- Thickness is an order specification; it does **not** silently multiply a cubic-meter price.
- Maydalangan penaplast: **USD 0.70/kg**, total `kg × 0.70`.
- Sheet volume: 0.01–10,000 m³, up to two decimals.
- Granules: 1–100,000 whole kg.

| Density (kg/m³) | USD/m³ |
| ---: | ---: |
| 7 | 32 |
| 10 | 40 |
| 12 | 50 |
| 14 | 62 |
| 15 | 67 |
| 16 | 71 |
| 18 | 79 |
| 20 | 87 |

All variants, prices and calculations live in `src/lib/products.ts`. Money is calculated in integer cents. The server recalculates from this catalog and ignores any client-supplied price. If the business later sells by the sheet, add actual sheet dimensions to the central model and explicitly define the volume conversion first.

Final price and delivery terms are confirmed by the operator; no payment is collected on the site.

## Architecture

```text
src/
  app/
    page.tsx                 # Semantic section composition
    layout.tsx               # Metadata, local font, Organization JSON-LD
    globals.css              # Mobile-first responsive design system
    api/order/route.ts       # Server-side order validation and Telegram delivery
    api/contact/route.ts     # Server-side inquiry validation and Telegram delivery
    icon.svg                 # Brand favicon
    not-found.tsx, error.tsx # Useful error states
  components/
    Navbar, Hero, Advantages, Products, ProductCard, ProductSelector
    OrderProvider, OrderButton, OrderModal
    Stats, ScrollEffects, Production, About, Applications, Partners
    Contact, ContactForm, Footer
  lib/
    products.ts              # Single product/price source of truth
    validation.ts            # Customer and untrusted order validation
    contact.ts               # Inquiry validation and message formatting
    order-message.ts         # Canonical order formatting
    order-api.ts             # Shared Telegram response contract
    telegram.ts              # Server-only delivery adapter
    request-security.ts      # Shared origin, body-size and IP-key checks
    rate-limit.ts            # Bounded per-instance fixed-window limiter
    content.ts, site.ts      # Editorial content, navigation and site config
public/
  images/                    # Local illustrative visuals and OG image
  licenses/                  # Font and icon license notices
tests/
  unit/                      # Node test runner via tsx
  e2e/                       # Playwright desktop + mobile
```

There is no search, category filtering, 3D/WebGL viewer, login, admin dashboard, database, video, analytics tracker or animation library. Scroll reveals and catalog counters use `IntersectionObserver` and respect reduced-motion preferences. Content remains available without these enhancements.

## Security and operational notes

- Telegram token never reaches the client bundle or API responses.
- Strict product, quantity, order-customer and contact validation on both client and server.
- Uzbek phone format normalization; this validates format, not ownership.
- Telegram HTML escaping, disabled link previews and a 10-second provider timeout.
- JSON request body capped at 16 KiB; same-origin checks where browser headers are available.
- Best-effort limit: 5 valid attempts per IP per 10 minutes per endpoint and server instance.
- The reverse proxy must overwrite forwarded IP headers. For multi-instance/serverless production, replace the in-memory limiter with a shared store or upstream rate limiting.
- No customer data is stored in a database or localStorage. Configured messages are sent to Telegram; manual messages remain in the current form/dialog until copied or sent.
- No provider response, token, request URL or customer PII is written to application logs.
- Runtime dependency audit: `npm audit --omit=dev`.

## Deployment

Use a Node-capable Next.js deployment (for example Vercel). This is **not a static export** because `/api/order` and `/api/contact` need a server.

1. Set the environment variables above.
2. Use `npm ci` and `npm run build`.
3. Start with `npm start` or let the provider run the Next.js server.
4. Configure the real HTTPS domain in `NEXT_PUBLIC_SITE_URL` and rebuild metadata.
5. Verify the live Telegram test order and inquiry, phone link, mobile layout and HTTPS.

The included preview is a working build, not a claim that production Telegram credentials have already been configured.

## Visual assets and content integrity

Product/factory/application photographs, including the new hero, are **AI-generated illustrative placeholders**, not documentary photographs of the actual IZO PLUS factory. The packaging application uses an original SVG illustration. This is disclosed in image alternatives and the applications note. Replace these with approved real factory/product photography before making documentary claims.

The business's exact address and coordinates were not provided. The contact section therefore shows a clearly labeled schematic map and directs visitors to ask the operator for the real address; it does not pretend to locate the factory. Replace it with an actual map once the verified address is available.

The animated numbers are derived from the actual catalog and production steps (3 products, 8 densities, 11 thicknesses and 6 steps). The partnership area lists application sectors, not invented client logos or testimonials. No fabricated certifications, customer counts, factory capacity, reviews or years in business are shown. Manrope is bundled locally through Fontsource; icons are Lucide. Their license notices are in `public/licenses/`.
