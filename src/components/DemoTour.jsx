import { useState, useEffect, useCallback } from 'react'

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to CreatorBloom',
    description: 'In the next 60 seconds, we\'ll show you how CreatorBloom helps you manage your entire creator business in one place.',
    target: null,
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Your Revenue Command Center',
    description: 'See all your income streams at a glance — sponsorships, affiliates, and product sales. Track trends and get smart recommendations.',
    target: 'demo-dashboard-section',
    position: 'top',
  },
  {
    id: 'sponsorships',
    title: 'Sponsorship Pipeline',
    description: 'Track every brand deal from prospecting to paid. Drag deals through stages and never miss a follow-up.',
    target: 'demo-sponsorships-section',
    position: 'top',
  },
  {
    id: 'leads',
    title: 'Lead Generation',
    description: 'Capture leads from your content and track conversion rates through a beautiful funnel visualization.',
    target: 'demo-leads-section',
    position: 'top',
  },
  {
    id: 'products',
    title: 'Digital Products',
    description: 'Create and sell digital products directly to your audience. Track sales, revenue, and get new product ideas.',
    target: 'demo-products-section',
    position: 'top',
  },
  {
    id: 'ai',
    title: 'AI-Powered Creator Tools',
    description: 'Let AI handle the busywork. Get pricing suggestions, brand match scores, follow-up drafts, content ideas, and discover brands to pitch — all from one panel.',
    target: 'demo-ai-section',
    position: 'top',
  },
  {
    id: 'opportunities',
    title: 'Opportunity Feed',
    description: 'Stop hunting for work. Our AI surfaces brand deals, seasonal trends, and content opportunities matched to your niche — so you never miss a chance to earn.',
    target: 'demo-opportunities-section',
    position: 'top',
  },
  {
    id: 'cta',
    title: 'Ready to try it yourself?',
    description: 'Join 2,400+ creators already using CreatorBloom. Start free — no credit card required.',
    target: null,
    position: 'center',
    isCTA: true,
  },
]

export default function DemoTour({ onComplete, onSkip, currentSection, onNavigate }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  const isActive = step < TOUR_STEPS.length

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [])

  // Highlight the target element for each step
  useEffect(() => {
    if (!isActive) return
    const s = TOUR_STEPS[step]
    if (!s.target) {
      // Remove any existing highlights
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight')
      })
      return
    }
    // Remove old highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })
    // Add new highlight
    const el = document.getElementById(s.target)
    if (el) {
      el.classList.add('tour-highlight')
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return () => {
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight')
      })
    }
  }, [step, isActive])

  const handleNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setAnimating(true)
      setTimeout(() => {
        setStep(s => s + 1)
        setAnimating(false)
      }, 200)
    } else {
      // Last step (CTA) - complete
      setVisible(false)
      setTimeout(() => onComplete?.(), 300)
    }
  }, [step, onComplete])

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
    const s = TOUR_STEPS[step]
    const sectionMap = {
      'demo-dashboard-section': 'dashboard',
      'demo-sponsorships-section': 'sponsorships',
      'demo-leads-section': 'leads',
      'demo-products-section': 'products',
      'demo-ai-section': 'ai',
      'demo-opportunities-section': 'opportunities',
    }
    const targetSection = sectionMap[s.target]
    if (targetSection && currentSection !== targetSection) {
      onNavigate?.(targetSection)
    }
  }, [step, isActive, currentSection, onNavigate])

  const handleSkip = () => {
    setVisible(false)
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })
    setTimeout(() => onSkip?.(), 300)
  }

  if (step >= TOUR_STEPS.length) return null

  const currentStep = TOUR_STEPS[step]
  const isLast = step === TOUR_STEPS.length - 1

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
              Step {step + 1} of {TOUR_STEPS.length}
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
            {currentStep.description}
          </p>

          {/* CTA button for last step */}
          {currentStep.isCTA && (
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                handleSkip()
                // Navigate to the landing page signup
                window.location.href = '/?signup=1'
              }}
              className="block w-full text-center px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-600/30 mb-4"
            >
              Get Started Free →
            </a>
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
              {TOUR_STEPS.map((_, i) => (
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
              {isLast ? 'Start Free →' : 'Next →'}
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
