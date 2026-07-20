export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-sm" />
      <div
        className="relative glass p-6 max-w-sm w-full space-y-4 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-display text-lg font-semibold text-surface-100">{title}</h3>
        <p className="text-sm text-surface-400">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
