import { useState, useEffect } from 'react'
import { useTheme } from '../ThemeContext.jsx'
import DemoTour from './DemoTour.jsx'
import {
  demoSponsorships,
  demoLeads,
  demoFunnel,
  demoProducts,
  demoRevenueTrend,
  demoPipelineData,
  demoRevenueBreakdown,
  demoRecentActivity,
} from './DemoData.js'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e']

const DEMO_SECTIONS = {
  dashboard: { label: 'Dashboard', icon: DashboardIcon },
  sponsorships: { label: 'Sponsorships', icon: SponsorshipIcon },
  leads: { label: 'Lead Gen', icon: LeadIcon },
  products: { label: 'Products', icon: ProductsIcon },
  ai: { label: 'AI Tools', icon: AIIcon },
}

export default function DemoPage({ onGetStarted }) {
  const [active, setActive] = useState('dashboard')
  const [showTour, setShowTour] = useState(true)
  const { theme, toggle } = useTheme()

  // Auto-start tour on mount
  useEffect(() => {
    setShowTour(true)
  }, [])

  const handleTourComplete = () => {
    setShowTour(false)
  }

  const handleTourSkip = () => {
    setShowTour(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Demo Sidebar */}
      <aside className="w-64 h-full glass rounded-none border-t-0 border-b-0 border-l-0 flex flex-col shrink-0">
        <div className="px-6 py-7 border-b border-surface-700/50">
          <div className="flex items-center gap-3">
            <img src="/icon-192.png" alt="CreatorPilot" className="w-11 h-11 rounded-2xl ring-1 ring-surface-700/50" />
            <div>
              <h1 className="font-display text-lg font-bold text-surface-50 tracking-tight">CreatorPilot</h1>
              <p className="text-[10px] text-surface-500 tracking-widest uppercase">Monetize Your Craft</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {Object.entries(DEMO_SECTIONS).map(([key, { label, icon: Icon }]) => {
            const isActive = active === key
            return (
              <button
                key={key}
                id={`demo-nav-${key}`}
                onClick={() => setActive(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent-600/15 text-accent-400 border-l-3 border-l-accent-500'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                }`}
              >
                <Icon active={isActive} />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="px-4 py-3 border-t border-surface-700/50 space-y-2">
          <button
            onClick={toggle}
            className="flex items-center gap-2 w-full text-xs text-surface-500 hover:text-surface-300 transition-colors px-1"
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="flex items-center gap-3 w-full rounded-xl p-2 -mx-2">
            <div className="w-10 h-10 rounded-full bg-accent-600/30 flex items-center justify-center text-xs font-bold text-accent-400 ring-2 ring-accent-500/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-surface-300">Demo Mode</p>
              <p className="text-xs text-amber-400">Preview only</p>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className="w-full px-4 py-2.5 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-600/25 active:scale-95"
          >
            Sign Up Free →
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {active === 'dashboard' && <DemoDashboard />}
          {active === 'sponsorships' && <DemoSponsorships />}
          {active === 'leads' && <DemoLeads />}
          {active === 'products' && <DemoProducts />}
          {active === 'ai' && <DemoAI />}
        </div>
      </main>

      {/* DemoTour Overlay */}
      {showTour && (
        <DemoTour
          currentSection={active}
          onNavigate={setActive}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
    </div>
  )
}

/* ─── Demo Dashboard ─────────────────────────────────────── */

function DemoDashboard() {
  return (
    <div className="page-enter space-y-8" id="demo-dashboard-section">
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50">Good morning, Alex</h2>
        <p className="text-surface-400 mt-1">Here's how your revenue streams are performing today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DemoStatCard label="Monthly Revenue" value="$4,250" change="+12.5%" positive color="accent" />
        <DemoStatCard label="Active Sponsors" value="7" change="+2 this month" positive color="emerald" />
        <DemoStatCard label="Affiliate Rev" value="$1,840" change="+8.2%" positive color="amber" />
        <DemoStatCard label="Product Sales" value="$890" change="-3.1%" positive={false} color="rose" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={demoRevenueTrend}>
              <defs>
                <linearGradient id="demoColorSponsor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="demoColorAff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="demoColorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px', color: '#e2e8f0' }}
                formatter={(v) => [`$${v.toLocaleString()}`, undefined]}
              />
              <Area type="monotone" dataKey="sponsorships" stroke="#6366f1" fill="url(#demoColorSponsor)" strokeWidth={2} />
              <Area type="monotone" dataKey="affiliates" stroke="#f59e0b" fill="url(#demoColorAff)" strokeWidth={2} />
              <Area type="monotone" dataKey="products" stroke="#10b981" fill="url(#demoColorProd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Breakdown Donut */}
        <div className="glass p-6 flex flex-col items-center">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-2 w-full">Revenue Mix</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={demoRevenueBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {demoRevenueBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px', color: '#e2e8f0' }}
                formatter={(v) => [`$${v.toLocaleString()}`, undefined]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-1">
            {demoRevenueBreakdown.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-surface-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Sponsorship Pipeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={demoPipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px', color: '#e2e8f0' }}
                formatter={(v) => [`${v} deals`, undefined]}
              />
              <Bar dataKey="deals" radius={[6, 6, 0, 0]}>
                {demoPipelineData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {demoRecentActivity.map((item, i) => (
              <DemoActivityItem key={i} action={item.action} detail={`${item.brand}${item.amount > 0 ? ` — $${item.amount.toLocaleString()}` : ''}`} time="Recently" />
            ))}
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">⚡ Smart Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DemoRecCard title="Raise your rates" desc="Similar creators with your engagement charge 22% more for sponsorships." tag="Pricing" />
          <DemoRecCard title="Untapped affiliate" desc="Your audience loves productivity tools. 3 brands in that niche offer 20%+ commissions." tag="Affiliates" />
          <DemoRecCard title="Launch a digital product" desc="Your top video topic has 84K views. Turn it into a $29 guide." tag="Products" />
        </div>
      </div>
    </div>
  )
}

/* ─── Demo Sponsorships ──────────────────────────────────── */

function DemoSponsorships() {
  const stages = [
    { key: 'prospecting', title: 'Prospecting', color: 'bg-surface-600', borderColor: 'border-l-surface-600' },
    { key: 'negotiating', title: 'Negotiating', color: 'bg-amber-400', borderColor: 'border-l-amber-400' },
    { key: 'confirmed', title: 'Confirmed', color: 'bg-accent-400', borderColor: 'border-l-emerald-500' },
    { key: 'completed', title: 'Completed', color: 'bg-emerald-400', borderColor: 'border-l-accent-400' },
  ]

  return (
    <div className="page-enter space-y-8" id="demo-sponsorships-section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Sponsorships</h2>
          <p className="text-surface-400 mt-1">Manage your brand partnerships and track deals.</p>
        </div>
        <div className="flex gap-2">
          <DemoDisabledButton icon={<ExportIcon />} label="Export CSV" />
          <DemoDisabledButton icon={<PlusIcon />} label="+ New Deal" primary />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map(({ key, title, color, borderColor }) => {
          const deals = demoSponsorships[key] || []
          return (
            <div key={key} className="glass p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-surface-200 text-sm">{title}</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color} text-white`}>{deals.length}</span>
              </div>
              {deals.map((deal, i) => (
                <div
                  key={deal.id}
                  className={`kanban-card p-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 transition-all duration-200 group border-l-[3px] ${borderColor}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-surface-500 text-xs mt-0.5 shrink-0 select-none">⋮⋮</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-surface-100 text-sm">{deal.brand}</p>
                        <p className="font-display font-semibold text-surface-200 text-lg">${deal.amount.toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-surface-500 mt-1">{deal.notes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Your Media Kit</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DemoMediaKitStat label="Avg. Video Views" value="142K" />
          <DemoMediaKitStat label="Engagement Rate" value="4.8%" />
          <DemoMediaKitStat label="Audience Demo" value="18-34 / 62% M" />
        </div>
        <div className="mt-4 flex gap-3">
          <DemoDisabledButton label="Edit Media Kit" />
          <DemoDisabledButton label="Download as PDF" />
        </div>
      </div>
    </div>
  )
}

/* ─── Demo Leads ─────────────────────────────────────────── */

function DemoLeads() {
  const stages = [
    { key: 'visitors', label: 'Visitors', value: demoFunnel.visitors, gradient: 'from-accent-400 to-accent-300' },
    { key: 'signups', label: 'Sign-ups', value: demoFunnel.signups, gradient: 'from-accent-500 to-accent-400' },
    { key: 'leads', label: 'Leads', value: demoFunnel.leads, gradient: 'from-accent-600 to-accent-500' },
    { key: 'qualified', label: 'Qualified', value: demoFunnel.qualified, gradient: 'from-accent-700 to-accent-500' },
  ]
  const maxFunnel = Math.max(demoFunnel.visitors, 1)

  return (
    <div className="page-enter space-y-8" id="demo-leads-section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Lead Generation</h2>
          <p className="text-surface-400 mt-1">Capture and nurture leads to grow your brand.</p>
        </div>
        <div className="flex gap-2">
          <DemoDisabledButton icon={<ExportIcon />} label="Export CSV" />
        </div>
      </div>

      {/* Funnel */}
      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-6">Conversion Funnel</h3>
        <div className="flex flex-col items-center">
          {stages.map((stage, i) => {
            const pct = Math.max((stage.value / maxFunnel) * 100, 5)
            const prevValue = i > 0 ? stages[i - 1].value : null
            const convRate = i > 0 && prevValue > 0 ? Math.round((stage.value / prevValue) * 100) : null
            return (
              <div key={stage.key} className="flex flex-col items-center w-full">
                {convRate !== null && (
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="text-[11px] font-medium text-surface-500">{convRate}%</span>
                    <span className="text-[11px] text-surface-600">→</span>
                  </div>
                )}
                <div
                  className={`h-10 bg-gradient-to-r ${stage.gradient} transition-all duration-1000 ease-out`}
                  style={{
                    width: `${pct}%`,
                    clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)',
                  }}
                />
                <div className="flex justify-between w-full mt-1.5" style={{ maxWidth: `${pct}%`, minWidth: '80px' }}>
                  <span className="text-[11px] text-surface-400">{stage.label}</span>
                  <span className="text-[11px] font-semibold text-surface-200">{stage.value.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leads list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Add New Lead</h3>
          <form className="space-y-3" onSubmit={e => e.preventDefault()}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">👤</span>
              <input disabled placeholder="Name" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-400 text-sm cursor-not-allowed opacity-60" />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">📧</span>
              <input disabled placeholder="Email" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-400 text-sm cursor-not-allowed opacity-60" />
            </div>
            <select disabled className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-400 text-sm cursor-not-allowed opacity-60">
              <option>Landing Page</option>
            </select>
            <div className="relative group/tip">
              <button disabled className="w-full px-4 py-2.5 bg-emerald-600/50 text-white/50 text-sm font-semibold rounded-lg cursor-not-allowed">
                Capture Lead
              </button>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-surface-800 text-surface-200 text-xs rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Sign up to start capturing leads
              </div>
            </div>
          </form>
        </div>
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Recent Leads ({demoLeads.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {demoLeads.map(lead => (
              <div key={lead.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-800/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-200">{lead.name}</p>
                  <p className="text-xs text-surface-500 truncate">{lead.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-surface-400">{lead.source}</p>
                  <p className="text-[11px] text-surface-600">{lead.captured}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Demo Products ──────────────────────────────────────── */

function DemoProducts() {
  const colorMap = {
    Templates: { bg: 'bg-accent-500/10', text: 'text-accent-400' },
    Presets: { bg: 'bg-amber-400/10', text: 'text-amber-400' },
    Guide: { bg: 'bg-rose-400/10', text: 'text-rose-400' },
    Toolkit: { bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
  }

  return (
    <div className="page-enter space-y-8" id="demo-products-section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Digital Products</h2>
          <p className="text-surface-400 mt-1">Create and sell digital products to your audience.</p>
        </div>
        <div className="flex gap-2">
          <DemoDisabledButton icon={<ExportIcon />} label="Export CSV" />
          <DemoDisabledButton icon={<PlusIcon />} label="+ New Product" primary />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demoProducts.map(p => {
          const c = colorMap[p.type] || colorMap.Guide
          return (
            <div key={p.id} className="glass glass-hover p-5 group relative">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{p.type}</span>
              <h4 className="font-display font-semibold text-surface-100 mt-3 text-lg">{p.title}</h4>
              <div className="flex items-end justify-between mt-4">
                <div>
                  <p className="font-display text-2xl font-bold text-surface-50">${p.price}</p>
                  <p className="text-xs text-surface-500">{p.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-surface-200">${p.revenue.toLocaleString()}</p>
                  <p className="text-xs text-emerald-400">{p.trend}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">💡 Product Idea Generator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DemoIdeaCard title="Ultimate Lighting Guide" desc="Your lighting tutorial has 84K views. Package it as a premium PDF with setup diagrams." potential="$3,200/mo est." confidence="High match" />
          <DemoIdeaCard title="Monthly Q&A Templates" desc="Your audience engages heavily in comments. Offer templated content calendars." potential="$1,800/mo est." confidence="Good match" />
          <DemoIdeaCard title="Brand Pitch Kit" desc="12 companies have reached out this quarter. Sell your exact pitch deck template." potential="$2,500/mo est." confidence="High match" />
        </div>
      </div>
    </div>
  )
}

/* ─── Demo AI ─────────────────────────────────────────────── */

function DemoAI() {
  const aiTools = [
    {
      icon: '💡',
      title: 'Pricing Suggestion',
      sample: 'Gaming sponsorship: $500–$5,000\n(medium confidence)',
      description: 'Get AI-powered pricing ranges based on niche, deal type, and market data.',
    },
    {
      icon: '🎯',
      title: 'Brand Match',
      sample: 'Nike × Fitness Creator\n87% fit score',
      description: 'See how well a brand aligns with your audience and content.',
    },
    {
      icon: '📧',
      title: 'Smart Follow-up',
      sample: 'Draft: "Hey [Brand], following up on our\nsponsorship conversation..."',
      description: 'Generate personalized follow-up emails tailored to each deal stage.',
    },
    {
      icon: '💡',
      title: 'Content Ideas',
      sample: '"Ultimate Streaming Setup Guide"\nest. $2,100/mo',
      description: 'Discover profitable digital product ideas matched to your niche.',
    },
    {
      icon: '🔍',
      title: 'Brand Discovery',
      sample: '8 brands found in\n"tech review" niche',
      description: 'Find brands actively looking for creators like you to partner with.',
    },
  ]

  return (
    <div className="page-enter space-y-8" id="demo-ai-section">
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50">✨ AI Assistant</h2>
        <p className="text-surface-400 mt-1">Smart tools to grow your creator business.</p>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiTools.map((tool, i) => (
          <div
            key={tool.title}
            className="glass glass-hover p-5 group relative overflow-hidden"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {/* Pro badge */}
            <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-400 border border-accent-500/20">
              Available on Pro
            </span>

            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{tool.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-surface-100 text-sm">{tool.title}</h4>
                <p className="text-xs text-surface-500 mt-1 leading-relaxed">{tool.description}</p>
              </div>
            </div>

            {/* Sample output */}
            <div className="mt-4 p-3 rounded-lg bg-surface-800/60 border border-surface-700/30">
              <p className="text-xs text-surface-300 whitespace-pre-wrap leading-relaxed font-mono">
                {tool.sample}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="glass p-6 text-center">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-2">
          Ready to unlock the AI tools?
        </h3>
        <p className="text-sm text-surface-400 mb-4">
          Get pricing suggestions, brand matches, follow-up drafts, content ideas, and brand discovery — all powered by AI.
        </p>
        <a
          href="/?signup=1"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-600/25 active:scale-95"
        >
          Unlock AI tools →
        </a>
      </div>
    </div>
  )
}

/* ─── Shared Demo Components ─────────────────────────────── */

function DemoStatCard({ label, value, change, positive, color }) {
  const glowMap = {
    accent: 'shadow-accent-500/20',
    emerald: 'shadow-emerald-500/20',
    amber: 'shadow-amber-500/20',
    rose: 'shadow-rose-500/20',
  }
  return (
    <div className={`glass glass-hover p-5 ${glowMap[color] || ''}`}>
      <p className="text-sm text-surface-400">{label}</p>
      <p className="font-display text-3xl font-bold text-surface-50 mt-1">{value}</p>
      <p className={`text-xs mt-1.5 ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {positive ? '↑' : '↓'} {change}
      </p>
    </div>
  )
}

function DemoActivityItem({ action, detail, time }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-2 h-2 rounded-full bg-accent-400 mt-1.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-surface-200">{action}</p>
        <p className="text-surface-500 text-xs">{detail}</p>
      </div>
      <span className="text-surface-600 text-xs shrink-0">{time}</span>
    </div>
  )
}

function DemoRecCard({ title, desc, tag }) {
  return (
    <div className="glass glass-hover p-4">
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-400">{tag}</span>
      <h4 className="font-semibold text-surface-100 mt-2">{title}</h4>
      <p className="text-sm text-surface-400 mt-1">{desc}</p>
    </div>
  )
}

function DemoMediaKitStat({ label, value }) {
  return (
    <div className="bg-surface-800/40 rounded-xl p-4 text-center">
      <p className="font-display text-2xl font-bold text-surface-100">{value}</p>
      <p className="text-xs text-surface-400 mt-1">{label}</p>
    </div>
  )
}

function DemoIdeaCard({ title, desc, potential, confidence }) {
  return (
    <div className="p-4 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 transition-colors border border-surface-700/30">
      <h4 className="font-semibold text-surface-100">{title}</h4>
      <p className="text-sm text-surface-400 mt-1">{desc}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-700/30">
        <span className="text-xs font-semibold text-emerald-400">{potential}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{confidence}</span>
      </div>
    </div>
  )
}

function DemoDisabledButton({ icon, label, primary }) {
  return (
    <div className="relative group/tip">
      <button
        disabled
        className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-not-allowed ${
          primary
            ? 'bg-accent-600/30 text-white/40 shadow-none'
            : 'text-surface-500 bg-surface-800/30 border border-surface-700/30'
        }`}
      >
        {icon}
        {label}
      </button>
      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-surface-800 text-surface-200 text-xs rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        Sign up to unlock
      </div>
    </div>
  )
}

/* ─── Icons ──────────────────────────────────────────────── */

function ExportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function DashboardIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function SponsorshipIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
    </svg>
  )
}

function LeadIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ProductsIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function AIIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
      <path d="M12 22l1-3 3-1-3-1-1-3-1 3-3 1 3 1z" opacity="0.5" />
    </svg>
  )
}
