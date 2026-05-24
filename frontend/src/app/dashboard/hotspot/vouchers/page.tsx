'use client'
import { useEffect, useState } from 'react'
import { Plus, Wifi, Ticket, Printer, Search, Filter, Trash2, Download, AlertCircle, CheckCircle2 } from 'lucide-react'
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

export default function HotspotVouchersPage() {
  const [vouchers, setVouchers] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  
  // Generation Form
  const [genData, setGenData] = useState({
    profile_id: '',
    quantity: 10,
    batch_name: `BATCH-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${new Date().getHours()}`
  })

  const fetchData = async () => {
    try {
      const [vouchersRes, profilesRes] = await Promise.all([
        apiFetch('/hotspot/vouchers'),
        apiFetch('/hotspot/profiles')
      ])
      setVouchers(vouchersRes.data || [])
      setProfiles(profilesRes.data || [])
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleGenerate = async () => {
    if (!genData.profile_id) return alert('Please select a profile')
    setGenerating(true)
    try {
      await apiFetch('/hotspot/vouchers/generate', {
        method: 'POST',
        body: JSON.stringify(genData)
      })
      alert('Vouchers generated successfully!')
      fetchData()
    } catch (e) {
      alert('Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handlePrintBatch = (batchName: string) => {
    window.open(`${API}/hotspot/vouchers/print?batch=${batchName}&token=${getToken()}`, '_blank')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Hotspot Vouchers</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Generate and manage prepaid internet access codes</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#1e293b] border border-[#334155] text-[#f1f5f9] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#334155] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Generation Form Card */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 shadow-xl">
        <h2 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider mb-6 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-[#0ea5e9]" /> Quick Voucher Generator
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] mb-2 uppercase">Profile / Plan</label>
            <select 
              value={genData.profile_id}
              onChange={(e) => setGenData({...genData, profile_id: e.target.value})}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-[#f1f5f9] text-sm focus:border-[#0ea5e9] outline-none transition-colors"
            >
              <option value="">Select Profile</option>
              {profiles.map((p: any) => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] mb-2 uppercase">Quantity</label>
            <input 
              type="number" 
              value={genData.quantity}
              onChange={(e) => setGenData({...genData, quantity: Number(e.target.value)})}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-[#f1f5f9] text-sm focus:border-[#0ea5e9] outline-none transition-colors"
              min="1" max="500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] mb-2 uppercase">Batch Name</label>
            <input 
              type="text" 
              value={genData.batch_name}
              onChange={(e) => setGenData({...genData, batch_name: e.target.value})}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-[#f1f5f9] text-sm focus:border-[#0ea5e9] outline-none transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-[#0ea5e9]/20"
            >
              {generating ? 'Generating...' : 'Generate Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
        <div className="p-4 border-b border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
            <input 
              type="text" 
              placeholder="Search by code or batch..." 
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-sm text-[#f1f5f9] outline-none focus:border-[#0ea5e9]" 
            />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"><Filter className="w-4 h-4" /></button>
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-[#94a3b8] text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Voucher Code</th>
              <th className="px-6 py-4">Batch</th>
              <th className="px-6 py-4">Profile</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Used By</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-[#94a3b8]">Loading vouchers...</td></tr>
            ) : vouchers.length > 0 ? vouchers.map((v: any) => (
              <tr key={v.id} className="hover:bg-[#334155]/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#0f172a] rounded text-[#0ea5e9]"><Ticket className="w-4 h-4" /></div>
                    <span className="font-mono font-bold text-[#f1f5f9] tracking-wider">{v.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#94a3b8] text-xs">{v.batch_name}</td>
                <td className="px-6 py-4 text-[#f1f5f9] text-sm font-medium">{v.profile_name}</td>
                <td className="px-6 py-4 text-[#f1f5f9] font-bold">{formatCurrency(v.price)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    v.status === 'unused' ? 'bg-[#10b981]/10 text-[#10b981]' : 
                    v.status === 'used' ? 'bg-[#94a3b8]/10 text-[#94a3b8]' : 'bg-[#ef4444]/10 text-[#ef4444]'
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {v.used_by ? (
                    <div className="text-xs">
                      <p className="text-[#f1f5f9]">{v.used_by}</p>
                      <p className="text-[#475569]">{formatDate(v.used_at)}</p>
                    </div>
                  ) : <span className="text-[#475569] text-xs">—</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handlePrintBatch(v.batch_name)}
                      className="p-2 text-[#94a3b8] hover:text-[#0ea5e9] transition-colors" title="Print Batch"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-[#94a3b8] hover:text-[#ef4444] transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-[#94a3b8]">No vouchers found in your account</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 border border-[#334155] flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-[#f1f5f9]">Need Custom Design?</h3>
            <p className="text-xs text-[#94a3b8]">Create your own voucher card template with your branding.</p>
          </div>
          <button className="bg-[#0ea5e9] text-white px-4 py-2 rounded-lg text-xs font-bold">Template Editor</button>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-[#334155] flex items-center gap-4">
          <div className="p-3 bg-[#f59e0b]/10 rounded-xl text-[#f59e0b]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[#f1f5f9]">Security Notice</h3>
            <p className="text-xs text-[#94a3b8]">Never share your batch PDF files with unauthorized staff.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
