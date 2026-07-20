# Asset Inventory — CreatorPilot

Every deliverable the buyer receives in the sale.

---

## 1. Source Code

| Item | Details |
|------|---------|
| **GitHub repository** | `christinedm85/DiaNova` (private, transferred to buyer) |
| **Frontend** | 32 source files (React + TypeScript + Vite) |
| **Backend** | 28 source files (Express + Node.js) |
| **Build output** | 608 modules transformed, production bundle ~740 KB JS + ~57 KB CSS (gzipped: ~202 KB + ~9 KB) |
| **Database** | SQLite (file-based, zero config — database file created automatically on first run) |
| **License** | Full ownership transferred to buyer — no dependencies on seller after sale |

---

## 2. Domain

| Item | Details |
|------|---------|
| **Domain** | `dianova.tech` |
| **Registrar** | IONOS |
| **Status** | Owner-owned, transferred to buyer as part of sale |

---

## 3. Branding Assets

All files located in `/home/team/shared/logos/`:

| File | Description |
|------|-------------|
| `variation-1-compass-c.png` | Primary logo — compass "C" icon |
| `variation-2-play-compass.png` | Logo variation — play button + compass |
| `variation-3-cp-monogram.png` | Logo variation — CP monogram |
| `variation-4-yoke-aperture.png` | Logo variation — yoke/aperture design |
| `wordmark-horizontal.png` | Horizontal wordmark ("CreatorPilot") |
| `app-icon-192.png` | PWA app icon (192×192) |
| `app-icon-512.png` | PWA app icon (512×512) |
| `apple-touch-icon.png` | Apple touch icon for iOS |
| `favicon-16.png` | Favicon (16×16) |
| `favicon-32.png` | Favicon (32×32) |
| `favicon-source.png` | Favicon source/working file |
| `favicon.ico` | Favicon ICO format |

**Total:** 13 branding files in multiple formats and variations.

---

## 4. Marketing Assets

Located in `/home/team/shared/`:

| File | Description | Size |
|------|-------------|------|
| `creator-outreach-guide.md` | Strategy guide for reaching out to content creators (58 lines) | ~2.3 KB |
| `marketing-launch-kit.md` | Full launch kit with positioning, messaging, channels, and timeline (142 lines) | ~13 KB |
| `teaser-video-script.md` | Script for a product teaser/demo video (89 lines) | ~5 KB |
| `landing-page.png` | Screenshot of the landing page for reference/marketing use | ~64 KB |

---

## 5. Integrations

| Integration | Status | Details |
|-------------|--------|---------|
| **Stripe** | Test mode | Subscription billing built for Free / Pro ($29/mo) / Studio ($79/mo). Webhook handling included. Buyer swaps to live keys. |
| **Resend** | Configured, pending DNS | Email sending from `noreply@dianova.tech`. Gmail SMTP fallback configured. Domain verification DNS records needed. |
| **OpenAI** | Operational | GPT-4o-mini powering 5 AI tools. Buyer provides own API key. |

---

## 6. Environment Variables

9 environment variables documented in the README:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | JWT signing secret for authentication |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `STRIPE_SECRET_KEY` | Stripe secret key for payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for Pro tier ($29/mo) |
| `STRIPE_STUDIO_PRICE_ID` | Stripe Price ID for Studio tier ($79/mo) |
| `OPENAI_API_KEY` | OpenAI API key for AI tools |
| `SMTP_USER` | Gmail SMTP username (fallback email) |
| `SMTP_PASS` | Gmail SMTP app password (fallback email) |

**Note:** There is no `.env.example` file in the repo — the env structure is documented inline in the README. The buyer creates `.env` from the README's documented variables.

---

## 7. Deployment

| Item | Details |
|------|---------|
| **Current demo** | Running at a temporary cto.new demo URL |
| **Production hosting** | Buyer's choice — any Node.js host (Render, Railway, Fly.io, VPS, etc.) |
| **Build command** | `npm run build && node server/index.js` |
| **Port** | Configurable; Express serves both API and the Vite production build |

---

## 8. Product Features (Built & Functional)

- Sponsorship CRM with Kanban pipeline
- Affiliate program management
- Lead capture with funnel visualization
- Digital product listings with AI pricing guidance
- Brand kit builder
- 5 AI-powered tools (OpenAI GPT-4o-mini)
- Analytics dashboard with charts
- Stripe subscription billing (test mode)
- Email via Resend + Gmail SMTP
- Team accounts (Studio tier)
- PWA with offline support
- Light/dark theme (glass-morphism design)
- Interactive demo tour (7 steps)
- JWT auth with email verification and password reset
