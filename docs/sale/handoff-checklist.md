# Handoff Checklist — CreatorPilot

Step-by-step guide for the buyer to take CreatorPilot from purchased to live.

---

## Prerequisites

- [ ] GitHub account (to receive repo transfer)
- [ ] Stripe account (create at https://stripe.com if needed)
- [ ] Resend account (create at https://resend.com if needed)
- [ ] OpenAI account with API access (https://platform.openai.com)
- [ ] Hosting provider (Render, Railway, Fly.io, VPS, or any Node.js host)
- [ ] Access to dianova.tech DNS (transferred from seller via IONOS)

---

## Step 1: Receive the Codebase

- [ ] Accept GitHub repo transfer from seller (`christinedm85/DiaNova`)
- [ ] Clone the repo to your local machine:
  ```bash
  git clone git@github.com:<your-username>/DiaNova.git CreatorPilot
  cd CreatorPilot
  ```
- [ ] Install dependencies:
  ```bash
  npm install
  ```
- [ ] Verify the app builds successfully:
  ```bash
  npm run build
  ```
  Expected: "✓ built in <1s" with no errors.

---

## Step 2: Configure Environment

- [ ] Create `.env` from the variables documented in the README:
  ```bash
  cp README.md .env-reference  # or just reference the README directly
  ```
- [ ] Generate and set `JWT_SECRET`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Set up **Stripe**:
  - [ ] Get your live `STRIPE_SECRET_KEY` from Stripe Dashboard → Developers → API Keys
  - [ ] Create live products and prices in Stripe Dashboard:
    - Pro tier: $29/month subscription product
    - Studio tier: $79/month subscription product
  - [ ] Copy the price IDs into `STRIPE_PRO_PRICE_ID` and `STRIPE_STUDIO_PRICE_ID`
  - [ ] Set up a webhook endpoint pointing to `https://dianova.tech/api/stripe/webhook`
  - [ ] Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`
- [ ] Set up **Resend**:
  - [ ] Get your `RESEND_API_KEY` from Resend Dashboard → API Keys
  - [ ] Verify your domain (dianova.tech) in Resend — add the DNS records they provide
- [ ] Set up **OpenAI**:
  - [ ] Get your `OPENAI_API_KEY` from https://platform.openai.com/api-keys
- [ ] Set up **Gmail SMTP fallback** (optional but recommended):
  - [ ] Create a Gmail app password and set `SMTP_USER` and `SMTP_PASS`

---

## Step 3: Domain & DNS

- [ ] Accept domain transfer for `dianova.tech` from seller (initiated on IONOS)
- [ ] Verify DNS settings point to your hosting provider
- [ ] Add Resend verification DNS records (from Step 2)
- [ ] Wait for DNS propagation (can take up to 48 hours, usually < 1 hour)

---

## Step 4: Deploy

- [ ] Deploy to your hosting provider. The app is a standard Node.js + Express server:
  - Build: `npm run build`
  - Start: `node server/index.js`
  - The Express server serves both the API and the Vite production build from a single process
- [ ] Configure your host to serve on the appropriate port (the app uses `process.env.PORT` or defaults to a configured port)
- [ ] Verify the app is running at `https://dianova.tech`
- [ ] Test the key flows:
  - [ ] Sign up for a new account
  - [ ] Email verification arrives via Resend
  - [ ] Log in and explore the dashboard
  - [ ] Test the demo tour at `/demo`
  - [ ] Test Stripe checkout (Pro and Studio) — should now use live mode
  - [ ] Verify webhook handling (subscription activates after payment)

---

## Step 5: Final Pre-Launch Checks

- [ ] Confirm Stripe is in **live mode** (not test mode)
- [ ] Confirm Resend emails are sending from your verified domain
- [ ] Test the full signup → subscription → dashboard flow end-to-end
- [ ] Set up any monitoring/error tracking you want (Sentry, Logtail, etc.)
- [ ] Claim social media handles for CreatorPilot (Twitter/X, Instagram, TikTok, LinkedIn, YouTube)
- [ ] Review the marketing assets in the shared directory:
  - `creator-outreach-guide.md` — strategy for reaching creators
  - `marketing-launch-kit.md` — full launch playbook
  - `teaser-video-script.md` — script for a product video

---

## Step 6: Launch

- [ ] Announce on social media
- [ ] Submit to Product Hunt
- [ ] Start outreach to content creators using the outreach guide
- [ ] Monitor Stripe dashboard for first paying customers 🎉

---

## Quick Reference

| What | Where |
|------|-------|
| Repo | GitHub — `DiaNova` (transferred from seller) |
| Domain | `dianova.tech` (IONOS) |
| Stripe dashboard | https://dashboard.stripe.com |
| Resend dashboard | https://resend.com |
| OpenAI platform | https://platform.openai.com |
| Marketing assets | `/home/team/shared/` (outreach guide, launch kit, video script) |
| Branding assets | `/home/team/shared/logos/` (13 files) |

**Estimated time to live: one focused weekend.**
