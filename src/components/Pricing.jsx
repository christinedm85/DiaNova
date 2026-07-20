import { useState, useEffect } from 'react'
import { api } from '../api.js'

export default function Pricing() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [calc, setCalc] = useState(null)
  const [subs, setSubs] = useState('250000')
  const [type, setType] = useState('dedicated')

  useEffect(() => {
    api.pricing.history().then(setHistory).finally(() => setLoading(false))
  }, [])

  const calculate = async () => {
    const result = await api.pricing.calculate({ subs, contentType: type })
    setCalc(result)
  }

  useEffect(() => { calculate() }, [subs, type])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" /></div>
  }

  const maxRate = history.length ? Math.max(...history.map(h => h.avg_rate), 5000) : 5000

  return (
    <div className="page-enter space-y-8">
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50">Pricing Guidance</h2>
        <p className="text-surface-400 mt-1">Data-driven pricing to maximize your earning potential.</p>
      </div>

      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-6">Smart Rate Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-surface-500 mb-1.5">Subscriber Count</p>
            <input className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/30 text-sm text-surface-200 focus:outline-none focus:border-accent-500" value={subs} onChange={e => setSubs(e.target.value)} />
          </div>
          <div>
            <p className="text-xs text-surface-500 mb-1.5">Content Type</p>
            <select className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/30 text-sm text-surface-200 focus:outline-none focus:border-accent-500" value={type} onChange={e => setType(e.target.value)}>
              <option value="dedicated">Dedicated Video (60s)</option>
              <option value="integrated">Integrated Mention (30s)</option>
              <option value="short">Short / Story</option>
            </select>
          </div>
          <div>
            <p className="text-xs text-surface-500 mb-1.5">Deliverables</p>
            <select className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/30 text-sm text-surface-200 focus:outline-none focus:border-accent-500">
              <option>1 video + 2 stories</option>
            </select>
          </div>
        </div>
        {calc && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-accent-600/15 to-purple-600/15 border border-accent-500/20">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-surface-400 uppercase tracking-widest">Recommended Rate</p>
                <p className="font-display text-4xl font-bold text-surface-50 mt-1">${calc.recommended.toLocaleString()} – ${calc.high.toLocaleString()}</p>
                <p className="text-sm text-emerald-400 mt-1">↑ Based on {parseInt(subs).toLocaleString()} subscribers</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-surface-500">Market range</p>
                <p className="text-sm text-surface-300">${calc.low.toLocaleString()} – ${calc.high.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">📊 Market Benchmarks</h3>
          <div className="space-y-3">
            <BenchmarkRow tier="Nano (1K-10K)" cpm="$15-25" video="$200-800" story="$50-200" />
            <BenchmarkRow tier="Micro (10K-100K)" cpm="$25-40" video="$800-3K" story="$200-800" />
            <BenchmarkRow tier="Mid (100K-500K)" cpm="$40-70" video="$3K-12K" story="$800-3K" highlight />
            <BenchmarkRow tier="Macro (500K+)" cpm="$70-120" video="$12K-50K" story="$3K-8K" />
          </div>
        </div>
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">📈 Your Pricing History</h3>
          <div className="flex items-end gap-2 h-32">
            {history.map(h => (
              <HistBar key={h.month} month={h.month} value={h.avg_rate} max={maxRate} highlight={h.month === 'Jun'} />
            ))}
          </div>
          <p className="text-sm text-surface-300 mt-4">
            Your average rate has grown <span className="text-emerald-400 font-semibold">
              +{Math.round(((history[history.length - 1]?.avg_rate || 3100) / (history[0]?.avg_rate || 1800) - 1) * 100)}%
            </span> in {history.length} months. Keep raising.
          </p>
        </div>
      </div>
    </div>
  )
}

function BenchmarkRow({ tier, cpm, video, story, highlight }) {
  return (
    <div className={`grid grid-cols-4 gap-2 text-xs p-2.5 rounded-lg ${highlight ? 'bg-accent-600/10 border border-accent-500/20' : 'hover:bg-surface-800/30'}`}>
      <span className={`font-medium ${highlight ? 'text-accent-400' : 'text-surface-300'}`}>{tier}</span>
      <span className="text-surface-400">{cpm}</span>
      <span className="text-surface-400">{video}</span>
      <span className="text-surface-400">{story}</span>
    </div>
  )
}

function HistBar({ month, value, max, highlight }) {
  const h = Math.max((value / max) * 120, 8)
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <span className="text-xs text-surface-400">${(value / 1000).toFixed(1)}k</span>
      <div className={`w-full rounded-t-md ${highlight ? 'bg-accent-500' : 'bg-surface-600'}`} style={{ height: `${h}px` }} />
      <span className="text-xs text-surface-600">{month}</span>
    </div>
  )
}
