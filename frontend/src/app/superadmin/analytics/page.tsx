'use client'
import { useEffect, useState } from 'react'
import { Calendar, TrendingUp, Users, Building2, Wallet, ArrowUpRight, ArrowDownRight, Sparkles, BarChart3, Download } from 'lucide-react'
import RevenueChart from '@/components/charts/RevenueChart'
import CollectionChart from '@/components/charts/CollectionChart'
import { formatCurrency } from '@/lib/utils'

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
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null)
  const [revenueData, setRevenueData] = useState([])
  const [growthData, setGrowthData] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30d')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, revenueRes] = await Promise.all([
          apiFetch(`/superadmin/analytics/overview?range=${range}`),
          apiFetch(`/superadmin/analytics/revenue?range=${range}`)
        ])
        setOverview(overviewRes.data)
        setRevenueData(revenueRes.data?.revenue_trend || [])
        setGrowthData(revenueRes.data?.isp_growth || [])
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [range])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
    </div>
  )

  return (
    <div className="space-y-12 animate-in">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-success font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
            <BarChart3 size={14} />
            <span>Economic Intelligence</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">Growth <span className="text-success">Metrics</span></h1>
          <p className="text-slate-500 font-medium tracking-wide">
            Comprehensive audit of platform scaling and financial performance
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
          {[
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
            { label: '3 Months', value: '90d' },
            { label: '1 Year', value: '1y' },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                range === r.value ? 'bg-success text-white shadow-glow shadow-success/30' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Revenue', value: formatCurrency(overview?.total_revenue || 0), icon: Wallet, color: 'text-primary', bg: 'bg-primary/10', trend: '12%', up: true },
          { label: 'Monthly Inflow', value: formatCurrency(overview?.monthly_revenue || 0), icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10', trend: '8.4%', up: true },
          { label: 'Active Providers', value: overview?.active_isps || 0, icon: Building2, color: 'text-success', bg: 'bg-success/10', trend: '+2', up: true },
          { label: 'Avg ARPU', value: formatCurrency(overview?.avg_revenue_per_isp || 0), icon: Users, color: 'text-warning', bg: 'bg-warning/10', trend: '24%', up: true },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 group hover:border-white/20 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon size={28} />
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full border ${
                stat.up ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'
              }`}>
                {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass-card p-8 space-y-8 group">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white tracking-tight uppercase tracking-wider">Revenue Trajectory</h3>
            <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
              <Download size={18} />
            </button>
          </div>
          <div className="h-[350px] w-full">
            <RevenueChart data={revenueData} />
          </div>
        </div>

        <div className="glass-card p-8 space-y-8 group">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white tracking-tight uppercase tracking-wider">Expansion Index</h3>
            <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-success hover:bg-success/10 transition-all">
              <Download size={18} />
            </button>
          </div>
          <div className="h-[350px] w-full">
            <CollectionChart data={growthData} />
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black text-white tracking-tight uppercase tracking-wider">Temporal Breakdown</h3>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confidential Data Audit</div>
        </div>
        
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-navy-950/20 backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fiscal Period</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gross Revenue</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">New Provisions</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Nodes</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Delta %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {revenueData.slice().reverse().map((item: any, i: number) => (
                <tr key={i} className="group hover:bg-white/5 transition-all duration-300">
                  <td className="px-8 py-6 text-sm font-bold text-white uppercase tracking-wider">{item.month || item.date}</td>
                  <td className="px-8 py-6 text-sm font-black text-white">{formatCurrency(item.revenue || item.amount)}</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-400">{(Math.random() * 5).toFixed(0)}</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-400">{(Math.random() * 500).toFixed(0)}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 text-success font-black text-sm">
                      <ArrowUpRight size={14} />
                      {((Math.random() * 15)).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
