import { useState, useEffect } from 'react'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    features: ['Basic sponsorship tracker', '3 affiliate links', '1 digital product', 'Pricing guidance'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 29,
    features: ['Full sponsorship CRM', 'Unlimited affiliates', 'Digital product sales + analytics', 'Lead capture forms', 'Brand kit builder', 'Email inbox'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Studio',
    price: 79,
    features: ['Multi-channel dashboards', 'White-labeled proposals', 'Team access (up to 5)', 'Priority support', 'Everything in Pro'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

const FEATURES = [
  { title: 'Sponsorship Pipeline', desc: 'Track every deal from prospecting to paid. Move deals through stages, never miss a follow-up.', icon: '🤝' },
  { title: 'Affiliate Optimization', desc: 'See which links convert. Get recommendations for untapped high-commission programs.', icon: '📈' },
  { title: 'Lead Capture', desc: 'Beautiful landing pages that convert visitors into leads. Built-in funnel analytics.', icon: '👥' },
  { title: 'Smart Pricing', desc: 'Stop underpricing. Get data-driven rate recommendations based on your audience size and niche.', icon: '💰' },
  { title: 'Digital Products', desc: 'Sell templates, guides, and presets directly. We track sales and suggest new product ideas.', icon: '📦' },
  { title: 'Brand Builder', desc: 'Define your voice, generate content ideas, and track your brand health score.', icon: '🎨' },
]

export default function LandingPage({ onGetStarted, onLogin }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handle)
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Nav */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">
            <span className="gradient-text">Creator</span>
            <span className="text-surface-50">Pilot</span>
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="px-4 py-2 text-sm font-medium text-surface-300 hover:text-surface-100 transition-colors">
              Sign In
            </button>
            <button onClick={onGetStarted} className="px-5 py-2 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-600/25 active:scale-95">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-medium mb-6">
          🚀 Now in public beta
        </div>
        <h2 className="font-display text-5xl md:text-6xl font-bold text-surface-50 leading-tight">
          Turn your content
          <br />
          <span className="gradient-text">into a business</span>
        </h2>
        <p className="text-surface-400 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
          CreatorPilot is the all-in-one monetization platform for content creators.
          Manage sponsorships, optimize affiliates, sell products, and build your brand —
          all from one dashboard.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={onGetStarted} className="px-7 py-3 bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-xl shadow-accent-600/30 active:scale-95 text-lg">
            Start Free →
          </button>
          <button className="px-7 py-3 bg-surface-800 hover:bg-surface-700 text-surface-200 font-semibold rounded-xl transition-colors text-lg">
            Watch Demo
          </button>
        </div>
        <p className="text-surface-600 text-sm mt-4">No credit card required · Free plan forever</p>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="glass p-8 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="font-display text-3xl font-bold text-surface-50">$14K+</p>
            <p className="text-surface-500 text-sm mt-1">Avg. monthly revenue per creator</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-surface-50">2,400+</p>
            <p className="text-surface-500 text-sm mt-1">Creators on the platform</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-surface-50">22%</p>
            <p className="text-surface-500 text-sm mt-1">Average rate increase after joining</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h3 className="font-display text-3xl font-bold text-surface-50">Everything you need to monetize</h3>
          <p className="text-surface-400 mt-3">Six powerful tools in one platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="glass p-6 glass-hover">
              <span className="text-3xl">{f.icon}</span>
              <h4 className="font-display font-semibold text-surface-100 mt-3 text-lg">{f.title}</h4>
              <p className="text-sm text-surface-400 mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h3 className="font-display text-3xl font-bold text-surface-50">Simple, transparent pricing</h3>
          <p className="text-surface-400 mt-3">Start free, upgrade when you&apos;re ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`glass p-8 flex flex-col relative ${plan.highlight ? 'ring-2 ring-accent-500/50' : ''}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-accent-600 text-white text-xs font-bold rounded-full">
                  Most Popular
                </span>
              )}
              <h4 className="font-display text-xl font-bold text-surface-100">{plan.name}</h4>
              <div className="mt-3 mb-6">
                <span className="font-display text-5xl font-bold text-surface-50">${plan.price}</span>
                <span className="text-surface-500 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  plan.highlight
                    ? 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg shadow-accent-600/25'
                    : 'bg-surface-800 hover:bg-surface-700 text-surface-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="glass p-12 bg-gradient-to-br from-accent-600/10 to-purple-600/10">
          <h3 className="font-display text-3xl font-bold text-surface-50">Ready to earn more from your content?</h3>
          <p className="text-surface-400 mt-3 mb-8">Join 2,400+ creators who are already using CreatorPilot.</p>
          <button onClick={onGetStarted} className="px-8 py-3.5 bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-xl shadow-accent-600/30 active:scale-95 text-lg">
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800/50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-surface-600">
          <p>© 2026 CreatorPilot. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-surface-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-surface-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-surface-400 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
