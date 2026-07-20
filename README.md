# CreatorPilot

All-in-one monetization command center for content creators.

## Tech Stack

React (Vite) + Express + SQLite + Tailwind CSS v4

## Key Features

- **Sponsorship CRM** with Kanban pipeline — track deals from lead to closed
- **Affiliate program management** — manage partners, links, and commissions
- **Lead capture** with funnel visualization
- **Digital product listings** with AI-powered pricing guidance
- **Brand kit builder** — store and manage brand assets
- **5 AI-powered tools** (OpenAI GPT-4o-mini): pricing suggestions, brand matching, smart follow-ups, content ideas, brand discovery
- **Analytics dashboard** with charts
- **Stripe subscription billing** — three tiers (Free / Pro $29/mo / Studio $79/mo), currently in test mode
- **Email** via Resend + Gmail SMTP fallback
- **PWA** installable with offline support
- **Light/dark theme** with glass-morphism design
- **Interactive demo tour** at `/demo` (7 steps)

## Quick Start

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the required keys:

```
JWT_SECRET=
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_STUDIO_PRICE_ID=
OPENAI_API_KEY=
SMTP_USER=
SMTP_PASS=
```

```bash
npm run build && node server/index.js
```

## Domain

`dianova.tech` — owner-owned on IONOS, included in the sale.

## Sale Notes

This application is built for private sale. Stripe is in **test mode** — the buyer swaps to live keys to go live. Resend domain verification is pending — the buyer completes DNS setup. Social handles are unclaimed.

Marketing assets (outreach guide, launch kit, teaser video script) are included.
