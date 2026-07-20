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

const SECTIONS = {
  dashboard: { label: 'Dashboard', icon: DashboardIcon, component: Dashboard },
  sponsorships: { label: 'Sponsorships', icon: SponsorshipIcon, component: Sponsorships },
  affiliates: { label: 'Affiliates', icon: AffiliateIcon, component: Affiliates },
  leads: { label: 'Lead Gen', icon: LeadIcon, component: Leads },
  pricing: { label: 'Pricing', icon: PricingIcon, component: Pricing },
  products: { label: 'Products', icon: ProductsIcon, component: Products },
  brand: { label: 'Brand', icon: BrandIcon, component: BrandBuilder },
  inbox: { label: 'Inbox', icon: InboxIcon, component: Inbox },
  billing: { label: 'Billing', icon: BillingIcon, component: BillingPage },
  profile: { label: 'Profile', icon: ProfileIcon, component: ProfilePage },
  team: { label: 'Team', icon: TeamIcon, component: TeamPage },
}

export default function App() {
  const { user, loading, logout } = useAuth()
  const [active, setActive] = useState('dashboard')
  const [authPage, setAuthPage] = useState('landing')
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (user && user.onboarding_complete === 0) {
      setShowOnboarding(true)
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
    if (authPage === 'forgot-password') return <ForgotPasswordPage onBack={() => setAuthPage('login')} />
    if (authPage === 'login') return <LoginPage onSwitch={() => setAuthPage('register')} onBack={() => setAuthPage('landing')} onForgot={() => setAuthPage('forgot-password')} />
    if (authPage === 'register') return <RegisterPage onSwitch={() => setAuthPage('login')} onBack={() => setAuthPage('landing')} />
    return <LandingPage onGetStarted={() => setAuthPage('register')} onLogin={() => setAuthPage('login')} />
  }

  const Component = SECTIONS[active].component

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={active} onSelect={setActive} sections={SECTIONS} user={user} onLogout={logout} onProfile={() => setActive('profile')} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto" key={active}>
          <Component />
        </div>
      </main>
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
    </div>
  )
}

/* ---- Icons (inline SVGs for zero-dependency) ---- */

function DashboardIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function SponsorshipIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
    </svg>
  )
}

function AffiliateIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function LeadIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function PricingIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function ProductsIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function BrandIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="22" x2="12" y2="15.5" />
      <polyline points="22 8.5 12 15.5 2 8.5" />
    </svg>
  )
}

function InboxIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function BillingIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

function ProfileIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function TeamIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#818cf8' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
