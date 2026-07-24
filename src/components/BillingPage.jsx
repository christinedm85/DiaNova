import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { useToast } from '../ToastContext.jsx'

export default function BillingPage() {
  const { user, getHeaders } = useAuth()
  const { addToast } = useToast()
  const [plans, setPlans] = useState([])
  const [myPlan, setMyPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/billing/plans').then(r => r.json()),
      fetch('/api/billing/my-plan', { headers: getHeaders() }).then(r => r.json()),
    ]).then(([p, m]) => {
      setPlans(p)
      setMyPlan(m)
      setLoading(false)
    })
  }, [])

  const handleUpgrade = async (planId) => {
    setActionLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()

      if (data.simulated) {
        addToast(data.message, 'success')
        const refresh = await fetch('/api/billing/my-plan', { headers: getHeaders() }).then(r => r.json())
        setMyPlan(refresh)
      } else if (data.url) {
        window.location.href = data.url
      }
    } catch {
      addToast('Something went wrong', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    setActionLoading('cancel')
    try {
      await fetch('/api/billing/cancel', { method: 'POST', headers: getHeaders() })
      const refresh = await fetch('/api/billing/my-plan', { headers: getHeaders() }).then(r => r.json())
      setMyPlan(refresh)
      addToast('Downgraded to Free plan', 'success')
    } catch {
      addToast('Failed to cancel', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" /></div>
  }

  const isCurrent = (id) => myPlan?.current === id

  return (
    <div className="page-enter space-y-10">
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50">Billing & Plans</h2>
        <p className="text-surface-400 mt-1">
          You&apos;re on the <span className="text-accent-400 font-semibold">{myPlan?.plan?.name}</span> plan.
          {myPlan?.hasStripeCustomer && ' Manage your subscription via Stripe.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const active = isCurrent(plan.id)
          const isPro = plan.id === 'pro'

          return (
            <div
              key={plan.id}
              className={`glass p-6 flex flex-col relative ${isPro ? 'ring-1 ring-accent-500/50' : ''} ${active ? 'border-accent-500/40' : ''}`}
            >
              {isPro && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-accent-600 text-white text-xs font-bold rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="font-display text-xl font-bold text-surface-100">{plan.name}</h3>
              <div className="mt-3 mb-5">
                <span className="font-display text-4xl font-bold text-surface-50">${plan.price}</span>
                <span className="text-surface-500 text-sm">/month</span>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    {f}
                  </li>
                ))}
              </ul>

              {active ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-accent-600/20 text-accent-400 cursor-default"
                >
                  Current Plan
                </button>
              ) : plan.id === 'free' ? (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading === 'cancel'}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-surface-800 hover:bg-surface-700 text-surface-300 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'cancel' ? 'Downgrading...' : 'Downgrade to Free'}
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!!actionLoading}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 active:scale-95 ${
                    isPro
                      ? 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg shadow-accent-600/25'
                      : 'bg-surface-800 hover:bg-surface-700 text-surface-200'
                  }`}
                >
                  {actionLoading === plan.id ? 'Redirecting...' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {myPlan?.hasStripeCustomer && (
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-2">Manage Subscription</h3>
          <p className="text-sm text-surface-400 mb-4">View invoices, update payment method, or cancel your subscription.</p>
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/billing/portal', { method: 'POST', headers: getHeaders() })
                const data = await res.json()
                if (data.url) window.location.href = data.url
              } catch { addToast('Portal unavailable', 'error') }
            }}
            className="px-4 py-2 text-sm font-medium bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-xl transition-colors"
          >
            Open Stripe Portal
          </button>
        </div>
      )}
    </div>
  )
}
