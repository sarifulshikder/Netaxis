'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, Phone, Mail, MapPin, CreditCard, 
  Wifi, FileText, History, MessageSquare, Plus, 
  CheckCircle, AlertTriangle, Trash2, ExternalLink, Download
} from 'lucide-react'
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

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  
  // Tab Data
  const [connections, setConnections] = useState([])
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [tickets, setTickets] = useState([])
  const [history, setHistory] = useState([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch(`/customers/${id}`)
        setCustomer(res.data)
        
        // Load initial tab data (overview is default)
        const historyRes = await apiFetch(`/customers/${id}/history`)
        setHistory(historyRes.data || [])
      } catch (error) {
        console.error('Error fetching customer:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const loadTabData = async (tab: string) => {
    setActiveTab(tab)
    try {
      if (tab === 'connections' && connections.length === 0) {
        const res = await apiFetch(`/connections?customer_id=${id}`)
        setConnections(res.data || [])
      } else if (tab === 'invoices' && invoices.length === 0) {
        const res = await apiFetch(`/invoices?customer_id=${id}`)
        setInvoices(res.data || [])
      } else if (tab === 'payments' && payments.length === 0) {
        const res = await apiFetch(`/payments?customer_id=${id}`)
        setPayments(res.data || [])
      } else if (tab === 'tickets' && tickets.length === 0) {
        const res = await apiFetch(`/tickets?customer_id=${id}`)
        setTickets(res.data || [])
      }
    } catch (error) {
      console.error(`Error loading ${tab}:`, error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      await apiFetch(`/customers/${id}/history`, {
        method: 'POST',
        body: JSON.stringify({ event_type: 'note', description: newNote })
      })
      setNewNote('')
      const historyRes = await apiFetch(`/customers/${id}/history`)
      setHistory(historyRes.data || [])
    } catch (error) {
      alert('Failed to add note')
    }
  }

  if (loading) return <div className="text-[#f1f5f9]">Loading customer details...</div>
  if (!customer) return <div className="text-[#f1f5f9]">Customer not found</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#f1f5f9]">{customer.name}</h1>
              <span className="px-2 py-0.5 bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-mono rounded border border-[#0ea5e9]/20">
                #{customer.customer_code}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                {customer.status}
              </span>
            </div>
            <p className="text-[#94a3b8] text-sm mt-1">Customer since {formatDate(customer.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-xl text-sm font-medium hover:bg-[#334155] transition-all">
            Edit Profile
          </button>
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-[#0ea5e9] text-white rounded-xl text-sm font-medium hover:bg-[#0284c7] transition-all shadow-lg shadow-[#0ea5e9]/20">
            Quick Pay
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
          <p className="text-[#94a3b8] text-xs uppercase font-semibold">Total Invoiced</p>
          <p className="text-xl font-bold text-[#f1f5f9] mt-1">{formatCurrency(customer.total_invoiced || 0)}</p>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
          <p className="text-[#94a3b8] text-xs uppercase font-semibold">Total Paid</p>
          <p className="text-xl font-bold text-[#10b981] mt-1">{formatCurrency(customer.total_paid || 0)}</p>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
          <p className="text-[#94a3b8] text-xs uppercase font-semibold">Balance Due</p>
          <p className="text-xl font-bold text-[#ef4444] mt-1">{formatCurrency((customer.total_invoiced || 0) - (customer.total_paid || 0))}</p>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
          <p className="text-[#94a3b8] text-xs uppercase font-semibold">Wallet Balance</p>
          <p className="text-xl font-bold text-[#0ea5e9] mt-1">{formatCurrency(customer.wallet_balance || 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-1 border-b border-[#334155] overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'connections', label: 'Connections', icon: Wifi },
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'tickets', label: 'Tickets', icon: MessageSquare },
            { id: 'notes', label: 'History & Notes', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => loadTabData(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'text-[#0ea5e9] border-[#0ea5e9] bg-[#0ea5e9]/5' 
                  : 'text-[#94a3b8] border-transparent hover:text-[#f1f5f9] hover:bg-[#1e293b]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-6">
                <h3 className="text-lg font-semibold text-[#f1f5f9]">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[#94a3b8]">
                    <div className="p-2 bg-[#0f172a] rounded-lg"><Phone className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs">Phone Number</p>
                      <p className="text-[#f1f5f9] font-medium">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[#94a3b8]">
                    <div className="p-2 bg-[#0f172a] rounded-lg"><Mail className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs">Email Address</p>
                      <p className="text-[#f1f5f9] font-medium">{customer.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[#94a3b8]">
                    <div className="p-2 bg-[#0f172a] rounded-lg"><MapPin className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs">Service Address</p>
                      <p className="text-[#f1f5f9] font-medium">{customer.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-6">
                <h3 className="text-lg font-semibold text-[#f1f5f9]">Account Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-[#94a3b8] uppercase font-semibold">Zone</p>
                    <p className="text-[#f1f5f9] mt-1 font-medium">{customer.zone_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8] uppercase font-semibold">Customer Type</p>
                    <p className="text-[#f1f5f9] mt-1 font-medium capitalize">{customer.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8] uppercase font-semibold">National ID</p>
                    <p className="text-[#f1f5f9] mt-1 font-medium">{customer.nid || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8] uppercase font-semibold">Billing Cycle</p>
                    <p className="text-[#f1f5f9] mt-1 font-medium">Monthly (Day 1)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a] text-[#94a3b8] text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Service Type</th>
                    <th className="px-6 py-4">Package</th>
                    <th className="px-6 py-4">Username/IP</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {connections.length > 0 ? connections.map((conn: any) => (
                    <tr key={conn.id} className="hover:bg-[#334155]/30 transition-colors">
                      <td className="px-6 py-4 text-[#f1f5f9] font-medium uppercase">{conn.type}</td>
                      <td className="px-6 py-4 text-[#f1f5f9]">{conn.package_name}</td>
                      <td className="px-6 py-4">
                        <div className="text-[#f1f5f9] font-mono text-xs">{conn.username || conn.ip_address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conn.status)}`}>
                          {conn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#0ea5e9] hover:underline text-sm font-medium">Manage</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-[#94a3b8]">No active connections</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a] text-[#94a3b8] text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {invoices.length > 0 ? invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-[#334155]/30 transition-colors">
                      <td className="px-6 py-4 text-[#f1f5f9] font-mono text-sm">{inv.invoice_no}</td>
                      <td className="px-6 py-4 text-[#f1f5f9] font-bold">{formatCurrency(inv.total_amount)}</td>
                      <td className="px-6 py-4 text-[#94a3b8] text-sm">{formatDate(inv.due_date)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button className="text-[#94a3b8] hover:text-[#0ea5e9] transition-colors"><Download className="w-4 h-4" /></button>
                        <button className="text-[#0ea5e9] hover:underline text-sm font-medium">View</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-[#94a3b8]">No invoices found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
                  <h3 className="text-lg font-semibold text-[#f1f5f9] mb-4">Add Account Note</h3>
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#0ea5e9] transition-all h-32 resize-none"
                    placeholder="Type something important about this customer..."
                  ></textarea>
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={handleAddNote}
                      className="px-6 py-2.5 bg-[#0ea5e9] text-white rounded-xl text-sm font-medium hover:bg-[#0284c7] transition-all"
                    >
                      Post Note
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {history.map((event: any) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#1e293b] ${
                          event.event_type === 'note' ? 'bg-[#8b5cf6]' : 'bg-[#0ea5e9]'
                        }`}>
                          {event.event_type === 'note' ? <MessageSquare className="w-4 h-4 text-white" /> : <History className="w-4 h-4 text-white" />}
                        </div>
                        <div className="w-0.5 h-full bg-[#334155] my-1"></div>
                      </div>
                      <div className="flex-1 bg-[#1e293b] rounded-xl border border-[#334155] p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-[#0ea5e9] uppercase tracking-wider">{event.event_type}</p>
                          <p className="text-[10px] text-[#94a3b8]">{new Date(event.created_at).toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-[#f1f5f9]">{event.description}</p>
                        <p className="text-[10px] text-[#475569] mt-2">— Added by {event.created_by_name || 'System'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl border border-[#334155] p-6">
                  <h3 className="text-lg font-semibold text-[#f1f5f9] mb-4">Account Health</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#94a3b8]">Payment Reliability</span>
                        <span className="text-[#10b981]">92%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#10b981]" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#94a3b8]">Support Interaction</span>
                        <span className="text-[#f59e0b]">Low</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#f59e0b]" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Add other tab states if needed */}
          {(activeTab === 'payments' || activeTab === 'tickets') && (
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-12 text-center text-[#94a3b8]">
              <p>Content for {activeTab} will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
