# Financials — CreatorPilot

---

## Pricing Tiers

| Tier | Monthly Price | Annual Equivalent | What's Included |
|------|--------------|-------------------|-----------------|
| **Free** | $0 | $0 | Basic features, limited usage — top of acquisition funnel |
| **Pro** | $29/mo | ~$290/yr (if annual billing added) | Full feature set, AI tools, analytics, unlimited usage |
| **Studio** | $79/mo | ~$790/yr (if annual billing added) | Everything in Pro plus team accounts, multi-user collaboration |

All pricing is implemented in Stripe (currently in test mode). The buyer creates live products/prices in their Stripe dashboard and swaps keys to go live.

---

## Revenue Projection

### Market Context

The content creator economy is large and growing:

- **YouTube:** ~51 million active creator channels worldwide
- **TikTok:** ~2 million creators with 100K+ followers
- **Twitch:** ~7 million unique monthly streamers
- **Instagram:** ~500,000 active influencer accounts
- **Podcasting:** ~5 million active shows

The addressable market for a monetization tool is creators who earn income from multiple revenue streams — sponsorships, affiliates, digital products, and brand deals. Even a conservative estimate puts this in the hundreds of thousands of creators who would benefit from a unified command center.

### Funnel Model

```
Total addressable creators (millions)
    ↓
Free tier signups ← top of funnel (content marketing, social, Product Hunt)
    ↓ ~3-5% conversion
Pro tier ($29/mo) ← core revenue driver
    ↓ ~10-15% of Pro
Studio tier ($79/mo) ← higher ARPU, teams
```

### Conservative Scenario (Year 1)

| Metric | Value |
|--------|-------|
| Free tier signups | 2,000 |
| Pro conversions (4%) | 80 paying users |
| Studio conversions (15% of Pro) | 12 paying users |
| **MRR** | 80 × $29 + 12 × $79 = **$3,268/mo** |
| **ARR** | **~$39,200** |

### Moderate Scenario (Year 1)

| Metric | Value |
|--------|-------|
| Free tier signups | 5,000 |
| Pro conversions (5%) | 250 paying users |
| Studio conversions (12% of Pro) | 30 paying users |
| **MRR** | 250 × $29 + 30 × $79 = **$9,620/mo** |
| **ARR** | **~$115,400** |

### Note on Projections

These are illustrative scenarios based on typical SaaS conversion rates for freemium products in the creator tools space. The buyer's actual results depend on marketing execution, positioning, and competitive landscape. **There are no existing users or historical revenue data** — the buyer starts from zero with a finished product.

---

## Operating Costs

| Cost Category | Monthly Estimate | Notes |
|---------------|-----------------|-------|
| **Hosting** | $20–$50/mo | Any Node.js host (Render, Railway, Fly.io, $5–$20 VPS). Scales with usage. |
| **OpenAI API** | Variable, per-call | GPT-4o-mini is ~$0.15/1M input tokens. At typical usage: ~$10–$50/mo for a small user base. Grows with user count. |
| **Resend Email** | $0–$20/mo | Resend free tier: 100 emails/day (3,000/month). Paid starts at $20/mo for 50K emails. |
| **Domain** | ~$1/mo | dianova.tech renewal (IONOS), included with domain transfer |
| **Stripe fees** | 2.9% + $0.30 per transaction | Standard Stripe processing. Deducted from revenue, not a separate bill. |
| **Total fixed** | **~$30–$70/mo** | Before any users |

### Break-Even Point

At the conservative scenario: ~3 paying Pro users covers all fixed operating costs. Everything beyond that is profit margin. The business is designed to be profitable from very early traction.

---

## Current Financial State

| Metric | Value |
|--------|-------|
| **Existing users** | 0 |
| **Existing revenue** | $0 |
| **Existing MRR** | $0 |
| **Technical debt** | None (never launched, no pivots) |
| **Customer support burden** | None |
| **Refund/chargeback history** | None |

This is a clean-slate acquisition. The buyer is purchasing a finished product and the opportunity to build a user base from scratch — no legacy obligations, no unhappy customers, no technical debt from rushed fixes.

---

## What the Buyer Is Paying For

Instead of spending 3–6 months and $30K–$80K+ on development (design, frontend, backend, Stripe integration, AI features, auth, email, PWA, testing), the buyer gets:

- A complete, production-ready SaaS application
- All source code with full ownership
- Professional branding and marketing assets
- A domain with a clean reputation
- Zero legacy obligations

The asking price should be evaluated against the cost and time to build an equivalent product from scratch.
