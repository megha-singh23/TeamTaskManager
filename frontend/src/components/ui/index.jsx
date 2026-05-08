export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-ink-600 text-ink-200',
    volt: 'bg-volt-400/15 text-volt-400 border border-volt-400/25',
    blue: 'bg-blue-400/12 text-blue-400 border border-blue-400/25',
    red: 'bg-red-400/12 text-red-400 border border-red-400/25',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`priority-${priority} inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  const labels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
  return (
    <span className={`status-${status} inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold`}>
      {labels[status] || status}
    </span>
  );
}

export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} rounded-lg bg-gradient-to-br from-volt-400/20 to-blue-400/20 border border-volt-400/15 flex items-center justify-center font-bold text-volt-400 shrink-0`}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg glass rounded-2xl p-6 shadow-2xl animate-fade-up border border-ink-600"
        onClick={e => e.stopPropagation()}
      >
        {title && <h2 className="text-lg font-bold text-white mb-5">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-200">{label}</label>}
      <input
        className={`w-full bg-ink-800 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-ink-400 focus:outline-none focus:border-volt-400/50 focus:ring-1 focus:ring-volt-400/20 transition-all ${error ? 'border-red-400/50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-200">{label}</label>}
      <select
        className={`w-full bg-ink-800 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-volt-400/50 focus:ring-1 focus:ring-volt-400/20 transition-all ${error ? 'border-red-400/50' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-200">{label}</label>}
      <textarea
        className={`w-full bg-ink-800 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-ink-400 focus:outline-none focus:border-volt-400/50 focus:ring-1 focus:ring-volt-400/20 transition-all resize-none ${error ? 'border-red-400/50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  const variants = {
    primary: 'bg-volt-400 text-ink-900 hover:bg-volt-500 font-semibold',
    ghost: 'bg-transparent text-ink-200 hover:bg-ink-700 hover:text-white border border-ink-600',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-400/20',
  };
  return (
    <button
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
