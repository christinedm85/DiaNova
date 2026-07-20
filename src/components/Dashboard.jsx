import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import AIPanel from './AIPanel.jsx'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e']
const RADIAN = Math.PI / 180

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [trend, setTrend] = useState(null)
  const [showAI, setShowAI] = useState(false)

  useEffect(() => {
    api.dashboard().then(setData).catch(console.error)
    api.trend().then(setTrend).catch(console.error)
  }, [])

  if (!data || !trend) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { monthly_revenue, active_sponsors, affiliate_revenue, product_sales, revenue_breakdown, pipeline, recent_activity } = data

  const pieData = [
    { name: 'Sponsorships', value: revenue_breakdown.sponsorships },
    { name: 'Affiliates', value: revenue_breakdown.affiliates },
    { name: 'Products', value: revenue_breakdown.products },
    { name: 'Consulting', value: revenue_breakdown.consulting },
  ].filter(d => d.value > 0)

  const pipeData = Object.entries(pipeline).map(([key, count]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    deals: count,
  }))

  return (
    <div className="page-enter space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl font-bold text-surface-50">Good morning, {user?.name || 'there'}</h2>
          <button onClick={() => setShowAI(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-500/10 text-accent-400 text-sm font-medium hover:bg-accent-500/20 transition-all border border-accent-500/20">
            <span>✨</span> AI Assistant
          </button>
        </div>
        <p className="text-surface-400 mt-1">Here&apos;s how your revenue streams are performing today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Revenue" value={`$${monthly_revenue.toLocaleString()}`} change="+12.5%" positive color="accent" />
        <StatCard label="Active Sponsors" value={String(active_sponsors)} change="+2 this month" positive color="emerald" />
        <StatCard label="Affiliate Rev" value={`$${affiliate_revenue.toLocaleString()}`} change="+8.2%" positive color="amber" />
        <StatCard label="Product Sales" value={`$${product_sales.toLocaleString()}`} change="-3.1%" positive={false} color="rose" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="colorSponsor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="sponsorships" stroke="#6366f1" fill="url(#colorSponsor)" strokeWidth={2} />
              <Area type="monotone" dataKey="affiliates" stroke="#f59e0b" fill="url(#colorAff)" strokeWidth={2} />
              <Area type="monotone" dataKey="products" stroke="#10b981" fill="url(#colorProd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Breakdown Donut */}
        <div className="glass p-6 flex flex-col items-center">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-2 w-full">Revenue Mix</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
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
            {pieData.map((d, i) => (
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
            <BarChart data={pipeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px', color: '#e2e8f0' }}
                formatter={(v) => [`${v} deals`, undefined]}
              />
              <Bar dataKey="deals" radius={[6, 6, 0, 0]}>
                {pipeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recent_activity.map((item, i) => (
              <ActivityItem key={i} action={item.action} detail={`${item.brand} — $${item.amount.toLocaleString()}`} time="Recently" />
            ))}
            {recent_activity.length === 0 && (
              <ActivityItem action="No activity yet" detail="Start tracking your deals" time="" />
            )}
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">⚡ Smart Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RecCard title="Raise your rates" desc="Similar creators with your engagement charge 22% more for sponsorships." tag="Pricing" />
          <RecCard title="Untapped affiliate" desc="Your audience loves productivity tools. 3 brands in that niche offer 20%+ commissions." tag="Affiliates" />
          <RecCard title="Launch a digital product" desc="Your top video topic has 84K views. Turn it into a $29 guide." tag="Products" />
        </div>
      </div>
      <AIPanel show={showAI} onClose={() => setShowAI(false)} />
    </div>
  )
}

function StatCard({ label, value, change, positive, color }) {
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

function ActivityItem({ action, detail, time }) {
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

function RecCard({ title, desc, tag }) {
  return (
    <div className="glass glass-hover p-4 cursor-pointer">
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-400">{tag}</span>
      <h4 className="font-semibold text-surface-100 mt-2">{title}</h4>
      <p className="text-sm text-surface-400 mt-1">{desc}</p>
    </div>
  )
}
