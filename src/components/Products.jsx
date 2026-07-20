import { useState, useEffect } from 'react'
import { api } from '../api.js'

function downloadCSV(type) {
  api.exportCSV(type).then(r => r.blob()).then(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${type}.csv`; a.click()
    URL.revokeObjectURL(url)
  })
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', type: 'Guide', price: '', sales: 0, revenue: 0, trend: '0%' })
  const [showForm, setShowForm] = useState(false)

  const fetch = () => api.products.list().then(setProducts).finally(() => setLoading(false))
  useEffect(() => { fetch() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    await api.products.create({ ...form, price: parseFloat(form.price) })
    setForm({ title: '', type: 'Guide', price: '', sales: 0, revenue: 0, trend: '0%' })
    setShowForm(false)
    fetch()
  }

  const handleDelete = async (id) => {
    await api.products.remove(id)
    fetch()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /></div>
  }

  const colorMap = {
    Templates: { bg: 'bg-accent-500/10', text: 'text-accent-400' },
    Presets: { bg: 'bg-amber-400/10', text: 'text-amber-400' },
    Guide: { bg: 'bg-rose-400/10', text: 'text-rose-400' },
  }

  return (
    <div className="page-enter space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Digital Products</h2>
          <p className="text-surface-400 mt-1">Create and sell digital products to your audience.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadCSV('products')} className="px-3 py-2 text-xs font-medium text-surface-400 hover:text-surface-200 bg-surface-800/50 hover:bg-surface-700/50 border border-surface-700/50 rounded-lg transition-colors flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/25">
            + New Product
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass p-5 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-emerald-500" placeholder="Product title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <select className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-emerald-500" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>Guide</option>
              <option>Templates</option>
              <option>Presets</option>
              <option>Course</option>
              <option>Toolkit</option>
            </select>
            <input className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-emerald-500" placeholder="Price ($)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">Create</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(p => {
          const c = colorMap[p.type] || colorMap.Guide
          return (
            <div key={p.id} className="glass glass-hover p-5 group relative">
              <button onClick={() => handleDelete(p.id)} className="absolute top-3 right-3 text-xs text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
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
        {products.length === 0 && (
          <div className="col-span-3 text-center py-12 text-surface-500">No products yet. Create your first!</div>
        )}
      </div>

      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">💡 Product Idea Generator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IdeaCard title="Ultimate Lighting Guide" desc="Your lighting tutorial has 84K views. Package it as a premium PDF with setup diagrams." potential="$3,200/mo est." confidence="High match" />
          <IdeaCard title="Monthly Q&A Templates" desc="Your audience engages heavily in comments. Offer templated content calendars." potential="$1,800/mo est." confidence="Good match" />
          <IdeaCard title="Brand Pitch Kit" desc="12 companies have reached out this quarter. Sell your exact pitch deck template." potential="$2,500/mo est." confidence="High match" />
        </div>
      </div>
    </div>
  )
}

function IdeaCard({ title, desc, potential, confidence }) {
  return (
    <div className="p-4 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 transition-colors cursor-pointer border border-surface-700/30">
      <h4 className="font-semibold text-surface-100">{title}</h4>
      <p className="text-sm text-surface-400 mt-1">{desc}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-700/30">
        <span className="text-xs font-semibold text-emerald-400">{potential}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{confidence}</span>
      </div>
    </div>
  )
}
