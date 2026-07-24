import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'
import { api } from './api.js'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Sponsorships from './components/Sponsorships.jsx'
import Affiliates from './components/Affiliates.jsx'
import Leads from './components/Leads.jsx'
import Pricing from './components/Pricing.jsx'
import Products from './components/Products.jsx'
import BrandBuilder from './components/BrandBuilder.jsx'
import Inbox from './components/Inbox.jsx'
import BillingPage from './components/BillingPage.jsx'
import LandingPage from './components/LandingPage.jsx'
import LoginPage from './components/LoginPage.jsx'
import RegisterPage from './components/RegisterPage.jsx'
import ForgotPasswordPage from './components/ForgotPasswordPage.jsx'
import ResetPasswordPage from './components/ResetPasswordPage.jsx'
import VerifyEmailPage from './components/VerifyEmailPage.jsx'
import ProfilePage from './components/ProfilePage.jsx'
import TeamPage from './components/TeamPage.jsx'
import Onboarding from './components/Onboarding.jsx'
import DemoPage from './components/DemoPage.jsx'
import OpportunityFeed from './components/OpportunityFeed.jsx'
import IntelligencePage from './components/IntelligencePage.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import SalesTour from './components/SalesTour.jsx'
import YouTubeIntegration from './components/YouTubeIntegration.jsx'
import MetaIntegration from './components/MetaIntegration.jsx'
import TikTokIntegration from './components/TikTokIntegration.jsx'
import MonetizationIntegration from './components/MonetizationIntegration.jsx'
import GmailIntegration from './components/GmailIntegration.jsx'

const SECTIONS = {
  dashboard: { label: 'Dashboard', icon: (props) => <SectionIcon section="dashboard" {...props} />, component: Dashboard },
  intelligence: { label: 'Intelligence 🌸', icon: (props) => <SectionIcon section="intelligence" {...props} />, component: IntelligencePage },
  sponsorships: { label: 'Your Deal Flow 💼', icon: (props) => <SectionIcon section="sponsorships" {...props} />, component: Sponsorships },
  affiliates: { label: 'Passive Income 💸', icon: (props) => <SectionIcon section="affiliates" {...props} />, component: Affiliates },
  leads: { label: 'Lead Gen 👥', icon: (props) => <SectionIcon section="leads" {...props} />, component: Leads },
  pricing: { label: 'Smart Pricing 💰', icon: (props) => <SectionIcon section="pricing" {...props} />, component: Pricing },
  products: { label: 'Products 🌙', icon: (props) => <SectionIcon section="products" {...props} />, component: Products },
  brand: { label: 'Brand Kit 🎨', icon: (props) => <SectionIcon section="brand" {...props} />, component: BrandBuilder },
  inbox: { label: 'Inbox 📬', icon: (props) => <SectionIcon section="inbox" {...props} />, component: Inbox },
  opportunities: { label: 'Deal Finder 🔍', icon: (props) => <SectionIcon section="opportunities" {...props} />, component: OpportunityFeed },
  billing: { label: 'Billing', icon: (props) => <SectionIcon section="billing" {...props} />, component: BillingPage },
  profile: { label: 'Profile', icon: (props) => <SectionIcon section="profile" {...props} />, component: ProfilePage },
  team: { label: 'Team', icon: (props) => <SectionIcon section="team" {...props} />, component: TeamPage },
  admin: { label: 'Admin', icon: (props) => <SectionIcon section="admin" {...props} />, component: AdminDashboard },
  youtube: { label: 'YouTube', icon: (props) => <SectionIcon section="youtube" {...props} />, component: YouTubeIntegration, group: 'integrations' },
  meta: { label: 'Meta', icon: (props) => <SectionIcon section="meta" {...props} />, component: MetaIntegration, group: 'integrations' },
  tiktok: { label: 'TikTok', icon: (props) => <SectionIcon section="tiktok" {...props} />, component: TikTokIntegration, group: 'integrations' },
  monetization: { label: 'Monetization', icon: (props) => <SectionIcon section="monetization" {...props} />, component: MonetizationIntegration, group: 'integrations' },
  gmail: { label: 'Gmail', icon: (props) => <SectionIcon section="gmail" {...props} />, component: GmailIntegration, group: 'integrations' },
}

export default function App() {
  const { user, loading, logout } = useAuth()
  const [active, setActive] = useState('dashboard')
  const [authPage, setAuthPage] = useState('landing')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSalesTour, setShowSalesTour] = useState(false)

  useEffect(() => {
    if (user && user.onboarding_complete === 0) {
      setShowOnboarding(true)
    }
  }, [user])

  // Check if sales tour should auto-start
  useEffect(() => {
    if (user && !localStorage.getItem('creatorbloom_tour_complete')) {
      // Delay slightly so the dashboard renders first
      const t = setTimeout(() => setShowSalesTour(true), 800)
      return () => clearTimeout(t)
    }
  }, [user])

  // Track pageviews
  useEffect(() => {
    if (user) {
      api.trackPageview(`/app/${active}`)
    } else if (authPage === 'landing') {
      api.trackPageview('/')
    } else {
      api.trackPageview(`/auth/${authPage}`)
    }
  }, [active, authPage, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-10 h-10 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    // Direct URL access (from email links)
    if (window.location.pathname === '/verify-email') {
      return <VerifyEmailPage onBack={() => { window.history.replaceState({}, '', '/'); setAuthPage('landing') }} />
    }
    if (window.location.pathname === '/reset-password') {
      return <ResetPasswordPage onBack={() => { window.history.replaceState({}, '', '/'); setAuthPage('landing') }} />
    }
    if (window.location.pathname === '/demo') {
      return <DemoPage onGetStarted={() => { window.history.replaceState({}, '', '/'); setAuthPage('register') }} />
    }
    if (authPage === 'forgot-password') return <ForgotPasswordPage onBack={() => setAuthPage('login')} />
    if (authPage === 'login') return <LoginPage onSwitch={() => setAuthPage('register')} onBack={() => setAuthPage('landing')} onForgot={() => setAuthPage('forgot-password')} />
    if (authPage === 'register') return <RegisterPage onSwitch={() => setAuthPage('login')} onBack={() => setAuthPage('landing')} />
    return <LandingPage onGetStarted={() => setAuthPage('register')} onLogin={() => setAuthPage('login')} />
  }

  const Component = SECTIONS[active].component

  // Filter sections based on user permissions
  const visibleSections = Object.fromEntries(
    Object.entries(SECTIONS).filter(([key]) => {
      if (key === 'admin') return user?.is_admin
      return true
    })
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={active} onSelect={setActive} sections={visibleSections} user={user} onLogout={logout} onProfile={() => setActive('profile')} onTourRestart={() => setShowSalesTour(true)} sectionStyles={sectionStyles} />
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto" key={active}>
          <Component onNavigate={setActive} />
        </div>
      </main>
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      {showSalesTour && (
        <SalesTour
          user={user}
          active={active}
          onNavigate={setActive}
          onComplete={() => setShowSalesTour(false)}
          onSkip={() => setShowSalesTour(false)}
          onRestart={() => setShowSalesTour(true)}
        />
      )}
    </div>
  )
}

/* ---- Icons (inline SVGs for zero-dependency) ---- */

// Section color mapping for sidebar icons
const sectionStyles = {
  dashboard: { active: '#a78bfa', label: 'violet' },        // AI Brief
  intelligence: { active: '#f472b6', label: 'pink' },         // Intelligence
  sponsorships: { active: '#34d399', label: 'emerald' },    // Revenue
  affiliates: { active: '#34d399', label: 'emerald' },      // Revenue
  leads: { active: '#a78bfa', label: 'violet' },            // AI
  pricing: { active: '#34d399', label: 'emerald' },         // Revenue
  products: { active: '#34d399', label: 'emerald' },        // Revenue
  brand: { active: '#60a5fa', label: 'blue' },              // Analytics
  inbox: { active: '#818cf8', label: 'accent' },
  opportunities: { active: '#fbbf24', label: 'amber' },     // Opportunities
  billing: { active: '#818cf8', label: 'accent' },
  profile: { active: '#818cf8', label: 'accent' },
  team: { active: '#818cf8', label: 'accent' },
  admin: { active: '#818cf8', label: 'accent' },
  youtube: { active: '#f87171', label: 'red' },             // YouTube
  meta: { active: '#60a5fa', label: 'blue' },               // Meta
  tiktok: { active: '#f472b6', label: 'pink' },             // TikTok
  monetization: { active: '#34d399', label: 'emerald' },    // Revenue
  gmail: { active: '#f87171', label: 'red' },               // Gmail
}

function SectionIcon({ section, active }) {
  const color = active ? (sectionStyles[section]?.active || '#818cf8') : '#64748b'
  switch (section) {
    case 'dashboard':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    case 'intelligence':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    case 'sponsorships':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
        </svg>
      )
    case 'affiliates':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    case 'leads':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'pricing':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    case 'products':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    case 'brand':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          <line x1="12" y1="22" x2="12" y2="15.5" />
          <polyline points="22 8.5 12 15.5 2 8.5" />
        </svg>
      )
    case 'inbox':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      )
    case 'billing':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      )
    case 'profile':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case 'team':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'opportunities':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      )
    case 'admin':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z" fill="none" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill={color} stroke="none" />
        </svg>
      )
    case 'meta':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="8.5" cy="12" r="2.5" />
          <path d="M16 9a4 4 0 0 0-4 4v4" />
          <path d="M16 15a2 2 0 1 0 0-4" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill={color} />
        </svg>
      )
    case 'monetization':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    case 'gmail':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <polyline points="3,6 12,14 21,6" />
        </svg>
      )
    default:
      return null
  }
}
