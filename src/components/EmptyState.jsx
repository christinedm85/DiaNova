export default function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="font-display text-lg text-surface-300 mb-2">{title}</h3>
      <p className="text-surface-500 text-sm mb-6 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action}
          className="px-4 py-2 text-sm font-medium text-surface-400 hover:text-surface-200 bg-surface-800/50 hover:bg-surface-700/50 border border-surface-700/50 rounded-xl transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
