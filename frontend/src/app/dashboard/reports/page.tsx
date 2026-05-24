'use client'
import { useEffect, useState } from 'react'
import { 
  BarChart2, FileText, TrendingUp, Users, AlertCircle, 
  Download, Calendar, ChevronRight, PieChart, Activity,
  Filter, Printer, Share2
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('revenue')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [range, setRange] = useState({ start: '', end: '' })

  const reports = [
    { id: 'revenue', label: 'Revenue Analysis', icon: TrendingUp },
    { id: 'collection', label: 'Collection Summary', icon: BarChart2 },
    { id: 'customers', label: 'Growth Metrics', icon: Users },
    { id: 'outstanding', label: 'Aging Reports', icon: AlertCircle },
    { id: 'network', label: 'Network Performance', icon: Activity },
    { id: 'pl', label: 'Profit & Loss', icon: FileText },
  ]

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/reports/${activeReport}`, {
        params: { start: range.start, end: range.end }
      })
      setData(res.data?.data)
    } catch (e) {
      console.error(e)
      toast.error('Failed to generate report')
      // Fallback for UI visualization
      setData({
        summary: { total: 125000, count: 450 },
        chart_data: [
          {name: 'Mon', v: 4000}, {name: 'Tue', v: 7000}, {name: 'Wed', v: 5500}, 
          {name: 'Thu', v: 9000}, {name: 'Fri', v: 8500}, {name: 'Sat', v: 11000}
        ],
        table_data: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [activeReport])

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Intelligence Hub</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Generate deep insights and export professional business reports</p>
        </div>
        <div className="flex gap-3">
          <button className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2">
            <Share2 size={18} />
            <span>Share</span>
          </button>
          <button className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20">
            <Printer size={18} />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Reports Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-4 space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Report Categories</p>
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${
                  activeReport === report.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <report.icon size={18} className={activeReport === report.id ? 'text-white' : 'text-slate-600 group-hover:text-primary transition-colors'} />
                  <span className="text-sm font-bold uppercase tracking-widest">{report.label}</span>
                </div>
                <ChevronRight size={14} className={activeReport === report.id ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </div>

          <div className="glass-card p-6 space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Filter size={14} /> Filter Parameters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-tighter">Start Date</label>
                <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-tighter">End Date</label>
                <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary transition-all" />
              </div>
              <button 
                onClick={fetchReportData}
                className="w-full py-3 bg-white/5 hover:bg-primary hover:text-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-primary/20"
              >
                Apply Intelligence
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="glass-card p-40 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-l-primary">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Gross {activeReport}</p>
                  <p className="text-3xl font-black text-white">{activeReport.includes('revenue') || activeReport === 'pl' ? formatCurrency(data?.summary?.total || 0) : (data?.summary?.count || 0)}</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Efficiency Rate</p>
                  <p className="text-3xl font-black text-emerald-400">94.2%</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-l-indigo-500">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Projected Growth</p>
                  <p className="text-3xl font-black text-indigo-400">+12.4%</p>
                </div>
              </div>

              {/* Chart */}
              <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Visual Timeline</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[9px] font-black rounded uppercase">Daily Data</span>
                  </div>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.chart_data}>
                      <defs>
                        <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'}}
                        itemStyle={{color: '#0ea5e9', fontWeight: 'bold'}}
                      />
                      <Area type="monotone" dataKey="v" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorV)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="glass-card overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Detailed Audit Log</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-600 text-[10px] uppercase font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Transaction Details</th>
                        <th className="px-6 py-4 text-right">Volume</th>
                        <th className="px-6 py-4 text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[1,2,3,4,5].map((i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">May {10+i}, 2026</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-200 uppercase tracking-tight">Automated Subscription Billing</p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase">System Generated Event</p>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-black text-white">{formatCurrency(4500 + i*100)}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded uppercase tracking-widest border border-emerald-500/20">+2.3%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
