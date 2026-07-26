import { useState, useEffect, useMemo } from 'react'
import { api } from '../api.js'

const TYPE_CONFIG = {
  content: { badge: 'Content', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  'follow-up': { badge: 'Follow-up', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  admin: { badge: 'Admin', color: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  opportunity: { badge: 'Opportunity', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// ── Mock calendar data for fallback / demo ────────────────────
const MOCK_WEEK = [
  {
    day: 'Monday',
    events: [
      { emoji: '🎥', title: 'Upload skincare tutorial', type: 'content', time: '9:00 AM' },
      { emoji: '📊', title: 'Review weekly analytics', type: 'admin', time: '2:00 PM' },
    ],
  },
  {
    day: 'Tuesday',
    events: [
      { emoji: '📧', title: 'Follow up with Glow Cosmetics', type: 'follow-up', time: '10:00 AM' },
      { emoji: '✏️', title: 'Draft video script for Friday', type: 'content', time: '1:00 PM' },
      { emoji: '📋', title: 'Update media kit for Q3', type: 'admin', time: '4:00 PM' },
    ],
  },
  {
    day: 'Wednesday',
    events: [
      { emoji: '💰', title: 'Send invoice to Brand X', type: 'admin', time: '9:30 AM' },
      { emoji: '🎬', title: 'Film B-roll for weekend release', type: 'content', time: '11:00 AM' },
      { emoji: '🤝', title: 'Negotiation call with FitLife', type: 'follow-up', time: '3:00 PM' },
    ],
  },
  {
    day: 'Thursday',
    events: [
      { emoji: '🎯', title: 'Best day to publish — TikTok algorithm peak', type: 'content', time: '7:00 PM' },
      { emoji: '📝', title: 'Write newsletter draft', type: 'content', time: '10:00 AM' },
      { emoji: '🔍', title: 'Research 3 new brand partners', type: 'opportunity', time: '2:00 PM' },
    ],
  },
  {
    day: 'Friday',
    events: [
      { emoji: '🚀', title: 'Affiliate campaign goes live', type: 'opportunity', time: '8:00 AM' },
      { emoji: '📹', title: 'Publish YouTube video', type: 'content', time: '12:00 PM' },
      { emoji: '📬', title: 'Respond to brand inquiries', type: 'follow-up', time: '3:00 PM' },
    ],
  },
  {
    day: 'Saturday',
    events: [
      { emoji: '🧘', title: 'Light content day — engage with community', type: 'content', time: '11:00 AM' },
      { emoji: '📈', title: 'Weekend analytics check-in', type: 'admin', time: '4:00 PM' },
    ],
  },
  {
    day: 'Sunday',
    events: [
      { emoji: '📅', title: 'Plan next week\'s content calendar', type: 'admin', time: '10:00 AM' },
      { emoji: '💡', title: 'Brainstorm new series ideas', type: 'content', time: '2:00 PM' },
      { emoji: '📊', title: 'Monthly revenue report', type: 'admin', time: '5:00 PM' },
    ],
  },
]

// ── Build calendar from real data ────────────────────────────
function buildCalendarFromData(sponsorships, insights) {
  const week = DAYS.map(day => ({ day, events: [] }))

  // Map sponsorships to follow-up events
  const followUpStatuses = ['prospecting', 'negotiating']
  const followUps = (sponsorships || []).filter(s => followUpStatuses.includes(s.status))

  // Distribute follow-ups across weekdays (Mon-Fri)
  const weekdayIndices = [0, 1, 2, 3, 4] // Mon-Fri
  followUps.forEach((s, i) => {
    const dayIdx = weekdayIndices[i % weekdayIndices.length]
    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM']
    week[dayIdx].events.push({
      emoji: '📧',
      title: `Follow up with ${s.brand}`,
      type: 'follow-up',
      time: timeSlots[i % timeSlots.length],
    })
  })

  // Generate content events from insights
  if (insights && insights.length > 0) {
    const contentInsight = insights.find(i => i.type === 'trend' || i.type === 'opportunity')
    if (contentInsight) {
      week[3].events.unshift({ // Thursday
        emoji: '🎯',
        title: contentInsight.action || 'Best day to publish',
        type: 'content',
        time: '7:00 PM',
      })
    }
  }

  // Always add some core admin events
  week[0].events.push({ emoji: '📊', title: 'Review weekly analytics', type: 'admin', time: '9:00 AM' })
  week[2].events.push({ emoji: '💰', title: 'Send pending invoices', type: 'admin', time: '10:00 AM' })
  week[4].events.push({ emoji: '📬', title: 'Respond to brand inquiries', type: 'follow-up', time: '3:00 PM' })
  week[6].events.push({ emoji: '📅', title: 'Plan next week\'s content', type: 'admin', time: '10:00 AM' })

  // Add opportunity events if we have prospecting deals
  if (followUps.length > 2) {
    week[4].events.unshift({
      emoji: '🚀',
      title: `${followUps.length} deals in pipeline — push for close`,
      type: 'opportunity',
      time: '8:00 AM',
    })
  }

  // Fill any empty day with at least one content event
  week.forEach((day, i) => {
    if (day.events.length === 0) {
      day.events.push({
        emoji: '🎬',
        title: i >= 5 ? 'Light content — engage with community' : 'Content creation block',
        type: 'content',
        time: i >= 5 ? '11:00 AM' : '10:00 AM',
      })
    }
  })

  return week
}

// ── Get current week dates ──────────────────────────────────
function getWeekDates(weekOffset = 0) {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7)

  return DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatWeekRange(dates) {
  const start = dates[0]
  const end = dates[6]
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} — ${endStr}`
}

// ── Main Component ─────────────────────────────────────────
export default function CreatorCalendar({ onNavigate }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [events, setEvents] = useState(null)
  const [loading, setLoading] = useState(true)

  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([
      api.sponsorships.list().catch(() => []),
      api.insights().catch(() => []),
    ]).then(([sponsorships, insightsData]) => {
      if (cancelled) return
      const insights = insightsData?.insights || insightsData || []
      const hasRealData = (sponsorships && sponsorships.length > 0) || insights.length > 0

      if (hasRealData) {
        setEvents(buildCalendarFromData(sponsorships, insights))
      } else {
        setEvents(MOCK_WEEK)
      }
      setLoading(false)
    }).catch(() => {
      if (!cancelled) {
        setEvents(MOCK_WEEK)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [weekOffset])

  const weekEvents = events || MOCK_WEEK
  const isCurrentWeek = weekOffset === 0

  return (
    <div className="page-enter space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 id="sales-tour-calendar" className="font-display text-3xl font-bold text-surface-50">
            Creator Calendar 📅
          </h2>
          <p className="text-surface-400 mt-1">Your week, intelligently planned</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="p-2 rounded-xl glass border border-surface-600/30 text-surface-400 hover:text-surface-200 hover:bg-surface-700/50 transition-all duration-200"
            aria-label="Previous week"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="text-center min-w-[180px]">
            <div className="text-surface-200 font-semibold text-sm">
              Week of {formatWeekRange(dates)}
            </div>
            {isCurrentWeek && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                Current Week
              </span>
            )}
          </div>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="p-2 rounded-xl glass border border-surface-600/30 text-surface-400 hover:text-surface-200 hover:bg-surface-700/50 transition-all duration-200"
            aria-label="Next week"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {DAYS.map((dayName, idx) => {
            const dayEvents = weekEvents[idx]?.events || []
            const date = dates[idx]
            const today = new Date()
            const isDateToday = isCurrentWeek &&
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()

            return (
              <div
                key={dayName}
                className={`glass rounded-2xl p-4 border flex flex-col gap-3 transition-all duration-200 ${
                  isDateToday
                    ? 'border-accent-400/30 ring-1 ring-accent-400/10'
                    : 'border-surface-700/30'
                }`}
              >
                {/* Day header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-surface-400 tracking-wide uppercase">{dayName.slice(0, 3)}</div>
                    <div className={`text-lg font-bold mt-0.5 ${isDateToday ? 'text-accent-300' : 'text-surface-200'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                  {isDateToday && (
                    <span className="text-[10px] font-semibold bg-accent-500/20 text-accent-400 px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                {/* Events */}
                <div className="flex-1 space-y-2">
                  {dayEvents.length === 0 ? (
                    <div className="text-xs text-surface-600 italic py-4 text-center">
                      No events scheduled
                    </div>
                  ) : (
                    dayEvents.map((event, ei) => {
                      const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.admin
                      return (
                        <div
                          key={`${event.title}-${ei}`}
                          className={`rounded-xl p-3 border text-sm transition-all duration-200 hover:scale-[1.02] cursor-default ${config.color} bg-surface-800/40`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-base leading-none mt-0.5 shrink-0">{event.emoji}</span>
                            <div className="min-w-0">
                              <div className="font-medium text-surface-100 text-xs leading-tight truncate">
                                {event.title}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-surface-500">{event.time}</span>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${config.color}`}>
                                  {config.badge}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* AI Insight Banner */}
      {!loading && (
        <div className="glass rounded-2xl p-5 border border-violet-500/15 bg-violet-500/5">
          <div className="flex items-start gap-3">
            <span className="text-xl">🌸</span>
            <div>
              <div className="text-sm font-semibold text-violet-300">Bloom's Scheduling Tip</div>
              <p className="text-xs text-surface-400 mt-1 leading-relaxed">
                {weekOffset === 0
                  ? 'Thursday afternoon is your highest-engagement window this week. Schedule your main publish for 7 PM ET for maximum reach. Your follow-ups are best sent Tuesday morning when brand managers are clearing their inboxes.'
                  : weekOffset < 0
                    ? 'Looking back at this past week — great consistency! Consider batching your filming on Wednesday to free up Thursday for outreach.'
                    : 'Looking ahead — this is a great week to pitch new brands. Your audience growth trend is strong, and brands love partnering with creators on an upward trajectory.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
