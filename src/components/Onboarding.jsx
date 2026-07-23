import { useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import FormField from './FormField.jsx'

const STEPS = [
  {
    title: 'Welcome to CreatorBloom',
    subtitle: 'Your all-in-one monetization command center. Let\'s get you set up in 60 seconds.',
    emoji: '🚀',
  },
  {
    title: 'Create Your First Deal',
    subtitle: 'Track a sponsorship or brand partnership. Start with something real or a placeholder.',
    emoji: '💼',
  },
  {
    title: 'Capture Your First Lead',
    subtitle: 'Add a lead from your audience — someone who might want to work with you.',
    emoji: '🎯',
  },
  {
    title: 'You\'re All Set!',
    subtitle: 'Your dashboard is ready. You can always come back and add more later.',
    emoji: '✨',
  },
]

export default function Onboarding({ onComplete }) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Step 1: Deal form
  const [deal, setDeal] = useState({ brand: '', amount: '', status: 'prospecting', notes: '' })

  // Step 2: Lead form
  const [lead, setLead] = useState({ name: '', email: '', source: 'Landing Page' })

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const handleBack = () => setStep(s => Math.max(s - 1, 0))

  const handleCreateDeal = async () => {
    if (!deal.brand || !deal.amount) return
    setLoading(true)
    try {
      await api.sponsorships.create({ ...deal, amount: parseFloat(deal.amount) })
      handleNext()
    } catch (e) { /* ignore */ }
    finally { setLoading(false) }
  }

  const handleCreateLead = async () => {
    if (!lead.name || !lead.email) return
    setLoading(true)
    try {
      await api.leads.create(lead)
      handleNext()
    } catch (e) { /* ignore */ }
    finally { setLoading(false) }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      await api.auth.completeOnboarding()
      onComplete()
    } catch (e) { /* ignore */ }
    finally { setLoading(false) }
  }

  const s = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 bg-surface-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass p-8 w-full max-w-md relative animate-scale-in">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= step ? 'bg-accent-400 w-6' : 'bg-surface-700'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">{s.emoji}</div>
          <h2 className="font-display text-xl font-bold text-surface-50">{s.title}</h2>
          <p className="text-sm text-surface-400 mt-1">{s.subtitle}</p>
        </div>

        {/* Step 1: Deal form */}
        {step === 1 && (
          <div className="space-y-3 mb-6">
            <FormField
              placeholder="Brand name (e.g. Nike, Adobe)"
              icon="💼"
              value={deal.brand}
              onChange={e => setDeal({ ...deal, brand: e.target.value })}
            />
            <FormField
              placeholder="Amount ($)"
              type="number"
              icon="💰"
              value={deal.amount}
              onChange={e => setDeal({ ...deal, amount: e.target.value })}
            />
          </div>
        )}

        {/* Step 2: Lead form */}
        {step === 2 && (
          <div className="space-y-3 mb-6">
            <FormField
              placeholder="Name"
              icon="👤"
              value={lead.name}
              onChange={e => setLead({ ...lead, name: e.target.value })}
            />
            <FormField
              placeholder="Email"
              type="email"
              icon="📧"
              value={lead.email}
              onChange={e => setLead({ ...lead, email: e.target.value })}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {step > 0 && step < STEPS.length - 1 && (
            <button onClick={handleBack} className="px-4 py-2.5 text-sm text-surface-400 hover:text-surface-200 transition-colors">
              Back
            </button>
          )}

          {step === 0 && (
            <>
              <button onClick={handleFinish} className="px-4 py-2.5 text-sm text-surface-500 hover:text-surface-300 transition-colors">
                Skip setup
              </button>
              <button onClick={handleNext} className="px-6 py-2.5 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-colors">
                Let's go
              </button>
            </>
          )}

          {step === 1 && (
            <button
              onClick={handleCreateDeal}
              disabled={loading || !deal.brand || !deal.amount}
              className="px-6 py-2.5 bg-accent-600 hover:bg-accent-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Creating...' : 'Create deal'}
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleCreateLead}
              disabled={loading || !lead.name || !lead.email}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Capturing...' : 'Capture lead'}
            </button>
          )}

          {step === 3 && (
            <button onClick={handleFinish} disabled={loading} className="px-6 py-2.5 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-colors">
              {loading ? 'Finishing...' : 'Go to dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
