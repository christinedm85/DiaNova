import { useState, useEffect, useCallback } from 'react'
import { api } from '../api.js'

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: '👋 Welcome to CreatorBloom',
    description: 'Your all-in-one monetization command center. In the next 90 seconds, we\'ll show you exactly how to turn your content into a thriving business.',
    target: null,
    section: null,
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Your Smart Home Screen',
    description: 'This is where your business talks to you. It proactively surfaces insights — underpriced deals that need attention, overdue follow-ups costing you money, and revenue forecasts. Think of it as your personal business advisor that works 24/7.',
    target: 'sales-tour-dashboard-hero',
    section: 'dashboard',
    position: 'bottom',
  },
  {
    id: 'forecast',
    title: 'Revenue Forecasting',
    description: null, // set dynamically
    target: 'sales-tour-forecast',
    section: 'dashboard',
    position: 'top',
  },
  {
    id: 'sponsorships',
    title: 'Your Sponsorship Pipeline',
    description: 'Track every brand deal from prospect to paid — no more spreadsheet chaos. Drag deals through stages, log notes, and know exactly how much money is in your pipeline at all times.',
    target: 'sales-tour-sponsorships',
    section: 'sponsorships',
    position: 'top',
  },
  {
    id: 'leads',
    title: 'Lead Capture & Funnel',
    description: 'Capture leads from your content and see exactly where they come from. Watch them convert through a visual funnel so you always know which channels are working.',
    target: 'sales-tour-leads',
    section: 'leads',
    position: 'top',
  },
  {
    id: 'products',
    title: 'Sell Digital Products',
    description: 'Turn your expertise into income. List guides, templates, presets — whatever your audience needs. Our AI suggests what to create and how to price it for maximum sales.',
    target: 'sales-tour-products',
    section: 'products',
    position: 'top',
  },
  {
    id: 'brand',
    title: 'Your Professional Brand Kit',
    description: 'Always be ready to pitch. Your media kit lives here — audience demographics, engagement stats, content pillars, past collaborations. Send it to brands in seconds.',
    target: 'sales-tour-brand',
    section: 'brand',
    position: 'top',
  },
  {
    id: 'ai',
    title: 'Your Secret Weapon: AI Assistant',
    description: '8 AI tools that do the heavy lifting: pricing suggestions, brand match scoring, follow-up drafts, content ideas, brand discovery, negotiation coaching, competitive benchmarking, and contract scanning. This alone pays for your subscription.',
    target: 'sales-tour-ai-button',
    section: 'dashboard',
    position: 'bottom',
  },
  {
    id: 'opportunities',
    title: 'The Opportunity Feed',
    description: 'Stop hunting for work. Our AI finds brand deals, seasonal trends, and content opportunities matched to your niche so you never miss a chance to earn.',
    target: 'sales-tour-opportunities',
    section: 'opportunities',
    position: 'top',
  },
  {
    id: 'admin',
    title: 'Admin Command Center',
    description: 'Manage your entire platform from here. View all users, track MRR, control feature flags, and seed demo data for new users.',
    target: 'sales-tour-admin',
    section: 'admin',
    position: 'top',
    adminOnly: true,
  },
  {
    id: 'cta',
    title: 'Ready to Take Control?',
    description: 'There\'s money waiting in your pipeline. Start exploring — every feature you just saw was built to help you earn more from your content.',
    target: null,
    section: null,
    position: 'center',
    isCTA: true,
  },
]

export default function SalesTour({ onComplete, onSkip, active, onNavigate, user, onRestart }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [forecastData, setForecastData] = useState(null)
  const [steps, setSteps] = useState(TOUR_STEPS)

  // Filter out admin-only steps if user is not admin
  useEffect(() => {
    if (user?.is_admin) {
      setSteps(TOUR_STEPS)
    } else {
      setSteps(TOUR_STEPS.filter(s => !s.adminOnly))
    }
  }, [user])

  const isActive = step < steps.length

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [])

  // Fetch forecast data when we reach step 3 (forecast)
  useEffect(() => {
    if (!isActive) return
    const s = steps[step]
    if (s.id === 'forecast' && !forecastData) {
      api.insights().then(data => {
        setForecastData(data)
      }).catch(() => {
        setForecastData({ forecast: null })
      })
    }
  }, [step, isActive, forecastData, steps])

  // Highlight the target element for each step
  useEffect(() => {
    if (!isActive) return
    const s = steps[step]
    if (!s.target) {
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight')
      })
      return
    }
    // Remove old highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })
    // Wait for section navigation to complete, then highlight
    const timer = setTimeout(() => {
      const el = document.getElementById(s.target)
      if (el) {
        el.classList.add('tour-highlight')
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 400)
    return () => {
      clearTimeout(timer)
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight')
      })
    }
  }, [step, isActive, steps])

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) {
      setAnimating(true)
      setTimeout(() => {
        setStep(s => s + 1)
        setAnimating(false)
      }, 200)
    } else {
      setVisible(false)
      setTimeout(() => {
        localStorage.setItem('creatorbloom_tour_complete', 'true')
        onComplete?.()
      }, 300)
    }
  }, [step, onComplete, steps])

  const handlePrev = useCallback(() => {
    if (step > 0) {
      setAnimating(true)
      setTimeout(() => {
        setStep(s => s - 1)
        setAnimating(false)
      }, 200)
    }
  }, [step])

  // Navigate to the right section when stepping to a section-specific step
  useEffect(() => {
    if (!isActive) return
    const s = steps[step]
    if (s.section && active !== s.section) {
      onNavigate?.(s.section)
    }
    // Auto-open AI panel if we're on the AI step
    if (s.id === 'ai') {
      setTimeout(() => {
        const aiBtn = document.getElementById('sales-tour-ai-button')
        if (aiBtn) aiBtn.click()
      }, 600)
    }
  }, [step, isActive, active, onNavigate, steps])

  const handleSkip = () => {
    setVisible(false)
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })
    localStorage.setItem('creatorbloom_tour_complete', 'true')
    setTimeout(() => onSkip?.(), 300)
  }

  if (step >= steps.length) return null

  const currentStep = steps[step]
  const isLast = step === steps.length - 1

  // Build dynamic forecast description
  let description = currentStep.description
  if (currentStep.id === 'forecast') {
    if (forecastData?.forecast?.nextMonth) {
      const nextMonth = forecastData.forecast.nextMonth.toLocaleString()
      const potential = forecastData.forecast.potentialIncrease || 0
      description = `Based on your pipeline, you're projected to earn $${nextMonth} next month. Closing just one more deal would increase that by up to ${potential}%. That's real money you can influence right now.`
    } else {
      description = 'This card projects your future earnings based on your active pipeline. Every deal you move through the pipeline directly impacts this number — it\'s your motivation to close.'
    }
  }

  return (
    <>
      {/* Backdrop for center-positioned steps */}
      {currentStep.position === 'center' && (
        <div
          className={`fixed inset-0 z-[90] bg-surface-950/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleSkip}
        />
      )}

      {/* Tooltip card */}
      <div
        className={`fixed z-[100] transition-all duration-300 ${
          visible ? 'opacity-100' : 'opacity-0 translate-y-4'
        } ${
          currentStep.position === 'center'
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : currentStep.position === 'top'
            ? 'top-8 left-1/2 -translate-x-1/2'
            : 'bottom-24 left-1/2 -translate-x-1/2'
        }`}
      >
        <div className={`glass p-6 max-w-md w-[90vw] shadow-2xl shadow-accent-600/20 ring-1 ring-accent-400/30 transition-all duration-200 ${
          animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-scale-in'
        }`}>
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-accent-400 uppercase tracking-widest">
              Step {step + 1} of {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
            >
              Skip tour
            </button>
          </div>

          {/* Content */}
          <h3 className="font-display text-xl font-bold text-surface-50 mb-2">
            {currentStep.title}
          </h3>
          <p className="text-sm text-surface-400 leading-relaxed mb-6">
            {description}
          </p>

          {/* CTA button for last step */}
          {currentStep.isCTA && (
            <button
              onClick={handleNext}
              className="block w-full text-center px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-600/30 mb-4"
            >
              Start Exploring — Find Your Next Deal →
            </button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={step === 0}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                step === 0
                  ? 'text-surface-600 cursor-not-allowed'
                  : 'text-surface-300 hover:text-surface-100 hover:bg-surface-800/50'
              }`}
            >
              ← Back
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i !== step) {
                      setAnimating(true)
                      setTimeout(() => { setStep(i); setAnimating(false) }, 200)
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'bg-accent-400 w-5'
                      : i < step
                      ? 'bg-accent-600/50 hover:bg-accent-500/50'
                      : 'bg-surface-700 hover:bg-surface-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isLast
                  ? 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg shadow-accent-600/25'
                  : 'text-accent-400 hover:text-accent-300 hover:bg-accent-600/10'
              }`}
            >
              {isLast ? 'Finish →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      {/* Highlight glow style */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 85 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 30px rgba(99, 102, 241, 0.3) !important;
          border-radius: 1rem !important;
          transition: box-shadow 0.4s ease !important;
        }
      `}</style>
    </>
  )
}
