'use client'
import { useEffect, useState } from 'react'
import { Plus, BookOpen, Landmark, Receipt, List, Calendar, Search, Filter, Trash2, Edit2, X, ArrowUpRight, ArrowDownRight, Check, PieChart, FileText } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import StatsCard from '@/components/ui/StatsCard'

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState('journal')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  
  const tabs = [
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'accounts', label: 'COA', icon: List },
    { id: 'banking', label: 'Banking', icon: Landmark },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
  ]

  const loadData = async (tab: string) => {
    setLoading(true)
    try {
      let endpoint = '/journal-entries'
      if (tab === 'accounts') endpoint = '/accounts'
      else if (tab === 'banking') endpoint = '/bank-accounts'
      else if (tab === 'expenses') endpoint = '/expenses'
      
      const res = await api.get(endpoint)
      setData(res.data?.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(activeTab)
  }, [activeTab])

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Finance & Ledger</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Monitor cash flow, manage expenses and chart of accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2">
            <PieChart size={18} />
            <span>P&L Statement</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> 
            <span>{activeTab === 'journal' ? 'New Entry' : activeTab === 'accounts' ? 'Add Account' : activeTab === 'banking' ? 'Link Bank' : 'Record Expense'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Assets" value={450000} icon={Landmark} color="bg-primary" currency />
        <StatsCard title="Revenue (MTD)" value={125000} icon={ArrowUpRight} color="bg-emerald-500" currency />
        <StatsCard title="Expenses (MTD)" value={42000} icon={ArrowDownRight} color="bg-rose-500" currency />
        <StatsCard title="Net Profit" value={83000} icon={PieChart} color="bg-indigo-500" currency />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {activeTab === 'journal' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Reference</th>
                  <th className="px-6 py-5">Description</th>
                  <th className="px-6 py-5 text-right">Debit</th>
                  <th className="px-6 py-5 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center"><LoadingSpinner /></td></tr>
                ) : data.length > 0 ? data.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{formatDate(entry.date)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-mono font-bold text-primary">
                        {entry.reference_no}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 group-hover:text-slate-300 transition-colors">{entry.description}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-white">{entry.debit > 0 ? formatCurrency(entry.debit) : '—'}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-white">{entry.credit > 0 ? formatCurrency(entry.credit) : '—'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <FileText size={48} />
                        <p className="text-sm font-bold uppercase tracking-widest">No entries recorded</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Assets
                </h3>
                <div className="space-y-3">
                  {data.filter(a => a.type === 'asset').map((acc: any) => (
                    <div key={acc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="text-[10px] font-mono font-bold bg-white/10 px-2 py-1 rounded text-slate-400 group-hover:text-white">{acc.code}</div>
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white">{acc.name}</span>
                      </div>
                      <span className="text-sm font-black text-emerald-400">{formatCurrency(acc.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Liabilities
                </h3>
                <div className="space-y-3">
                  {data.filter(a => a.type === 'liability').map((acc: any) => (
                    <div key={acc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="text-[10px] font-mono font-bold bg-white/10 px-2 py-1 rounded text-slate-400 group-hover:text-white">{acc.code}</div>
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white">{acc.name}</span>
                      </div>
                      <span className="text-sm font-black text-rose-400">{formatCurrency(acc.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
