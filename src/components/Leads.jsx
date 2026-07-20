import { useState, useEffect } from 'react'
import { api } from '../api.js'
import EmptyState from './EmptyState.jsx'
import FormField from './FormField.jsx'

function downloadCSV(type) {
  api.exportCSV(type).then(r => r.blob()).then(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${type}.csv`; a.click()
    URL.revokeObjectURL(url)
  })
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [funnel, setFunnel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', source: 'Landing Page' })
  const [search, setSearch] = useState('')

  const fetch = () => Promise.all([api.leads.list(search), api.leads.stats()])
    .then(([l, f]) => { setLeads(l); setFunnel(f) })
    .finally(() => setLoading(false))

  useEffect(() => { fetch() }, [search])

  const handleCreate = async (e) => {
    e.preventDefault()
    await api.leads.create(form)
    setForm({ name: '', email: '', source: 'Landing Page' })
    fetch()
  }

  const handleDelete = async (id) => {
    await api.leads.remove(id)
    fetch()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /></div>
  }

  const maxFunnel = funnel ? Math.max(funnel.visitors, 1) : 1

  return (
    <div className="page-enter space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Lead Generation</h2>
          <p className="text-surface-400 mt-1">Capture and nurture leads to grow your brand.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-200 focus:outline-none focus:border-accent-500 transition-colors w-44"
            />
          </div>
          <button onClick={() => downloadCSV('leads')} className="px-3 py-2 text-xs font-medium text-surface-400 hover:text-surface-200 bg-surface-800/50 hover:bg-surface-700/50 border border-surface-700/50 rounded-lg transition-colors flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      {funnel && (
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-6">Conversion Funnel</h3>
          <FunnelChart funnel={funnel} max={maxFunnel} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Add New Lead</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <FormField id="lead-name" placeholder="Name" icon="👤" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <FormField placeholder="Email" type="email" icon="📧" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <select className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-emerald-500" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
              <option>Landing Page</option>
              <option>YouTube Bio</option>
              <option>Newsletter CTA</option>
              <option>Instagram Link</option>
              <option>Direct</option>
            </select>
            <button type="submit" className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">Capture Lead</button>
          </form>
        </div>
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Recent Leads ({leads.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {leads.map(lead => (
              <div key={lead.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-800/50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-200">{lead.name}</p>
                  <p className="text-xs text-surface-500 truncate">{lead.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-surface-400">{lead.source}</p>
                </div>
                <button onClick={() => handleDelete(lead.id)} className="text-xs text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100">×</button>
              </div>
            ))}
            {leads.length === 0 && (
              <EmptyState
                icon="📧"
                title="No leads yet"
                description="Start capturing potential sponsors and grow your brand partnerships."
                action={() => document.querySelector('#lead-name')?.focus()}
                actionLabel="Capture a lead"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FunnelChart({ funnel, max }) {
  const stages = [
    { key: 'visitors', label: 'Visitors', value: funnel.visitors, gradient: 'from-accent-400 to-accent-300' },
    { key: 'signups', label: 'Sign-ups', value: funnel.signups, gradient: 'from-accent-500 to-accent-400' },
    { key: 'leads', label: 'Leads', value: funnel.leads, gradient: 'from-accent-600 to-accent-500' },
    { key: 'qualified', label: 'Qualified', value: funnel.qualified, gradient: 'from-accent-700 to-accent-500' },
  ]

  return (
    <div className="flex flex-col items-center">
      {stages.map((stage, i) => {
        const pct = Math.max((stage.value / max) * 100, 5)
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
  )
}
