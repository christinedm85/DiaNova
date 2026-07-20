export default function FormField({ label, icon, error, className = '', ...inputProps }) {
  return (
    <div>
      {label && <label className="text-xs text-surface-400 block mb-1.5">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none">
            {icon}
          </span>
        )}
        <input
          {...inputProps}
          className={`form-field-input w-full px-3 py-2.5 rounded-xl border transition-colors text-surface-200 text-sm focus:outline-none focus:border-accent-500 placeholder:text-surface-500
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-rose-400' : 'border-surface-700/50'}
            ${className}
          `}
        />
      </div>
      {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
