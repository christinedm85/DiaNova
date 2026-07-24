import { useState, useEffect, useCallback } from 'react'
import { api } from '../api.js'
import { useToast } from '../ToastContext.jsx'

function formatCurrency(n) {
  if (n == null || isNaN(n)) return '$0'
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MonetizationIntegration() {
  const [status, setStatus] = useState(null)
  const [stripeStats, setStripeStats] = useState(null)
  const [shopifyStats, setShopifyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stripeKey, setStripeKey] = useState('')
  const [shopifyUrl, setShopifyUrl] = useState('')
  const [shopifyToken, setShopifyToken] = useState('')
  const [connecting, setConnecting] = useState(null) // 'stripe' or 'shopify'
  const toast = useToast()

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, stripeRes, shopifyRes] = await Promise.all([
        api.monetization.status(),
        api.monetization.stripeStats(),
        api.monetization.shopifyStats(),
      ])
      setStatus(statusRes)
      setStripeStats(stripeRes)
      setShopifyStats(shopifyRes)
    } catch (e) {
      console.error('Monetization fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStripeConnect = async (e) => {
    e.preventDefault()
    if (!stripeKey.trim()) return
    setConnecting('stripe')
    try {
      await api.monetization.stripeConnect(stripeKey.trim())
      setStripeKey('')
      await fetchData()
      toast?.show?.({ message: 'Stripe connected! Your real revenue data is now live. 📊', type: 'success' }) ||
        console.log('Stripe connected')
    } catch (e) {
      toast?.show?.({ message: 'Failed to connect Stripe: ' + e.message, type: 'error' }) ||
        alert('Failed to connect Stripe')
    } finally {
      setConnecting(null)
    }
  }

  const handleStripeDisconnect = async () => {
    if (!confirm('Disconnect Stripe from CreatorBloom?')) return
    try {
      await api.monetization.stripeDisconnect()
      setStatus(prev => ({ ...prev, stripe: { connected: false } }))
      setStripeStats(null)
      toast?.show?.({ message: 'Stripe disconnected. Your data is safe — reconnect anytime. 👋', type: 'success' }) ||
        console.log('Stripe disconnected')
    } catch (e) {
      toast?.show?.({ message: 'Failed to disconnect Stripe', type: 'error' }) ||
        alert('Failed to disconnect Stripe')
    }
  }

  const handleShopifyConnect = async (e) => {
    e.preventDefault()
    if (!shopifyUrl.trim() || !shopifyToken.trim()) return
    setConnecting('shopify')
    try {
      await api.monetization.shopifyConnect(shopifyUrl.trim(), shopifyToken.trim())
      setShopifyUrl('')
      setShopifyToken('')
      await fetchData()
      toast?.show?.({ message: 'Shopify connected! Your store data is now flowing in. 🛍️', type: 'success' }) ||
        console.log('Shopify connected')
    } catch (e) {
      toast?.show?.({ message: 'Failed to connect Shopify: ' + e.message, type: 'error' }) ||
        alert('Failed to connect Shopify')
    } finally {
      setConnecting(null)
    }
  }

  const handleShopifyDisconnect = async () => {
    if (!confirm('Disconnect Shopify from CreatorBloom?')) return
    try {
      await api.monetization.shopifyDisconnect()
      setStatus(prev => ({ ...prev, shopify: { connected: false, storeUrl: null } }))
      setShopifyStats(null)
      toast?.show?.({ message: 'Shopify disconnected. Your data is safe — reconnect anytime. 👋', type: 'success' }) ||
        console.log('Shopify disconnected')
    } catch (e) {
      toast?.show?.({ message: 'Failed to disconnect Shopify', type: 'error' }) ||
        alert('Failed to disconnect Shopify')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stripeConnected = status?.stripe?.connected
  const shopifyConnected = status?.shopify?.connected
  const anyConnected = stripeConnected || shopifyConnected

  return (
    <div className="page-enter space-y-8">
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50">Monetization</h2>
        <p className="text-surface-400 mt-1">Connect Stripe or Shopify to see your real revenue, MRR, and top products — all inside CreatorBloom.</p>
      </div>

      {/* Combined Revenue Summary */}
      {anyConnected && (stripeStats || shopifyStats) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Combined Revenue"
            value={formatCurrency(
              ((stripeStats?.totalRevenue || 0) + (shopifyStats?.totalSales || 0))
            )}
            change="Last 30 days"
            positive
            color="accent"
          />
          <StatCard
            label="Stripe Revenue"
            value={formatCurrency(stripeStats?.totalRevenue || 0)}
            change={stripeConnected ? `${stripeStats?.activeSubscriptions || 0} active subs` : 'Not connected'}
            positive={stripeConnected}
            color="emerald"
          />
          <StatCard
            label="Shopify Sales"
            value={formatCurrency(shopifyStats?.totalSales || 0)}
            change={shopifyConnected ? `${shopifyStats?.orderCount || 0} orders` : 'Not connected'}
            positive={shopifyConnected}
            color="amber"
          />
          <StatCard
            label="Stripe MRR"
            value={formatCurrency(stripeStats?.mrr || 0)}
            change="Monthly recurring"
            positive
            color="rose"
          />
        </div>
      )}

      {/* Stripe Section */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#635BFF">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.823-1.305 2.316 0 4.153 1.33 5.229 2.526l1.893-2.091C18.122 4.215 15.617 3 12.413 3 9.048 3 6 5.157 6 8.528c0 2.976 2.565 4.348 5.07 5.28 2.5.93 3.198 1.592 3.198 2.625 0 .806-.679 1.37-1.88 1.37-2.398 0-4.684-1.644-5.85-2.774l-2.045 2.132C5.946 18.567 8.74 20 12.508 20c3.752 0 6.492-2.106 6.492-5.445 0-3.2-2.668-4.535-5.024-5.405z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-100">Stripe</h3>
              <p className="text-sm text-surface-400">Payment processing & subscriptions</p>
            </div>
          </div>
          {stripeConnected && (
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                Connected
              </span>
              <button
                onClick={handleStripeDisconnect}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors border border-red-500/20"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {!stripeConnected ? (
          <form onSubmit={handleStripeConnect} className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={stripeKey}
              onChange={e => setStripeKey(e.target.value)}
              placeholder="sk_live_xxxxxxxxxxxxxxxxxxxx"
              className="flex-1 px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-accent-500 text-sm font-mono"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={connecting === 'stripe' || !stripeKey.trim()}
              className="px-6 py-3 rounded-xl bg-[#635BFF] hover:bg-[#524ee0] text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {connecting === 'stripe' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : 'Connect Stripe'}
            </button>
          </form>
        ) : (
          stripeStats && <StripeStats stats={stripeStats} />
        )}

        {/* Always show mock stats for preview */}
        {!stripeConnected && stripeStats && <StripeStats stats={stripeStats} isMock />}
      </div>

      {/* Shopify Section */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#96BF48]/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#96BF48">
                <path d="M15.37 6.37c-.3-.77-.6-1.16-.88-1.35a.85.85 0 0 0-.38-.11c-.14 0-.33.06-.56.23-.26.2-.52.56-.78 1.13-.26.56-.43 1.07-.56 1.56h3.57c-.13-.49-.3-1-.41-1.46zM15.17 8.74h-3.64c-.14.59-.25 1.19-.33 1.82h4.22c-.08-.63-.19-1.23-.25-1.82zM15.17 11.47h-4.32c-.05.6-.08 1.22-.08 1.86 0 .63.03 1.25.08 1.86h4.32c.06-.6.08-1.23.08-1.86 0-.64-.02-1.26-.08-1.86zM11.16 16.1c.07.63.18 1.23.3 1.82h3.72c.12-.59.23-1.19.3-1.82h-4.32zM16.82 13.33c0-.64-.02-1.26-.08-1.86h4.43c.06.6.08 1.22.08 1.86 0 .63-.02 1.25-.08 1.86h-4.43c.06-.6.08-1.23.08-1.86zM15.54 8.74c-.07-.63-.18-1.22-.3-1.82h-4.12C11.83 6.46 12.47 6 13.18 6c.8 0 1.44.4 2.36 2.74zM13.18 20.67c-.73 0-1.38-.48-2.1-1.1.48-.04.98-.08 1.5-.16.27-.04.5-.08.68-.12-.05.44-.08.91-.08 1.38zM8.83 16.1c.52.02 1.07.04 1.62.04.45 0 .9 0 1.35-.02-.07-.6-.13-1.2-.18-1.82h-3.08c.09.59.19 1.19.29 1.8zM9.09 13.33c-.1-.6-.2-1.22-.28-1.86H5.53c.06.6.08 1.22.08 1.86 0 .63-.02 1.25-.08 1.86h3.28c.08-.64.18-1.26.28-1.86zM8.62 6.92c.48-.05.98-.08 1.5-.08.56 0 1.1.04 1.62.1-.33-.89-.65-1.4-.98-1.65-.3-.22-.59-.3-.82-.28-.28.02-.59.18-.98.57-.24.25-.44.54-.34 1.34zM11.72 18.83c-.45-.06-.9-.1-1.38-.12.68.88 1.25 1.38 1.78 1.56.3.1.56.13.78.09.26-.04.53-.2.84-.52.25-.26.42-.57.34-1.4-.48.07-.98.12-1.5.14-.3.01-.57.06-.86.25z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-100">Shopify</h3>
              <p className="text-sm text-surface-400">E-commerce store & orders</p>
            </div>
          </div>
          {shopifyConnected && (
            <div className="flex items-center gap-3">
              {status?.shopify?.storeUrl && (
                <span className="text-sm text-surface-400 hidden sm:inline">{status.shopify.storeUrl}</span>
              )}
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                Connected
              </span>
              <button
                onClick={handleShopifyDisconnect}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors border border-red-500/20"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {!shopifyConnected ? (
          <form onSubmit={handleShopifyConnect} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={shopifyUrl}
              onChange={e => setShopifyUrl(e.target.value)}
              placeholder="your-store.myshopify.com"
              className="flex-1 px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-accent-500 text-sm"
              autoComplete="off"
            />
            <input
              type="password"
              value={shopifyToken}
              onChange={e => setShopifyToken(e.target.value)}
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
              className="flex-1 px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-accent-500 text-sm font-mono"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={connecting === 'shopify' || !shopifyUrl.trim() || !shopifyToken.trim()}
              className="px-6 py-3 rounded-xl bg-[#96BF48] hover:bg-[#85a840] text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {connecting === 'shopify' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : 'Connect Shopify'}
            </button>
          </form>
        ) : (
          shopifyStats && <ShopifyStats stats={shopifyStats} />
        )}

        {/* Always show mock stats for preview */}
        {!shopifyConnected && shopifyStats && <ShopifyStats stats={shopifyStats} isMock />}
      </div>
    </div>
  )
}

/* ── Stripe Stats ────────────────────────────────────────── */

function StripeStats({ stats, isMock }) {
  return (
    <div className="space-y-6 mt-6">
      {isMock && (
        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
          Showing demo data. Connect your Stripe account to see real numbers.
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="30-Day Revenue" value={formatCurrency(stats.totalRevenue)} color="emerald" />
        <MiniStat label="Revenue This Month" value={formatCurrency(stats.revenueThisMonth)} color="accent" />
        <MiniStat label="Active Subs" value={formatNumber(stats.activeSubscriptions)} color="amber" />
        <MiniStat label="MRR" value={formatCurrency(stats.mrr)} color="rose" />
      </div>

      {/* Revenue Chart */}
      {stats.revenueChart && stats.revenueChart.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-surface-300 mb-3">Daily Revenue (Last 30 Days)</h4>
          <div className="h-32 flex items-end gap-0.5">
            {stats.revenueChart.map((d, i) => {
              const maxRev = Math.max(...stats.revenueChart.map(x => x.revenue), 1)
              const height = Math.max(4, (d.revenue / maxRev) * 100)
              return (
                <div
                  key={i}
                  className="flex-1 bg-accent-500/40 hover:bg-accent-500/70 rounded-t transition-all"
                  style={{ height: `${height}%` }}
                  title={`${d.date}: ${formatCurrency(d.revenue)}`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-surface-500 mt-1.5">
            <span>{stats.revenueChart[0]?.date}</span>
            <span>{stats.revenueChart[stats.revenueChart.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {stats.recentTransactions && stats.recentTransactions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-surface-300 mb-3">Recent Transactions</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b border-surface-700/50">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((tx, i) => (
                  <tr key={i} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                    <td className="py-2.5 text-surface-500 font-mono text-xs">{tx.id}</td>
                    <td className="py-2.5 text-surface-200">{tx.customer}</td>
                    <td className="py-2.5 text-right text-surface-200 font-mono">{formatCurrency(tx.amount)}</td>
                    <td className="py-2.5 text-surface-400">{formatDate(tx.date)}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-400' :
                        tx.status === 'refunded' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-surface-700/10 text-surface-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Shopify Stats ───────────────────────────────────────── */

function ShopifyStats({ stats, isMock }) {
  return (
    <div className="space-y-6 mt-6">
      {isMock && (
        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
          Showing demo data. Connect your Shopify store to see real numbers.
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MiniStat label="30-Day Sales" value={formatCurrency(stats.totalSales)} color="emerald" />
        <MiniStat label="Orders" value={formatNumber(stats.orderCount)} color="accent" />
        <MiniStat label="Avg Order Value" value={formatCurrency(stats.averageOrderValue)} color="amber" />
      </div>

      {/* Revenue Chart */}
      {stats.revenueChart && stats.revenueChart.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-surface-300 mb-3">Daily Sales (Last 30 Days)</h4>
          <div className="h-32 flex items-end gap-0.5">
            {stats.revenueChart.map((d, i) => {
              const maxRev = Math.max(...stats.revenueChart.map(x => x.revenue), 1)
              const height = Math.max(4, (d.revenue / maxRev) * 100)
              return (
                <div
                  key={i}
                  className="flex-1 bg-[#96BF48]/50 hover:bg-[#96BF48]/70 rounded-t transition-all"
                  style={{ height: `${height}%` }}
                  title={`${d.date}: ${formatCurrency(d.revenue)}`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-surface-500 mt-1.5">
            <span>{stats.revenueChart[0]?.date}</span>
            <span>{stats.revenueChart[stats.revenueChart.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Top Products */}
      {stats.topProducts && stats.topProducts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-surface-300 mb-3">Top Products</h4>
          <div className="space-y-2">
            {stats.topProducts.map((p, i) => {
              const maxRevenue = stats.topProducts[0]?.revenue || 1
              const barWidth = (p.revenue / maxRevenue) * 100
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-surface-500 w-5">{i + 1}</span>
                  <span className="text-sm text-surface-200 flex-1 truncate">{p.title}</span>
                  <span className="text-xs text-surface-400">{p.orders} sold</span>
                  <div className="w-24 h-2 rounded-full bg-surface-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#96BF48]/70"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="text-sm text-surface-200 font-mono w-20 text-right">{formatCurrency(p.revenue)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {stats.recentOrders && stats.recentOrders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-surface-300 mb-3">Recent Orders</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b border-surface-700/50">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o, i) => (
                  <tr key={i} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                    <td className="py-2.5 text-surface-500 font-mono text-xs">{o.id}</td>
                    <td className="py-2.5 text-surface-200">{o.customer}</td>
                    <td className="py-2.5 text-right text-surface-200 font-mono">{formatCurrency(o.total)}</td>
                    <td className="py-2.5 text-surface-400">{formatDate(o.date)}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.status === 'fulfilled' ? 'bg-emerald-500/10 text-emerald-400' :
                        o.status === 'refunded' ? 'bg-amber-500/10 text-amber-400' :
                        o.status === 'paid' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-surface-700/10 text-surface-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Shared components ───────────────────────────────────── */

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
      {change && (
        <p className={`text-xs mt-1.5 ${positive ? 'text-emerald-400' : 'text-surface-500'}`}>
          {change}
        </p>
      )}
    </div>
  )
}

function MiniStat({ label, value, color }) {
  const colorMap = {
    accent: 'border-accent-500/20',
    emerald: 'border-emerald-500/20',
    amber: 'border-amber-500/20',
    rose: 'border-rose-500/20',
  }
  return (
    <div className={`glass p-4 border ${colorMap[color] || ''}`}>
      <p className="text-xs text-surface-400">{label}</p>
      <p className="font-display text-xl font-bold text-surface-50 mt-1">{value}</p>
    </div>
  )
}
