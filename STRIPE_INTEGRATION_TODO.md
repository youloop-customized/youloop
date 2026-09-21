# Stripe + Email Integration — Remaining Setup

Hosted Stripe Checkout plus the two order emails. This file is the single
source of truth for what is left to do before going live.

## The flow

| Order type | What happens |
|---|---|
| **Preset size** (XS–XL) | Netlify Forms record → Stripe Checkout → paid → webhook emails the customer a confirmation and you an order card |
| **Made to measure** | Netlify Forms record → `/api/custom-order` → customer gets "we're on it", you get a QUOTE NEEDED card → **you send a Stripe payment link by hand** |

Nothing is charged automatically for a made-to-measure piece, by design: the
price on screen is a starting quote, and your checkout copy promises the final
figure is confirmed first.

## Before going live — required

### 1. Resend domain — ✅ done

`youloop.co` is verified and sending. Confirmed live in DNS:

| Record | Value |
|---|---|
| DKIM | `resend._domainkey.youloop.co` |
| SPF | TXT on `send.youloop.co` |
| MX (bounces) | `send.youloop.co` → `feedback.forge.rmta.net` |
| DMARC | `_dmarc` → `v=DMARC1; p=none;` |

Two follow-ups, neither blocking:

- **DMARC has no `rua=`**, so you receive no reports and `p=none` tells you
  nothing. Point it at a free reporting service
  ([Postmark DMARC digests](https://dmarc.postmarkapp.com)) before tightening
  to `p=quarantine`.
- **`RESEND_FROM` is a bare address** (`hello@youloop.co`). Recipients see the
  raw address as the sender name. `YOU LOOP <hello@youloop.co>` reads better.

⚠ **Root `youloop.co` still has no MX records**, so `hello@youloop.co` cannot
*receive* mail. Sending works regardless — MX only governs inbound — but every
order email invites a reply, and those replies currently bounce.
[ImprovMX](https://improvmx.com) forwards to your Gmail for free in ten minutes.

[src/lib/email.ts](src/lib/email.ts) skips customer email entirely whenever
`RESEND_FROM` is unset or still the sandbox sender, so a misconfiguration
degrades quietly rather than silently dropping mail.

### 2. Environment variables

```bash
cp .env.example .env.local
```

| Variable | Where to get it | Notes |
|----------|-----------------|-------|
| `STRIPE_SECRET_KEY` | [Dashboard → API keys](https://dashboard.stripe.com/test/apikeys) | Server-only |
| `STRIPE_WEBHOOK_SECRET` | [Dashboard → Webhooks](https://dashboard.stripe.com/workbench/webhooks) or `stripe listen` | |
| `DOMAIN` | `http://localhost:3000` locally, your live origin in production | Builds success/cancel URLs |
| `RESEND_API_KEY` | [Resend → API keys](https://resend.com/api-keys) | Already used by the Netlify function |
| `RESEND_FROM` | Your verified domain | See above — blocking |
| `NOTIFY_EMAIL` | Your inbox | Defaults to `hello.youloop@gmail.com` |

`.gitignore` already excludes `.env*.local`. Server-only variables must **not**
carry the `NEXT_PUBLIC_` prefix. Set the same variables in Netlify under
Site configuration → Environment variables.

### 3. Register the production webhook

Endpoint `https://youloop.co/api/stripe/webhook`, subscribed to **all three**:

```
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
```

Copy its signing secret into `STRIPE_WEBHOOK_SECRET` in Netlify.

Locally, the same three:

```bash
stripe listen --api-key sk_test_YOURKEY \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed \
  --forward-to localhost:3000/api/stripe/webhook
```

The signing secret the CLI prints is different from the Dashboard endpoint's,
and changes on each restart unless you pass `--load-from-webhooks-api`. If
confirmation emails stop arriving after restarting the CLI, that is why.

### 4. PromptPay

Enable it under
[Dashboard → Payment methods](https://dashboard.stripe.com/settings/payment_methods).
No code change is needed — `payment_method_types` is deliberately not set, so
Checkout offers whatever the Dashboard has enabled.

PromptPay requires THB (which this uses), is one-time payment only (which this
is), supports refunds, and caps at ฿2,000,000 per transaction — far above any
YOU LOOP piece.

**Why the webhook is written the way it is.** Cards are settled by the time
`checkout.session.completed` fires. PromptPay is not guaranteed to be: the
Session can complete with `payment_status: "unpaid"` while the QR is still
unscanned, and settle later via `async_payment_succeeded`. So the handler only
confirms when `payment_status === 'paid'`, and treats the async event as the
other way an order becomes paid. Without that gate, a PromptPay customer would
be told their payment came through before they had paid.

`async_payment_failed` (usually an expired QR) sends you an internal alert only
— the customer abandoned it and already knows.

## Values to Replace

Everything Checkout Studio left as a placeholder has been resolved. Nothing is
outstanding.

| Field | Status |
|-------|--------|
| `mode` | `payment` — correct, every piece is a one-time charge |
| `success_url` | Points at `/success`, which now exists |
| `cancel_url` | `/checkout?<draft>` — returns to the configured order |
| `line_items` | Uses `price_data` from the resolved order — see below |

### `line_items` uses `price_data`, not a Price ID

YOU LOOP prices are computed, so a fixed Price ID could never have been right.
`resolveOrder()` already returns the correct amount per size (SR-01 is ฿2,690
for XS–M, ฿2,890 for L, ฿3,040 for XL) and the endpoint charges exactly that:

```ts
price_data: {
  currency: 'thb',
  unit_amount: order.price * 100, // satang — thb is a two-decimal currency
  product_data: { name: ..., description: ... },
}
```

No Price IDs need creating in the Dashboard. When you settle the customization
surcharges, fold them into `order.price` in [src/lib/order.ts](src/lib/order.ts)
and the endpoint needs no change.

## Configured Parameters

Set in Checkout Studio, already correct in
[src/app/api/create-checkout-session/route.ts](src/app/api/create-checkout-session/route.ts).

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

`payment_method_collection` is intentionally omitted — it only applies when
`mode` is `subscription`.

`ui_mode` is `hosted_page` because the installed `stripe` SDK is **22.6.2**
(≥ 21.0.0). Downgrading below 21.0.0 would require changing it to `hosted`.

## Known gap: promo codes

`WELCOME10` and `SOFTRIOT15` (in [src/data/products.ts](src/data/products.ts))
are applied in the UI but **never reach Stripe**, so a discounted order is
charged full price. With `allow_promotion_codes: false`, Stripe shows no promo
field of its own either.

Pick one:
- Subtract the discount from `unit_amount` before creating the session, or
- Move the codes into Stripe Coupons and set `allow_promotion_codes: true`

## Project Structure

```
src/app/api/create-checkout-session/route.ts   Creates the Checkout Session (preset sizes)
src/app/api/custom-order/route.ts              Acknowledges made-to-measure orders
src/app/api/stripe/webhook/route.ts            Verifies events, sends paid confirmations
src/app/success/page.tsx                       Post-payment receipt page
src/lib/email.ts                               Resend sender (plain fetch, no SDK)
src/lib/order-emails.ts                        The three email templates
src/lib/order-request.ts                       Shared payload parsing for both endpoints
.env.example                                   Template for .env.local
```

## How It Works

1. The configurator builds an `OrderDraft` and links to `/checkout?<query>`.
2. The checkout page files the order with Netlify Forms — the durable record,
   kept for both paths — then POSTs the draft plus customer details to
   `/api/create-checkout-session`.
3. That endpoint re-resolves the order **server-side**, so the price comes from
   your own data and never from the browser.
   - Preset size → creates the session, responds `{ url }`, browser redirects.
   - Custom size → responds `409 { quoteOnly: true }`; the page then calls
     `/api/custom-order` and shows the "we're on it" modal.
4. Stripe sends `checkout.session.completed` to the webhook, which rebuilds the
   order from `metadata.draft` and sends both emails. Fulfilment lives here and
   not on `success_url`, because a customer can close that tab.
5. `/success` reads the session back from Stripe rather than trusting the URL,
   so it cannot be faked by editing the query string.

### Duplicate emails

Stripe retries a webhook on any non-2xx reply. Each send passes an
`Idempotency-Key` of `paid-customer-<session_id>` / `paid-internal-<session_id>`,
so a retry cannot mail the same customer twice. Failures inside the handler are
logged and swallowed rather than thrown — throwing would make Stripe retry the
whole event after the money has already moved.

## Testing

```bash
npm run dev
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`.

| Card number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure |
| `4000 0000 0000 9995` | Declined — insufficient funds |
| `4000 0000 0000 0002` | Declined — generic |

Any future expiry, any CVC. Test-mode keys never move real money.

To check the emails end to end before going live, place a test order against
your own address with real `RESEND_API_KEY` and a verified `RESEND_FROM`.

## Next Steps

1. Get `STRIPE_WEBHOOK_SECRET` from `stripe listen` and finish a live test order.
2. Enable PromptPay in the
   [Dashboard](https://dashboard.stripe.com/settings/payment_methods) — the code
   already handles it.
3. Add MX records so `hello@youloop.co` can receive replies.
4. Decide how promo codes are handled (see above).
5. Add the customization surcharges to `resolveOrder()` once the numbers are
   agreed, then decide whether made-to-measure should still be quote-only.
6. Activate the Stripe account (ID, Thai TIN, bank details) to take real money.
7. Register the production webhook and set the live environment variables in
   Netlify.
8. Consider recording paid orders somewhere queryable. Netlify Forms holds the
   submission, but it does not know whether payment succeeded.

## Resources

- Stripe documentation — https://docs.stripe.com
- Stripe MCP server — https://docs.stripe.com/mcp
- Stripe support — https://support.stripe.com
- Resend domains — https://resend.com/domains
