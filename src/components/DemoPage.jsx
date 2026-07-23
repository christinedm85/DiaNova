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
  opportunities: { label: 'Opportunities', icon: OpportunitiesIcon },
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
            <img src="/icon-192.png" alt="CreatorBloom" className="w-11 h-11 rounded-2xl ring-1 ring-surface-700/50" />
            <div>
              <h1 className="font-display text-lg font-bold text-surface-50 tracking-tight">CreatorBloom</h1>
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
          {active === 'opportunities' && <DemoOpportunities />}
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
    {
      icon: '🤝',
      title: 'Negotiation Coach',
      sample: 'FitLife Apparel → Underpriced by ~35%\nCounter: $2,200–$2,800',
      description: 'Paste a brand offer and get instant analysis, counteroffer strategy, and a draft reply.',
    },
    {
      icon: '📊',
      title: 'Creator Benchmarking',
      sample: 'Tech/Gadgets · 85K · YouTube\n$1,800–$2,400 · 68th percentile',
      description: 'Compare your rates against the market. See where you stand and what top creators charge.',
    },
    {
      icon: '📄',
      title: 'Contract Scanner',
      sample: '4 clauses flagged · 3 missing protections\n1 danger: perpetual usage rights',
      description: 'Paste a contract and get instant analysis of risky clauses and missing protections.',
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
          Get pricing suggestions, brand matches, follow-up drafts, content ideas, brand discovery, and negotiation coaching — all powered by AI.
        </p>
        <a
          href="/?signup=1"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-600/25 active:scale-95"
        >
          Unlock AI tools →
        </a>
      </div>

      {/* Negotiation Coach Showcase */}
      <DemoNegotiationCoach />

      {/* Creator Benchmarking Showcase */}
      <DemoCreatorBenchmarking />

      {/* Contract Scanner Showcase */}
      <DemoContractScanner />
    </div>
  )
}

function DemoNegotiationCoach() {
  return (
    <div className="glass p-6 space-y-5" id="demo-negotiation-section">
      <div>
        <h3 className="font-display text-lg font-semibold text-surface-100 flex items-center gap-2">
          <span>🤝</span> Negotiation Coach — Sample Analysis
        </h3>
        <p className="text-sm text-surface-400 mt-1">
          Here's what the AI Negotiation Coach looks like when you paste a brand email. This is a real sample output.
        </p>
      </div>

      {/* The offer being analyzed */}
      <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
        <p className="text-xs text-surface-500 font-semibold uppercase tracking-wide mb-1">Brand Email Pasted</p>
        <p className="text-sm text-surface-300 font-medium">FitLife Apparel</p>
        <blockquote className="text-sm text-surface-400 italic mt-1 border-l-2 border-surface-600 pl-3">
          "We'd love to work with you! We're offering $1,200 for 2 Instagram posts + 1 TikTok video showcasing our new spring collection. Let us know if you're interested!"
        </blockquote>
      </div>

      {/* Fairness Verdict */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Underpriced</span>
          <span className="text-xs text-surface-400">Fairness Verdict</span>
        </div>
        <p className="text-sm text-surface-200">This offer is approximately 35% below market rate for a creator with your audience size and engagement. Similar deals in fitness/apparel typically range $2,000–$3,000 for this scope.</p>
      </div>

      {/* Counteroffer */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 ring-1 ring-emerald-500/20">
        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-1">Suggested Counteroffer</p>
        <p className="font-display text-2xl font-bold text-emerald-300">$2,200 – $2,800</p>
        <p className="text-xs text-surface-400 mt-1">Based on standard CPM rates for Instagram + TikTok combo deals in the fitness apparel niche, with a 4.8% engagement rate.</p>
      </div>

      {/* Negotiation Tips */}
      <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
        <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide mb-2">Negotiation Tips</p>
        <ol className="space-y-1.5 list-decimal list-inside">
          <li className="text-sm text-surface-200 pl-1">Ask for performance bonuses: $500 extra if the TikTok exceeds 500K views</li>
          <li className="text-sm text-surface-200 pl-1">Request a 30-day usage window rather than perpetual rights</li>
          <li className="text-sm text-surface-200 pl-1">Bundle a dedicated Instagram Story series as an upsell (+$800)</li>
        </ol>
      </div>

      {/* Draft Reply */}
      <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide">Draft Reply</p>
          <button
            disabled
            className="text-xs text-surface-600 cursor-not-allowed flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
        </div>
        <blockquote className="text-sm text-surface-200 whitespace-pre-wrap border-l-2 border-accent-500/30 pl-3 py-1 italic">
          {'Hi FitLife Team,\n\nThank you so much for reaching out — I love the spring collection and would be excited to collaborate!\n\nFor 2 Instagram posts + 1 TikTok, my standard rate is $2,500 given my audience size and 4.8% engagement rate. I\'d also be happy to discuss a performance bonus structure if the content exceeds view targets.\n\nCould we also confirm the usage rights window? I typically work with a 30-day usage term for brand content.\n\nLooking forward to hearing your thoughts!\n\nBest,\n[Your Name]'}
        </blockquote>
      </div>

      {/* Red Flags */}
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
        <p className="text-xs text-rose-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
          <span>⚠️</span> Red Flags Detected
        </p>
        <ul className="space-y-1.5">
          <li className="text-sm text-rose-300 flex items-start gap-2">
            <span className="text-rose-400 mt-0.5 shrink-0">⚠</span>
            <span>No usage rights specified — you could lose control of where and how long your content is used</span>
          </li>
          <li className="text-sm text-rose-300 flex items-start gap-2">
            <span className="text-rose-400 mt-0.5 shrink-0">⚠</span>
            <span>Exclusivity not defined — the brand could block you from working with competitors without stating it</span>
          </li>
          <li className="text-sm text-rose-300 flex items-start gap-2">
            <span className="text-rose-400 mt-0.5 shrink-0">⚠</span>
            <span>No payment timeline mentioned — always get payment terms in writing before creating content</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-surface-500 text-center italic">
        ⚠️ This is AI-generated guidance, not legal advice. Review contracts with a lawyer before signing.
      </p>
    </div>
  )
}

function DemoCreatorBenchmarking() {
  return (
    <div className="glass p-6 space-y-5" id="demo-benchmarking-section">
      <div>
        <h3 className="font-display text-lg font-semibold text-surface-100 flex items-center gap-2">
          <span>📊</span> Creator Benchmarking — Sample Analysis
        </h3>
        <p className="text-sm text-surface-400 mt-1">
          Here's what the AI Benchmarking tool looks like. Compare your rates against market data for any content type.
        </p>
      </div>

      {/* Query params */}
      <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
        <p className="text-xs text-surface-500 font-semibold uppercase tracking-wide mb-1">Search Parameters</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="text-surface-300"><span className="text-surface-500">Niche:</span> Tech/Gadgets</span>
          <span className="text-surface-300"><span className="text-surface-500">Audience:</span> 85K</span>
          <span className="text-surface-300"><span className="text-surface-500">Content:</span> YouTube integration</span>
        </div>
      </div>

      {/* Typical Range Card */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 ring-1 ring-emerald-500/20">
        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-1">Typical Market Range</p>
        <p className="font-display text-2xl font-bold text-emerald-300">$1,800 – $2,400</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
            Above Average
          </span>
          <span className="text-xs text-surface-400">68th percentile</span>
        </div>
        <p className="text-xs text-surface-400 mt-2">
          Creators with similar audiences (50K-150K) in tech/gadgets typically charge $1,800-$2,400 for YouTube integrations. You're in the 68th percentile — earning more than two-thirds of comparable creators.
        </p>
      </div>

      {/* Percentile Bar */}
      <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
        <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide mb-3">Market Position</p>
        <div className="relative h-4 bg-surface-700/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            style={{ width: '68%' }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-surface-500">
          <span>0th</span>
          <span className="font-semibold text-emerald-400">68th</span>
          <span>100th</span>
        </div>
      </div>

      {/* Comparison Breakdown */}
      <div className="space-y-2">
        <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide">Rate Comparison</p>
        <div className="p-3 rounded-xl border bg-surface-800/50 border-surface-700/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-200">Top 10%</span>
            <span className="text-sm font-semibold text-surface-100">$3,500+</span>
          </div>
          <p className="text-xs text-surface-500 mt-0.5">+$1,100 from your current range</p>
        </div>
        <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-200">Your range</span>
            <span className="text-sm font-semibold text-surface-100">$1,800–$2,400</span>
          </div>
        </div>
        <div className="p-3 rounded-xl border bg-surface-800/30 border-surface-700/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-200">Bottom 25%</span>
            <span className="text-sm font-semibold text-surface-100">$600–$1,000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoContractScanner() {
  return (
    <div className="glass p-6 space-y-5" id="demo-contract-section">
      <div>
        <h3 className="font-display text-lg font-semibold text-surface-100 flex items-center gap-2">
          <span>📄</span> Contract Scanner — Sample Analysis
        </h3>
        <p className="text-sm text-surface-400 mt-1">
          Here's what the AI Contract Scanner looks like when you paste a sponsorship contract. This shows a real sample analysis.
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
        <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide mb-1">Scan Summary</p>
        <p className="text-sm text-surface-200">
          This contract has 3 significant concerns: perpetual usage rights that strip creator ownership, a restrictive 6-month exclusivity on all fitness content, and Net-60 payment terms. The exclusivity and usage clauses should be negotiated before signing.
        </p>
      </div>

      {/* Clauses */}
      <div className="space-y-2">
        <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide">Clauses Found</p>

        <div className="p-3 rounded-xl border bg-rose-500/10 border-rose-500/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">danger</span>
            <span className="text-xs text-surface-400 capitalize">Usage Rights</span>
          </div>
          <p className="text-sm text-surface-200">Brand retains perpetual, worldwide rights to all content created — you lose ownership of your work indefinitely.</p>
        </div>

        <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">warning</span>
            <span className="text-xs text-surface-400 capitalize">Exclusivity</span>
          </div>
          <p className="text-sm text-surface-200">6-month exclusivity on all fitness content — very restrictive and blocks you from working with competitors in your main niche.</p>
        </div>

        <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">warning</span>
            <span className="text-xs text-surface-400 capitalize">Non Compete</span>
          </div>
          <p className="text-sm text-surface-200">12-month non-compete clause prevents you from working with any brand in the "health and wellness" space — overly broad.</p>
        </div>

        <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">info</span>
            <span className="text-xs text-surface-400 capitalize">Payment Terms</span>
          </div>
          <p className="text-sm text-surface-200">Net-60 payment terms — slower than the industry standard Net-30. You'll wait 2 months to get paid.</p>
        </div>
      </div>

      {/* Missing Protections */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
          <span>⚠️</span> Missing Protections
        </p>
        <ul className="space-y-1.5">
          <li className="text-sm text-amber-300 flex items-start gap-2">
            <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
            <span>No termination clause specified — you could be locked in indefinitely</span>
          </li>
          <li className="text-sm text-amber-300 flex items-start gap-2">
            <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
            <span>No content approval process defined — brand could reject content arbitrarily</span>
          </li>
          <li className="text-sm text-amber-300 flex items-start gap-2">
            <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
            <span>No performance metrics or deliverables timeline — scope is undefined</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-surface-500 text-center italic">
        ⚠️ This is AI-generated analysis, not legal advice. Always have a lawyer review contracts before signing.
      </p>
    </div>
  )
}

/* ─── Demo Opportunities ──────────────────────────────────── */

function DemoOpportunities() {
  const demoSampleOpportunities = [
    {
      id: 'demo-opp-1',
      type: 'brand_deal',
      title: 'A skincare brand is looking for TikTok creators in your niche',
      description: 'GlowUp Skincare is actively seeking beauty and lifestyle creators for a 3-video sponsorship. Budget ranges from $800–$2,500 per video.',
      category: 'Brand Deal',
      urgency: 'high',
      actionLabel: 'Pitch Now',
    },
    {
      id: 'demo-opp-2',
      type: 'seasonal',
      title: 'Amazon Prime Day is 30 days away. Here\'s what to pitch.',
      description: 'Prime Day deal guides get 3x engagement in the tech niche. Prep your affiliate content now and lock in brands for exclusive promo slots.',
      category: 'Seasonal',
      urgency: 'high',
      actionLabel: 'Prepare',
    },
    {
      id: 'demo-opp-3',
      type: 'trend',
      title: 'UGC demand for pet products is up this month',
      description: 'Brands in the pet space are shifting budget to UGC-style content. Your audience demographics are a strong match for 6+ active campaigns.',
      category: 'Trend Alert',
      urgency: 'medium',
      actionLabel: 'Learn More',
    },
    {
      id: 'demo-opp-4',
      type: 'affiliate',
      title: 'Notion just raised their creator commission to 30%',
      description: 'Productivity tool Notion now offers 30% recurring commissions for new sign-ups. Your audience over-indexes on productivity content.',
      category: 'Affiliate',
      urgency: 'medium',
      actionLabel: 'Apply',
    },
    {
      id: 'demo-opp-5',
      type: 'content_idea',
      title: 'Your "morning routine" video has 142K views — turn it into a product',
      description: 'Viewers are asking for your exact planner layout. Package it as a $12 digital download with Notion and PDF versions.',
      category: 'Content',
      urgency: 'low',
      actionLabel: 'Learn More',
    },
    {
      id: 'demo-opp-6',
      type: 'brand_deal',
      title: '3 fitness apparel brands are reviewing creator pitches this week',
      description: 'Gymshark, Alphalete, and NVGTN all have open casting calls. Your engagement rate puts you in the top tier for consideration.',
      category: 'Brand Deal',
      urgency: 'high',
      actionLabel: 'Apply',
    },
  ]

  const TYPE_CONFIG = {
    brand_deal: { badge: 'Brand Deal', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    seasonal: { badge: 'Seasonal', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    trend: { badge: 'Trend Alert', color: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
    affiliate: { badge: 'Affiliate', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    content_idea: { badge: 'Content', color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  }

  const URGENCY_DOT = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-emerald-400',
  }

  return (
    <div className="page-enter space-y-6" id="demo-opportunities-section">
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50">Opportunities</h2>
        <p className="text-surface-400 mt-1">AI-curated opportunities matched to your niche</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Brand Deals', 'Seasonal', 'Trends', 'Affiliates', 'Content'].map(label => (
          <button
            key={label}
            disabled
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-not-allowed opacity-60 ${
              label === 'All'
                ? 'bg-accent-600/20 text-accent-400 border border-accent-500/30'
                : 'text-surface-400 border border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoSampleOpportunities.map((opp, i) => {
          const config = TYPE_CONFIG[opp.type] || TYPE_CONFIG.content_idea
          const dotColor = URGENCY_DOT[opp.urgency] || URGENCY_DOT.medium

          return (
            <div
              key={opp.id}
              className="glass glass-hover p-5 group relative flex flex-col"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${config.color}`}>
                  {config.badge}
                </span>
                <span className="flex items-center gap-1 text-xs text-surface-500">
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  {opp.urgency === 'high' ? 'Urgent' : opp.urgency === 'medium' ? 'Soon' : 'Evergreen'}
                </span>
              </div>

              <h4 className="font-semibold text-surface-100 text-sm leading-snug mb-2">
                {opp.title}
              </h4>

              <p className="text-xs text-surface-400 leading-relaxed flex-1 mb-4">
                {opp.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-surface-700/30">
                <span className="text-xs text-surface-500">{opp.category}</span>
                <div className="relative group/tip">
                  <button
                    disabled
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-not-allowed ${
                      opp.urgency === 'high'
                        ? 'bg-accent-600/30 text-white/40'
                        : 'bg-surface-800/60 text-surface-500'
                    }`}
                  >
                    {opp.actionLabel}
                  </button>
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-surface-800 text-surface-200 text-xs rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Sign up to unlock
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="glass p-6 text-center">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-2">
          Never miss an opportunity again
        </h3>
        <p className="text-sm text-surface-400 mb-4">
          Our AI scans trends, seasons, and brand campaigns to surface opportunities matched to your niche — updated in real time.
        </p>
        <a
          href="/?signup=1"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-600/25 active:scale-95"
        >
          Get your opportunities →
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

function OpportunitiesIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}
