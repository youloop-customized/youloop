# Stripe Integration — Remaining Setup

Hosted Stripe Checkout was added: customers are redirected to a Stripe-hosted
payment page. This file is the single source of truth for what is still left to
do before going live.

## Values to Replace

The following values are placeholders and must be updated before going live.

**Files containing placeholders:**
- [src/app/api/create-checkout-session/route.ts](src/app/api/create-checkout-session/route.ts)

| Field | Current Value | What to Set |
|-------|---------------|-------------|
| `mode` | `payment` | Correct as-is for YOU LOOP — every piece is a one-time charge. Change to `subscription` only if you add recurring billing. |
| `success_url` | `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}` | Your real post-payment page. `/success` does not exist in this app yet — either create `src/app/success/page.tsx` or point this at an existing route. Keep the `{CHECKOUT_SESSION_ID}` template. **This is the next thing to fix: a paid customer currently lands on a 404.** |

`line_items` and `cancel_url` have been resolved — see below.

### Resolved: `line_items` now uses `price_data`

YOU LOOP prices are computed, not fixed, so a single Stripe Price ID could
never have been right. `resolveOrder()` already returns the correct amount per
size (SR-01 is ฿2,690 for XS–M, ฿2,890 for L, ฿3,040 for XL), and the endpoint
now charges exactly that:

```ts
price_data: {
  currency: 'thb',
  unit_amount: order.price * 100, // satang — thb is a two-decimal currency
  product_data: { name: ..., description: ... },
}
```

Stripe therefore charges the same figure the checkout page displays. No Price
IDs need to be created in the Dashboard.

**Made-to-measure orders are refused, by design.** For a custom size,
`resolveOrder()` falls back to the base price, and your own checkout copy says
the final price is confirmed before anything is cast on. Charging a card at that
point would take a number nobody agreed to, so the endpoint returns HTTP 409
with `{ quoteOnly: true }` and those orders stay on the existing enquiry flow.
If you later publish fixed made-to-measure surcharges, remove that guard and
fold the surcharge into `order.price` in [src/lib/order.ts](src/lib/order.ts) —
the endpoint needs no further change.

### Resolved: `cancel_url`

Set to `${process.env.DOMAIN}/checkout?${draft}`, so abandoning payment returns
the customer to the order they had already configured rather than an empty page.

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly.

**Files containing these parameters:**
- [src/app/api/create-checkout-session/route.ts](src/app/api/create-checkout-session/route.ts)

| Parameter | Value |
|-----------|-------|
| `ui_mode` | `hosted_page` |
| `billing_address_collection` | `auto` |
| `phone_number_collection` | `{ enabled: false }` |
| `automatic_tax` | `{ enabled: false }` |
| `allow_promotion_codes` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0001` |
| `origin_context` | `web` |

`payment_method_collection` was intentionally omitted: it only applies when
`mode` is `subscription`.

### `ui_mode` version dependency

`ui_mode` is set to `hosted_page` because the installed `stripe` SDK is
**22.6.2** (≥ 21.0.0). If you ever downgrade the SDK below 21.0.0, this value
must change to `hosted`.

### Note on `allow_promotion_codes: false`

The site has its own promo codes (`WELCOME10`, `SOFTRIOT15` in
[src/data/products.ts](src/data/products.ts)), applied client-side on the
checkout page. With `allow_promotion_codes: false`, Stripe will not show a promo
field of its own, and the discount is **not** currently passed to Stripe — so a
discounted order would still be charged full price. Either fold the discount
into the `unit_amount` above, or move promotions into Stripe Coupons and set
this to `true`.

## Setup

### 1. Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|----------|-----------------|
| `STRIPE_SECRET_KEY` | [Dashboard → API keys](https://dashboard.stripe.com/test/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | [Dashboard → Webhooks](https://dashboard.stripe.com/workbench/webhooks), or the `stripe listen` output |
| `DOMAIN` | `http://localhost:3000` locally; your live origin in production |

`.gitignore` already excludes `.env*.local`. Server-only variables must **not**
carry the `NEXT_PUBLIC_` prefix — that prefix ships the value to the browser.

For production, set the same three variables in your Netlify site settings
(Site configuration → Environment variables).

### 2. Dependency

`stripe@22.6.2` was added to `package.json`. Run `npm install` on any other
machine or in CI.

## Project Structure

Files created by this integration:

```
src/app/api/create-checkout-session/route.ts   Creates the Checkout Session
src/app/api/stripe/webhook/route.ts            Verifies + handles Stripe events
.env.example                                   Template for .env.local
STRIPE_INTEGRATION_TODO.md                     This file
```

## How It Works

1. The configurator builds an `OrderDraft` and links to `/checkout?<query>`
   (see [src/lib/order.ts](src/lib/order.ts)).
2. The checkout page POSTs that same query string to
   `/api/create-checkout-session` as `{ "draft": "p=sr01&c=midnight&s=M" }`.
3. The endpoint re-resolves the order **server-side** with `resolveOrder()`, so
   the price comes from your own data rather than from the browser, and attaches
   the piece's details as session metadata.
4. It responds with `{ url }`; the browser navigates there and Stripe collects
   payment.
5. Stripe sends `checkout.session.completed` to the webhook, which is where
   fulfilment belongs — the `success_url` redirect is not a reliable signal,
   since a customer can close the tab before it ever loads.

### Still to wire: the checkout button

[src/components/configurator/Checkout.tsx](src/components/configurator/Checkout.tsx)
still posts to Netlify Forms and shows a confirmation modal saying payment will
be arranged by email. Nothing calls the new endpoint yet. To switch it over, add
this alongside the existing `submitOrder()`:

```ts
async function payWithStripe() {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft: params.toString() }),
  });
  const { url, error } = await res.json();
  if (!url) throw new Error(error ?? 'Could not start checkout.');
  window.location.href = url;
}
```

Decide first whether the Netlify Forms submission should still run — it is
currently the thing that notifies you an order exists. The webhook can replace
it, but only once fulfilment is implemented there.

## Testing

Run the app with `npm run dev`, then forward events to the local webhook:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`.

Test cards (any future expiry, any CVC, any postcode):

| Card number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Declined — insufficient funds |
| `4000 0000 0000 0002` | Declined — generic |

Test-mode keys (`sk_test_...`) never move real money. Switch to live keys only
after the placeholders above are replaced.

## Next Steps

1. **Create the success page** and point `success_url` at it — right now a
   customer who pays successfully lands on a 404.
2. Wire the Order button to the endpoint (snippet above), including the 409
   `quoteOnly` fallback for made-to-measure orders.
3. Implement fulfilment in the webhook: email yourself and the customer, and
   record the order somewhere durable. `session.metadata` has the piece details;
   `session.customer_details` has the name, email and address.
4. Decide how promo codes are handled (see the note above) — until then, a
   discounted order is charged full price.
5. Add the customization-level surcharges to `resolveOrder()` once the numbers
   are agreed, and drop the made-to-measure guard in the endpoint.
6. Enable PromptPay in the
   [Dashboard](https://dashboard.stripe.com/settings/payment_methods) — it is
   widely used in Thailand and cheaper than cards.
7. Set the live environment variables in Netlify and register the production
   webhook endpoint at `https://youloop.co/api/stripe/webhook`.

## Resources

- Stripe documentation — https://docs.stripe.com
- Stripe MCP server — https://docs.stripe.com/mcp
- Stripe support — https://support.stripe.com
