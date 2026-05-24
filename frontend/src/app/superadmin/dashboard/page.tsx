'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, CheckCircle, Clock, TrendingUp, Plus, ArrowRight, ExternalLink, CreditCard, Sparkles, Calendar } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { format } from 'date-fns'

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

const apiFetch = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options?.headers,
    },
  })
  return res.json()
}

interface DashboardStats {
  total_tenants: number
  active_tenants: number
  trial_tenants: number
  monthly_revenue: number
}

interface Tenant {
  id: string
  name: string
  slug: string
  plan_name: string
  status: string
  created_at: string
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          apiFetch('/dashboard/stats'),
          apiFetch('/superadmin/tenants')
        ])
        setStats(statsRes.data || { total_tenants: 0, active_tenants: 0, trial_tenants: 0, monthly_revenue: 0 })
        setTenants(tenantsRes.data?.slice(0, 5) || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
    </div>
  )

  const currentDate = format(new Date(), "EEEE, MMMM do")

  return (
    <div className="space-y-12 animate-in">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-3">
            <Sparkles size={14} />
            <span>Platform Intelligence</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
            System <span className="text-primary">Pulse</span>
          </h1>
          <div className="flex items-center text-slate-500 mt-4 font-bold text-sm tracking-wide">
            <Calendar size={16} className="mr-2" />
            <span>{currentDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/superadmin/tenants/new" className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 px-6 py-3 shadow-xl">
            <Plus size={18} />
            <span className="text-sm font-bold">Register New ISP</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total ISPs', value: stats?.total_tenants || 0, icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Status', value: stats?.active_tenants || 0, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Trial Mode', value: stats?.trial_tenants || 0, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Net Revenue', value: formatCurrency(stats?.monthly_revenue || 0), icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 group hover:border-white/20 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon size={28} />
              </div>
            </div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Tenants Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-wider">Recent Provisions</h2>
            <Link href="/superadmin/tenants" className="text-primary hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2 group">
              Audit Logs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-navy-950/20 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Provider Info</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Service Plan</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenants.length > 0 ? tenants.map((tenant) => (
                  <tr key={tenant.id} className="group hover:bg-white/5 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{tenant.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{tenant.slug}.netaxis.io</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 uppercase tracking-widest">
                        {tenant.plan_name}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(tenant.status).replace('bg-', 'border-').replace('text-', 'text-')}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        href={`/superadmin/tenants/${tenant.id}`}
                        className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all inline-block"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Building2 size={48} className="text-slate-600" />
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Zero Instances Found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Center */}
        <div className="space-y-8">
          <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-wider px-2">Action Center</h2>
          <div className="glass-card p-4 space-y-3">
            {[
              { href: '/superadmin/tenants/new', label: 'Provision ISP', desc: 'Deploy new workspace', icon: Building2, color: 'text-primary' },
              { href: '/superadmin/plans', label: 'Market Plans', desc: 'Pricing & Tiers', icon: CreditCard, color: 'text-accent' },
              { href: '/superadmin/analytics', label: 'Growth Audit', desc: 'KPI Analysis', icon: TrendingUp, color: 'text-success' },
            ].map((action, i) => (
              <Link 
                key={i}
                href={action.href}
                className="flex items-center gap-5 p-5 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
              >
                <div className={`p-3.5 bg-white/5 rounded-2xl ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{action.label}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>

          <div className="relative group overflow-hidden rounded-[2.5rem] p-8 shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
            
            <div className="relative z-10 space-y-4">
              <h3 className="font-black text-2xl text-white tracking-tighter italic">Technical Support</h3>
              <p className="text-white/80 text-sm font-medium leading-relaxed">Dedicated concierge for infrastructure management.</p>
              <button className="w-full bg-white text-navy-950 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                Open Support Line
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
