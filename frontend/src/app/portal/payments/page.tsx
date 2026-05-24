'use client'
import { useEffect, useState } from 'react'
import { 
  CreditCard, Wallet, Smartphone, ShieldCheck, 
  ArrowRight, CheckCircle, Lock, Landmark, 
  Receipt, Clock, Plus, History, Download
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import toast from 'react-hot-toast'

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

export default function CustomerPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [dueAmount, setDueAmount] = useState(0)
  const [payments, setPayments] = useState([])
  const [selectedMethod, setSelectedMethod] = useState('bkash')
  const [processing, setProcessing] = useState(false)

  const fetchData = async () => {
    try {
      const [invoicesRes, paymentsRes] = await Promise.all([
        apiFetch('/invoices'),
        apiFetch('/payments')
      ])
      
      const unpaid = invoicesRes.data?.filter((inv: any) => inv.status === 'unpaid' || inv.status === 'overdue')
        .reduce((acc: number, inv: any) => acc + inv.total_amount, 0) || 0
      
      setDueAmount(unpaid)
      setPayments(paymentsRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePayment = async () => {
    if (dueAmount <= 0) return toast.error('No outstanding balance to pay')
    
    setProcessing(true)
    const loadId = toast.loading('Connecting to gateway...')
    try {
      await apiFetch('/payments', {
        method: 'POST',
        body: JSON.stringify({
          amount: dueAmount,
          method: selectedMethod,
          reference: 'Portal Payment'
        })
      })
      toast.success('Payment recorded successfully!', { id: loadId })
      fetchData()
    } catch (e) {
      toast.error('Payment failed', { id: loadId })
    } finally {
      setProcessing(false)
    }
  }

  const methods = [
    { id: 'bkash', name: 'bKash', icon: Smartphone, color: 'bg-[#d12053]', light: 'bg-[#d12053]/10', border: 'border-[#d12053]' },
    { id: 'nagad', name: 'Nagad', icon: Smartphone, color: 'bg-[#f7941d]', light: 'bg-[#f7941d]/10', border: 'border-[#f7941d]' },
    { id: 'rocket', name: 'Rocket', icon: Smartphone, color: 'bg-[#8b5cf6]', light: 'bg-[#8b5cf6]/10', border: 'border-[#8b5cf6]' },
    { id: 'bank', name: 'Bank Transfer', icon: Landmark, color: 'bg-[#0ea5e9]', light: 'bg-[#0ea5e9]/10', border: 'border-[#0ea5e9]' },
    { id: 'cash', name: 'Cash', icon: Wallet, color: 'bg-[#475569]', light: 'bg-[#475569]/10', border: 'border-[#475569]' },
  ]

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#94a3b8] text-sm animate-pulse">Loading billing and history...</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Billing & Payments</h1>
        <p className="text-[#94a3b8] text-sm mt-1">Clear your balance and view payment history</p>
      </div>

      {/* Top Due Card */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <p className="text-[#94a3b8] text-xs font-bold uppercase tracking-widest mb-1">Current Outstanding</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-bold text-[#f1f5f9]">{formatCurrency(dueAmount)}</h2>
            {dueAmount > 0 && <span className="text-xs bg-[#ef4444] text-white px-2 py-1 rounded font-bold animate-bounce">DUE</span>}
          </div>
        </div>
        
        <div className="w-full md:w-auto relative z-10">
          <button 
            onClick={handlePayment}
            disabled={processing || dueAmount <= 0}
            className="w-full md:px-12 py-4 bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#334155] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0ea5e9]/20 flex items-center justify-center gap-2 text-lg"
          >
            {processing ? 'Processing...' : 'Pay Now'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 bg-[#0ea5e9]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0ea5e9]" /> Select Method
          </h3>
          <div className="space-y-3">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  selectedMethod === method.id 
                    ? `${method.border} ${method.light} shadow-lg` 
                    : 'bg-[#1e293b] border-[#334155] hover:border-[#475569]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${method.color} text-white`}>
                    <method.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-[#f1f5f9]">{method.name}</span>
                </div>
                {selectedMethod === method.id && <CheckCircle className={`w-5 h-5 ${method.id === 'cash' ? 'text-[#94a3b8]' : 'text-inherit'}`} style={{ color: method.id !== 'cash' ? method.color.split('[')[1].split(']')[0] : '' }} />}
              </button>
            ))}
          </div>

          <div className="bg-[#0f172a] rounded-2xl border border-[#334155] border-dashed p-6 flex items-start gap-4">
            <Lock className="w-5 h-5 text-[#475569] mt-1" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#f1f5f9]">Secure Gateway</p>
              <p className="text-[10px] text-[#475569] leading-relaxed">
                Transactions are encrypted. Your internet service will be resumed automatically after payment.
              </p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-[#0ea5e9]" /> Recent Payments
          </h3>
          
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#0f172a] text-[#94a3b8] text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {payments.length > 0 ? payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#334155]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#f1f5f9] font-medium">{formatDate(p.payment_date || p.created_at)}</div>
                      <div className="text-[10px] text-[#475569]">{new Date(p.payment_date || p.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-[#10b981]">{formatCurrency(p.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#0f172a] rounded text-[10px] font-bold text-[#94a3b8] uppercase border border-[#334155]">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#94a3b8] font-mono">{p.reference || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-[#94a3b8] hover:text-[#0ea5e9] transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#94a3b8]">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="w-8 h-8 opacity-20" />
                        <p>No payment records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
