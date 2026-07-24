export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryLabel,
  color = 'accent',
}) {
  const colorClasses = {
    accent: 'bg-accent-600 hover:bg-accent-500 shadow-lg shadow-accent-600/25',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25',
    amber: 'bg-amber-500 hover:bg-amber-400 text-surface-950 shadow-lg shadow-amber-500/25',
    rose: 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25',
    purple: 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/25',
    blue: 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25',
  }

  const btnColor = colorClasses[color] || colorClasses.accent

  return (
    <div className="glass p-8 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-surface-800/70 border border-surface-700/30 flex items-center justify-center mb-5 text-2xl">
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold text-surface-100 mb-2">{title}</h3>
      <p className="text-surface-400 text-sm mb-6 max-w-sm leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {action && (
          <button
            onClick={action}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 text-white ${btnColor}`}
          >
            {actionLabel}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction}
            className="px-4 py-2.5 text-sm font-medium text-surface-400 hover:text-surface-200 bg-surface-800/50 hover:bg-surface-700/50 border border-surface-700/50 rounded-xl transition-colors"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  )
}
