'use client'
import { useEffect, useState } from 'react'
import { FileText, Download, AlertCircle, CheckCircle, CreditCard, Clock } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

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

export default function CustomerBillsPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await apiFetch('/invoices') // Backend scopes this to the logged in user
        setInvoices(res.data || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const totalDue = invoices
    .filter((inv: any) => inv.status === 'unpaid' || inv.status === 'overdue')
    .reduce((acc, inv: any) => acc + inv.total_amount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">My Billing History</h1>
        <p className="text-[#94a3b8] text-sm mt-1">View and download your monthly internet invoices</p>
      </div>

      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#ef4444]/20 to-[#0f172a] p-6 rounded-2xl border border-[#ef4444]/30">
          <p className="text-[#94a3b8] text-xs font-bold uppercase mb-1">Total Outstanding</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-[#ef4444]">{formatCurrency(totalDue)}</p>
            {totalDue > 0 && <span className="text-[10px] bg-[#ef4444] text-white px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Action Required</span>}
          </div>
        </div>
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-[#334155]">
          <p className="text-[#94a3b8] text-xs font-bold uppercase mb-1">Active Package</p>
          <p className="text-xl font-bold text-[#f1f5f9]">Home Premium 20M</p>
          <p className="text-xs text-[#0ea5e9] font-medium mt-1">Next Bill: June 01, 2026</p>
        </div>
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-[#334155] flex flex-col justify-center">
          <button className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#0ea5e9]/20 flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" /> Pay Now
          </button>
        </div>
      </div>

      {/* Bills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-[#94a3b8]">Loading your billing records...</div>
        ) : invoices.length > 0 ? invoices.map((inv: any) => (
          <div 
            key={inv.id} 
            className={`bg-[#1e293b] p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
              inv.status === 'overdue' ? 'border-[#ef4444] shadow-lg shadow-[#ef4444]/10' : 'border-[#334155]'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-[#0f172a] rounded-xl text-[#0ea5e9]">
                <FileText className="w-6 h-6" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(inv.status)}`}>
                {inv.status}
              </span>
            </div>

            <div className="space-y-1 mb-6">
              <p className="text-[#94a3b8] text-xs font-medium uppercase">{new Date(inv.created_at).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}</p>
              <p className="text-2xl font-bold text-[#f1f5f9]">{formatCurrency(inv.total_amount)}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-[#475569] font-bold">
                <Clock className="w-3 h-3" /> DUE: {formatDate(inv.due_date)}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-[#334155]">
              <button className="flex-1 py-2 bg-[#334155] hover:bg-[#475569] text-[#f1f5f9] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              {inv.status !== 'paid' && (
                <button className="flex-1 py-2 bg-[#0ea5e9]/10 hover:bg-[#0ea5e9] text-[#0ea5e9] hover:text-white rounded-lg text-xs font-bold transition-all">
                  Pay Bill
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 bg-[#1e293b] rounded-2xl border border-[#334155] border-dashed flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-[#334155] rounded-full text-[#94a3b8]">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-[#f1f5f9] font-bold">No bills found</h3>
              <p className="text-[#94a3b8] text-sm mt-1">You are all caught up! No invoices have been generated for your account yet.</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Methods Info */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#334155] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#10b981]/10 rounded-xl text-[#10b981]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[#f1f5f9] font-bold">Automatic Payments</h4>
            <p className="text-xs text-[#94a3b8]">Save your card or bKash for hassle-free monthly auto-debit.</p>
          </div>
        </div>
        <button className="bg-[#1e293b] border border-[#334155] text-[#f1f5f9] px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#334155] transition-all">
          Manage Auto-Pay
        </button>
      </div>
    </div>
  )
}
