import { useState, useEffect } from 'react'
import { api } from '../api.js'
import ConfirmDialog from './ConfirmDialog.jsx'
import EmptyState from './EmptyState.jsx'
import FormField from './FormField.jsx'

export default function Affiliates({ onNavigate }) {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ program: '', company: '', commission: '', status: 'active' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetch = () => api.affiliates.list().then(setPrograms).finally(() => setLoading(false))
  useEffect(() => { fetch() }, [])

  const handleDeleteRequest = (id) => {
    const program = programs.find(p => p.id === id)
    setConfirm({ id, name: program?.program || 'this program' })
  }

  const handleDeleteConfirm = async () => {
    await api.affiliates.remove(confirm.id)
    setConfirm(null)
    fetch()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.program.trim()) { setFormError('Program name is required.'); return }
    if (!form.commission.trim()) { setFormError('Commission rate is required.'); return }
    setSubmitting(true)
    try {
      const displayName = form.company.trim() ? `${form.program} (${form.company})` : form.program
      await api.affiliates.create({
        program: displayName,
        commission: form.commission,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        trend: '0%',
      })
      setForm({ program: '', company: '', commission: '', status: 'active' })
      setShowModal(false)
      fetch()
    } catch (e) {
      setFormError(e.message || 'Failed to create program.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="page-enter space-y-10">
      <ConfirmDialog
        open={!!confirm}
        title="Delete Affiliate Program"
        message={`Are you sure you want to delete "${confirm?.name}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Passive Income Streams 💸</h2>
          <p className="text-surface-400 mt-1">Turn your recommendations into revenue. Every link tells a story — make it a profitable one.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-surface-950 text-sm font-bold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/25">
          + Add Program
        </button>
      </div>

      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Top Performing Links</h3>
        {programs.length === 0 ? (
          <EmptyState
            icon="🔗"
            title="No affiliate partnerships yet"
            description="Affiliate programs like Amazon Associates, Skillshare, and Epidemic Sound pay you for every referral. Start earning passive income today."
            action={() => onNavigate && onNavigate('products')}
            actionLabel="Add Your First Affiliate"
            color="amber"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-surface-800/50 text-surface-400 text-left">
                  <th className="px-4 py-3 font-medium">Program ↑↓</th>
                  <th className="px-4 py-3 font-medium">Commission ↑↓</th>
                  <th className="px-4 py-3 font-medium">Clicks ↑↓</th>
                  <th className="px-4 py-3 font-medium">Conv. ↑↓</th>
                  <th className="px-4 py-3 font-medium">Revenue ↑↓</th>
                  <th className="px-4 py-3 font-medium">Trend ↑↓</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/30">
                {programs.map(p => (
                  <tr key={p.id} className="hover:bg-surface-800/30 transition-colors group even:bg-surface-800/20">
                    <td className="px-4 py-3 font-medium text-surface-200">{p.program}</td>
                    <td className="px-4 py-3 text-surface-300">{p.commission}</td>
                    <td className="px-4 py-3 text-surface-300">{p.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-surface-300">{p.conversions}</td>
                    <td className="px-4 py-3 font-semibold text-surface-100">${p.revenue.toLocaleString()}</td>
                    <td className={`px-4 py-3 font-medium ${p.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{p.trend}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteRequest(p.id)} className="text-xs text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-3">🔍 Link Placement Score</h3>
          <div className="flex items-end gap-1 mb-4">
            <div className="w-3 h-16 rounded-sm bg-emerald-400" />
            <div className="w-3 h-10 rounded-sm bg-amber-400" />
            <div className="w-3 h-20 rounded-sm bg-emerald-400" />
            <div className="w-3 h-8 rounded-sm bg-surface-600" />
            <div className="w-3 h-4 rounded-sm bg-rose-400" />
            <div className="w-3 h-14 rounded-sm bg-emerald-400" />
            <div className="w-3 h-6 rounded-sm bg-surface-600" />
          </div>
          <p className="text-sm text-surface-300">Your links in video descriptions perform <span className="text-emerald-400 font-semibold">3x better</span> than social bio links.</p>
        </div>
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-3">💡 Missed Opportunities</h3>
          <div className="space-y-3">
            <OppItem brand="AudioPro" reason="Your podcast audience matches their target demo" commission="20%" />
            <OppItem brand="FitTracker" reason="Top 3 videos are fitness-related" commission="12%" />
            <OppItem brand="MealBox" reason="High CTR on food content" commission="$15/sale" />
          </div>
        </div>
      </div>

      {/* Add Program Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative glass p-6 w-full max-w-md space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-surface-100">Add Affiliate Program</h3>
              <button onClick={() => setShowModal(false)} className="text-surface-500 hover:text-surface-300 text-xl leading-none">&times;</button>
            </div>
            {formError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">{formError}</div>}
            <form onSubmit={handleCreate} className="space-y-3">
              <FormField
                placeholder="Program name (e.g. Amazon Associates)"
                value={form.program}
                onChange={e => setForm({ ...form, program: e.target.value })}
                required
              />
              <FormField
                placeholder="Company (optional, e.g. Amazon)"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
              />
              <FormField
                placeholder="Commission rate (e.g. 20%)"
                value={form.commission}
                onChange={e => setForm({ ...form, commission: e.target.value })}
                required
              />
              <select
                className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-amber-500"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-surface-950 text-sm font-bold rounded-xl transition-colors"
              >
                {submitting ? 'Adding...' : 'Add Program'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function OppItem({ brand, reason, commission }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 transition-colors cursor-pointer">
      <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
        <span className="text-amber-400 text-sm font-bold">$</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-surface-200">{brand}</p>
        <p className="text-xs text-surface-500">{reason}</p>
      </div>
      <span className="text-xs font-bold text-amber-400 shrink-0">{commission}</span>
    </div>
  )
}
