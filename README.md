# IZO PLUS — Penaplast Zavodi

Original, responsive Uzbek-language product catalog and ordering website for **IZO PLUS**. Built with Next.js 16, React 19 and TypeScript. The interface uses local Manrope fonts, a restrained industrial palette, optimized photography and a native accessible order dialog.

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
npm test           # Catalog, validation, Telegram and rate-limit unit tests
npm run build      # Production build
npm start          # Serve the production build
npm run check      # Lint + types + unit tests + production build
```

Browser tests use a separate production server on port **3100** with Telegram credentials explicitly cleared. They never send a real customer order.

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

For an existing Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Desktop and mobile Chromium projects cover all density/thickness choices, calculations, form validation, order states, navigation, image loading, focus handling and widths from 320 to 1440 px.

## Telegram setup — required for automatic delivery

The contact destination is **https://t.me/penaplast_uz**. Automatic delivery uses the Telegram Bot API **only from the server**.

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

6. Redeploy/restart and send one explicitly agreed test order. Confirm receipt in the operator's chat.

**Do not paste tokens into chat, source code, browser storage or client components.** `.env*` is ignored except `.env.example`.

### Honest unconfigured fallback

When both Telegram variables are absent, the API returns a valid order message and the UI opens a clearly labeled **manual** step:

- “Buyurtmangiz Telegramga tayyor”
- “Hali yuborilmadi.”
- Copy the complete order, open `@penaplast_uz`, paste and send it yourself.

The site never reports automatic success without a successful Telegram API response. Missing/incomplete configuration is not treated as a delivered order. Clipboard failure falls back to selectable text.

### Order states

- Loading: `Buyurtma yuborilmoqda...`
- Confirmed delivery: `Buyurtmangiz muvaffaqiyatli yuborildi!`
- Failure: `Buyurtma yuborilmadi. Qaytadan urinib ko‘ring.`
- Unconfigured: explicit copy-and-send instructions, not a false success state.

Customer inputs are retained on a failed attempt. Repeated clicks are disabled while submitting. A stable request UUID becomes a short order reference so an operator can recognize retries. Delivery is **not claimed to be exactly-once** across network failures or serverless instances.

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
    globals.css              # Responsive design system
    api/order/route.ts       # Server-side validation and Telegram delivery
    icon.svg                 # Brand favicon
    not-found.tsx            # Useful 404
    error.tsx                # Recoverable render-error boundary
  components/
    Navbar, Hero, Products, ProductCard, ProductSelector
    OrderProvider, OrderButton, OrderModal
    Production, Advantages, Applications, About, Contact, Footer
  lib/
    products.ts              # Single product/price source of truth
    validation.ts            # Customer + untrusted request validation
    order-message.ts         # Canonical plain-text/HTML order formatting
    order-api.ts             # Shared response contract
    telegram.ts              # Server-only delivery adapter
    rate-limit.ts            # Bounded per-instance fixed-window limiter
    content.ts, site.ts      # Editorial content, navigation and site config
public/
  images/                    # Local product/application visuals and OG image
  licenses/                  # Font and icon license notices
tests/
  unit/                      # Node test runner via tsx
  e2e/                       # Playwright desktop + mobile
```

There is no search, category filtering, 3D/WebGL viewer, login, admin dashboard, database, video, analytics tracker or unnecessary animation library.

## Security and operational notes

- Telegram token never reaches the client bundle or API responses.
- Strict product/quantity/customer validation on both client and server.
- Uzbek phone format normalization; this validates format, not ownership.
- Telegram HTML escaping, disabled link previews and a 10-second provider timeout.
- JSON request body capped at 16 KiB; same-origin checks where browser headers are available.
- Best-effort limit: 5 valid order attempts per IP per 10 minutes per server instance.
- The reverse proxy must overwrite forwarded IP headers. For multi-instance/serverless production, replace the in-memory limiter with a shared store or upstream rate limiting.
- No customer data is stored in a database or localStorage. Configured orders are sent to Telegram; manual orders remain in the current dialog until copied/sent.
- No provider response, token, request URL or customer PII is written to application logs.
- Runtime dependency audit: `npm audit --omit=dev`.

## Deployment

Use a Node-capable Next.js deployment (for example Vercel). This is **not a static export** because `/api/order` needs a server.

1. Set the environment variables above.
2. Use `npm ci` and `npm run build`.
3. Start with `npm start` or let the provider run the Next.js server.
4. Configure the real HTTPS domain in `NEXT_PUBLIC_SITE_URL` and rebuild metadata.
5. Verify the live Telegram test order, phone link, mobile layout and HTTPS.

The included preview is a working build, not a claim that production Telegram credentials have already been configured.

## Visual assets and content integrity

Product/factory/application photographs are **AI-generated illustrative visuals**, not documentary photographs of the actual IZO PLUS factory. The packaging application uses an original SVG illustration. This is disclosed accessibly in image alternatives and the applications note. Replace these with approved real factory/product photography before making documentary claims.

No fabricated certifications, customer counts, factory capacity, reviews or years in business are shown. Manrope is bundled locally through Fontsource; icons are Lucide. Their license notices are in `public/licenses/`.
