# Portfolio Editor — Seller Setup

This is the source for a hosted portfolio-builder you sell licenses to on Gumroad.
Buyers visit your hosted editor URL, customize their site visually, enter their
license key, and download a deploy-ready `.zip`. They never touch code.

---

## Architecture

- **You host the editor** (this repo) at a public URL — Netlify or Vercel.
- **Gumroad sells license keys** for one product.
- **Buyer flow**: visit URL → customize → click *Download my site* → enter license
  key → get a `.zip` → drag onto netlify.com/drop.

The "Download my site" button calls Gumroad's license verification API. Once a
key is verified, it's cached in the buyer's browser so they can re-download
without re-entering it.

---

## One-time setup

### 1. Create the Gumroad product

1. Go to Gumroad → New Product → "Digital product".
2. Title and price it however you like.
3. Under **Content**, you can attach a tiny `welcome.txt` file (Gumroad requires
   *something* attached). The real product is the hosted URL.
4. Under **Settings → Generate license keys for this product**, enable license keys.
5. Copy the product **permalink** — it's the slug at the end of the product URL
   (e.g. for `https://gumroad.com/l/abc123` the permalink is `abc123`).

### 2. Wire up the permalink

Open [src/SettingsPanel.jsx](src/SettingsPanel.jsx) and replace the placeholder:

```js
const GUMROAD_PRODUCT_PERMALINK = 'YOUR_GUMROAD_PERMALINK'
```

### 3. Deploy

```
npm install
npm run package-template     # builds the buyer-facing template bundle
git add . && git commit -m "ready"
```

Then push to GitHub and connect the repo to Netlify or Vercel. Build command:
`npm run package-template`. Publish directory: `dist`.

That's it — your editor is live.

### 4. Update your Gumroad listing

In the product description, link to your live editor URL with a "Live Preview"
button. In the post-purchase message, tell buyers to visit the editor URL and
enter the license key shown on the receipt page.

---

## Updating the template later

Whenever you change the editor itself (new field, color tweak, etc.):

```
npm run package-template
```

This rebuilds `dist/` and refreshes `public/template.zip` — the bundle the
buyer's "Download my site" button assembles their site from. Then redeploy.

---

## Local development

```
npm install
npm run dev
```

Open the URL it prints. The editor panel appears in the bottom-right.

---

## Files of note

- `src/App.jsx` — the portfolio site itself
- `src/SettingsPanel.jsx` — the editor side panel and Gumroad license gate
- `src/useSettings.js` — settings state; reads `window.__PORTFOLIO_CONFIG__` on
  deployed buyer sites, falls back to `src/config.js` in the editor
- `scripts/package-template.mjs` — zips `dist/` into `public/template.zip`
