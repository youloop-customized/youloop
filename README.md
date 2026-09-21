# YOU LOOP — Next.js site

The YOU LOOP site, converted from nine standalone HTML files to a Next.js 15
App Router project. Deploys to Netlify; Netlify Forms and the
`submission-created` notification function work exactly as before.

## Requirements

- Node.js 20 or newer (Netlify is pinned to 20 in `netlify.toml`)

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # serve the production build
```

Note: form submissions POST to `/__forms.html`, which only Netlify answers.
Locally a submit will fail and show the form's error path. To test forms
end-to-end, use `netlify dev` (`npm i -g netlify-cli`) or a deploy preview.

## Routes

| Route                  | Was                              |
| ---------------------- | -------------------------------- |
| `/`                    | `index.html`                     |
| `/about`               | `youloop_about.html`             |
| `/journal`             | `youloop_blog.html`              |
| `/journal?post=<slug>` | `youloop_blog.html?post=<slug>`  |
| `/collection/sr01`     | `SR01_Colour_Configurator.html`  |
| `/collection/sr02`     | `SR02_Colour_Configurator.html`  |
| `/collection/srac01`   | `SRAC01_Hood_Configurator.html`  |
| `/b2b`                 | `b2b.html`                       |
| `/bulk-inquiry`        | `youloop_bulk_inquiry.html`      |
| `/zucity`              | `zucity_preorder.html`           |

Every old `.html` URL 301-redirects to its new route (see `next.config.mjs`),
so existing links, QR codes and search results keep working.

## Layout

```
public/
  __forms.html              Netlify Forms field declarations (see below)
  images/                   All site imagery
    cards/                  Home-page carousel photos (were base64 in index.html)
    yarn/                   81 yarn swatches (were base64 in all 3 configurators)
src/
  app/                      Routes; each page owns its CSS Module
  components/
    SiteNav / SiteFooter    Shared chrome, previously copy-pasted per page
    configurator/           One component behind all three product pages
    forms/                  Shared form primitives + the b2b and bulk forms
    home/ journal/ zucity/  Page-specific islands
  data/                     Content and configuration, no markup
    products.ts             What differs between SR-01, SR-02 and SR-AC01
    yarns.ts                The 81-colour palette
    blog.ts                 The 11 Journal articles
    collection.ts           Home-page product cards
    site.ts                 Nav links, socials, brand strings
  lib/                      Fonts, formatting, Netlify submit helpers
netlify/functions/
  submission-created.js     Unchanged — emails the order card via Resend
```

## Netlify Forms

Netlify finds forms by parsing deployed HTML, and a React form is not in the
HTML at deploy time. `public/__forms.html` declares every form and every field
instead, and the client posts submissions to that path (`src/lib/netlify.ts`).

**If you add or rename a form field, add it to `public/__forms.html` too** —
a field missing from that file is silently dropped from the stored submission.

Forms in use: `custom-request`, `b2b-inquiry`, `bulk-inquiry`, `order-sr01`,
`order-sr02`, `order-srac01`, `zucity-preorder`, `zucity-payment-confirmation`.

## Environment variables

Set on the Netlify site (Site configuration → Environment variables). These
are the same ones the old site used:

| Variable         | Required | Purpose                                                    |
| ---------------- | -------- | ---------------------------------------------------------- |
| `RESEND_API_KEY` | Yes      | Sends the order-card email. Without it submissions are still saved, just not emailed. |
| `NOTIFY_EMAIL`   | No       | Where the order card goes. Defaults to `hello.youloop@gmail.com`. |
| `RESEND_FROM`    | No       | From address. Defaults to `YOU LOOP <onboarding@resend.dev>`. |

## Deploying

`netlify.toml` sets the build command, publish directory and the Next.js
runtime plugin. Netlify installs `@netlify/plugin-nextjs` automatically from
that declaration — nothing to add to `package.json`.
