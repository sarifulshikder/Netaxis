import { ReactNode } from 'react'

interface PageWrapperProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export default function PageWrapper({ title, subtitle, actions, children }: PageWrapperProps) {
  return (
    <div className="space-y-10 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-slate-500 font-medium tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-4">
            {actions}
          </div>
        )}
      </div>
      <div className="relative">
        {children}
      </div>
    </div>
  )
}
