import { useState, useEffect } from 'react'
import { api } from '../api.js'
import EmptyState from './EmptyState.jsx'

export default function Affiliates() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => api.affiliates.list().then(setPrograms).finally(() => setLoading(false))
  useEffect(() => { fetch() }, [])

  const handleDelete = async (id) => {
    await api.affiliates.remove(id)
    fetch()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="page-enter space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Affiliate Optimization</h2>
          <p className="text-surface-400 mt-1">Maximize your affiliate revenue with smart insights.</p>
        </div>
        <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-surface-950 text-sm font-bold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/25">
          + Add Program
        </button>
      </div>

      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Top Performing Links</h3>
        {programs.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No affiliate programs yet"
            description="Add your first program to start tracking and optimizing affiliate revenue."
            actionLabel="Add your first program"
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
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
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
