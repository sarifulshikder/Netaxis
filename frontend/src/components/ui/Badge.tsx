import { getStatusColor } from '@/lib/utils'

interface BadgeProps {
  status: string
  label?: string
  className?: string
}

export default function Badge({ status, label, className = '' }: BadgeProps) {
  const colorClass = getStatusColor(status.toLowerCase())
  
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
      ${colorClass} 
      ${colorClass.includes('emerald') ? 'border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : ''}
      ${colorClass.includes('red') ? 'border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : ''}
      ${colorClass.includes('sky') || colorClass.includes('primary') ? 'border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]' : ''}
      ${colorClass.includes('amber') || colorClass.includes('warning') ? 'border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : ''}
      ${colorClass.includes('slate') ? 'border-slate-500/20' : ''}
      ${className}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${colorClass.split(' ')[1].replace('text-', 'bg-')}`} />
      {label || status}
    </span>
  )
}
