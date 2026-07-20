import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useToast } from '../ToastContext.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
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

export default function Sponsorships() {
  const { addToast } = useToast()
  const [pipeline, setPipeline] = useState(null)
  const [allPipeline, setAllPipeline] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ brand: '', amount: '', status: 'prospecting', notes: '' })
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch] = useState('')

  const fetchPipeline = () => api.sponsorships.pipeline().then(p => { setAllPipeline(p); setPipeline(p) }).catch(console.error)
  useEffect(() => { fetchPipeline() }, [])

  useEffect(() => {
    if (!allPipeline || !search.trim()) {
      setPipeline(allPipeline)
      return
    }
    const q = search.toLowerCase()
    const filtered = {}
    for (const [status, deals] of Object.entries(allPipeline)) {
      filtered[status] = deals.filter(d =>
        d.brand.toLowerCase().includes(q) ||
        (d.notes || '').toLowerCase().includes(q) ||
        status.toLowerCase().includes(q)
      )
    }
    setPipeline(filtered)
  }, [search, allPipeline])

  const handleCreate = async (e) => {
    e.preventDefault()
    await api.sponsorships.create({ ...form, amount: parseFloat(form.amount) })
    setForm({ brand: '', amount: '', status: 'prospecting', notes: '' })
    setShowForm(false)
    fetchPipeline()
    addToast(`${form.brand} added to pipeline`, 'success')
  }

  const handleMove = async (id, newStatus) => {
    const deal = Object.values(pipeline).flat().find(d => d.id === id)
    await api.sponsorships.update(id, { status: newStatus })
    fetchPipeline()
    addToast(`${deal?.brand} moved to ${newStatus}`, 'success')
  }

  const handleDeleteRequest = (id) => {
    const deal = Object.values(pipeline).flat().find(d => d.id === id)
    setConfirm({ id, name: deal?.brand || 'this deal' })
  }

  const handleDelete = async () => {
    await api.sponsorships.remove(confirm.id)
    setConfirm(null)
    fetchPipeline()
    addToast(`${confirm.name} deleted`, 'error')
  }

  if (!pipeline) {
    return <div className="space-y-6"><Skeleton /><Skeleton /><Skeleton /></div>
  }

  const stages = [
    { key: 'prospecting', title: 'Prospecting', color: 'bg-surface-600', borderColor: 'border-l-surface-600' },
    { key: 'negotiating', title: 'Negotiating', color: 'bg-amber-400', borderColor: 'border-l-amber-400' },
    { key: 'confirmed', title: 'Confirmed', color: 'bg-accent-400', borderColor: 'border-l-emerald-500' },
    { key: 'completed', title: 'Completed', color: 'bg-emerald-400', borderColor: 'border-l-accent-400' },
  ]

  const totalDeals = pipeline ? Object.values(pipeline).reduce((sum, deals) => sum + deals.length, 0) : 0
  const nextStage = { prospecting: 'negotiating', negotiating: 'confirmed', confirmed: 'completed' }

  return (
    <div className="page-enter space-y-8">
      <ConfirmDialog
        open={!!confirm}
        title="Delete Deal"
        message={`Are you sure you want to delete "${confirm?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Sponsorships</h2>
          <p className="text-surface-400 mt-1">Manage your brand partnerships and track deals.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search deals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-200 focus:outline-none focus:border-accent-500 transition-colors w-44"
            />
          </div>
          <button onClick={() => downloadCSV('sponsorships')} className="px-3 py-2 text-xs font-medium text-surface-400 hover:text-surface-200 bg-surface-800/50 hover:bg-surface-700/50 border border-surface-700/50 rounded-lg transition-colors flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-600/25 active:scale-95"
          >
            + New Deal
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass p-5 space-y-3 animate-scale-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FormField placeholder="Brand name" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} required />
            <FormField placeholder="Amount ($)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            <select className="px-3 py-2 rounded-xl bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {stages.map(s => <option key={s.key} value={s.key}>{s.title}</option>)}
            </select>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors active:scale-95">Add Deal</button>
          </div>
        </form>
      )}

      {totalDeals === 0 ? (
        <div className="glass p-6">
          <EmptyState
            icon="📋"
            title="No pipeline data"
            description="Your sponsorship pipeline is empty. Add your first deal to start tracking brand partnerships."
            action={() => setShowForm(true)}
            actionLabel="+ New Deal"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map(({ key, title, color, borderColor }) => {
          const deals = pipeline[key] || []
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
                    <span className="text-surface-500 text-xs mt-0.5 shrink-0 select-none cursor-grab" title="Drag to reorder">⋮⋮</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-surface-100 text-sm">{deal.brand}</p>
                        <p className="font-display font-semibold text-surface-200 text-lg">${deal.amount.toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-surface-500 mt-1">{deal.notes}</p>
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {nextStage[key] && (
                          <button onClick={() => handleMove(deal.id, nextStage[key])} className="text-xs px-2 py-0.5 rounded bg-accent-600/20 text-accent-400 hover:bg-accent-600/30 transition-colors">Move →</button>
                        )}
                        <button onClick={() => handleDeleteRequest(deal.id)} className="text-xs px-2 py-0.5 rounded bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 ml-auto transition-colors">×</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {deals.length === 0 && <EmptyState icon="📋" title="No deals" description="Deals in this stage will appear here" />}
            </div>
          )
        })}
        </div>
      )}

      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Your Media Kit</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MediaKitStat label="Avg. Video Views" value="142K" />
          <MediaKitStat label="Engagement Rate" value="4.8%" />
          <MediaKitStat label="Audience Demo" value="18-34 / 62% M" />
        </div>
        <div className="mt-4 flex gap-3">
          <button className="px-4 py-2 text-sm font-medium bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-xl transition-colors">Edit Media Kit</button>
          <button className="px-4 py-2 text-sm font-medium bg-accent-600/15 hover:bg-accent-600/25 text-accent-400 rounded-xl transition-colors">Download as PDF</button>
        </div>
      </div>
    </div>
  )
}

function MediaKitStat({ label, value }) {
  return (
    <div className="bg-surface-800/40 rounded-xl p-4 text-center">
      <p className="font-display text-2xl font-bold text-surface-100">{value}</p>
      <p className="text-xs text-surface-400 mt-1">{label}</p>
    </div>
  )
}

function Skeleton() {
  return <div className="glass p-6 space-y-3"><div className="skeleton h-5 w-48" /><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-3/4" /></div>
}
