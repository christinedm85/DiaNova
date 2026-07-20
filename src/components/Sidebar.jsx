import { useTheme } from '../ThemeContext.jsx'

function planEmoji(plan) {
  if (plan === 'studio') return '👑'
  if (plan === 'pro') return '⭐'
  return ''
}

export default function Sidebar({ active, onSelect, sections, user, onLogout, onProfile }) {
  const { theme, toggle } = useTheme()
  const emoji = planEmoji(user?.plan)

  return (
    <aside className="w-64 h-full glass rounded-none border-t-0 border-b-0 border-l-0 flex flex-col shrink-0">
      <div className="px-6 py-7 border-b border-surface-700/50">
        <h1 className="font-display text-xl font-bold">
          <span className="gradient-text">Creator</span>
          <span className="text-surface-100">Pilot</span>
        </h1>
        <p className="text-xs text-surface-500 mt-0.5 tracking-wide">MONETIZE YOUR CRAFT</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {Object.entries(sections).flatMap(([key, { label, icon: Icon }]) => {
          const isActive = active === key
          const btn = (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-accent-600/15 text-accent-400 border-l-3 border-l-accent-500'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
              }`}
            >
              <Icon active={isActive} />
              {label}
            </button>
          )
          if (key === 'inbox') {
            return [btn, <div key="nav-sep" className="my-2 border-t border-surface-800" />]
          }
          return [btn]
        })}
      </nav>

      <div className="px-4 py-3 border-t border-surface-700/50 space-y-2">
        <button
          onClick={toggle}
          className="flex items-center gap-2 w-full text-xs text-surface-500 hover:text-surface-300 transition-colors px-1"
        >
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button onClick={onProfile} className="flex items-center gap-3 w-full rounded-xl p-2 -mx-2 hover:bg-surface-800/50 transition-colors">
          <div className="w-10 h-10 rounded-full gradient-border flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-surface-700">
            {user?.name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-surface-200 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-accent-400 capitalize">{emoji}{emoji ? ' ' : ''}{user?.plan || 'free'} Plan</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
