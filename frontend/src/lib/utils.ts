export const formatCurrency = (amount: number): string => {
  return `৳${Number(amount || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatDate = (date: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

export const formatDateTime = (date: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-GB')
}

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400',
    inactive: 'bg-slate-500/20 text-slate-400',
    suspended: 'bg-red-500/20 text-red-400',
    blocked: 'bg-red-900/30 text-red-300',
    paid: 'bg-emerald-500/20 text-emerald-400',
    overdue: 'bg-red-500/20 text-red-400',
    draft: 'bg-slate-500/20 text-slate-400',
    sent: 'bg-sky-500/20 text-sky-400',
    void: 'bg-slate-700/50 text-slate-500',
    open: 'bg-sky-500/20 text-sky-400',
    in_progress: 'bg-amber-500/20 text-amber-400',
    resolved: 'bg-emerald-500/20 text-emerald-400',
    closed: 'bg-slate-500/20 text-slate-400',
    online: 'bg-emerald-500/20 text-emerald-400',
    offline: 'bg-red-500/20 text-red-400',
    available: 'bg-emerald-500/20 text-emerald-400',
    used: 'bg-slate-500/20 text-slate-400',
    expired: 'bg-red-500/20 text-red-400',
    pending: 'bg-amber-500/20 text-amber-400',
    approved: 'bg-emerald-500/20 text-emerald-400',
  }
  return map[status] || 'bg-slate-500/20 text-slate-400'
}

export const truncate = (str: string, n: number): string => {
  return str?.length > n ? str.slice(0, n - 1) + '…' : str
}
