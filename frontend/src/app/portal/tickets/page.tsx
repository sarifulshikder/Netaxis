'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  MessageSquare, Plus, Search, Filter, 
  ChevronRight, Clock, CheckCircle2, AlertCircle, 
  Send, HelpCircle, Tag
} from 'lucide-react'
import { formatDate, getStatusColor } from '@/lib/utils'
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

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Connection Issue',
    description: ''
  })

  const fetchTickets = async () => {
    try {
      const res = await apiFetch('/tickets') // Backend scopes this to the logged in user
      setTickets(res.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleSubmit = async () => {
    if (!formData.subject || !formData.description) {
      return toast.error('Please fill in all required fields')
    }

    setSubmitting(true)
    const loadId = toast.loading('Submitting your ticket...')
    try {
      await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      toast.success('Ticket submitted! We will get back to you soon.', { id: loadId })
      setFormData({ subject: '', category: 'Connection Issue', description: '' })
      fetchTickets()
    } catch (e) {
      toast.error('Failed to submit ticket', { id: loadId })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#94a3b8] text-sm animate-pulse">Loading your support history...</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Support Center</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Need help? Open a ticket and our team will assist you.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submit Ticket Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 shadow-xl sticky top-24">
            <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider mb-6 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0ea5e9]" /> New Support Request
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] mb-2 uppercase tracking-wider">Subject*</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-[#f1f5f9] text-sm focus:border-[#0ea5e9] outline-none transition-all"
                  placeholder="e.g. Internet is very slow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] mb-2 uppercase tracking-wider">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-[#f1f5f9] text-sm focus:border-[#0ea5e9] outline-none transition-all appearance-none"
                >
                  <option>Connection Issue</option>
                  <option>Billing</option>
                  <option>Speed</option>
                  <option>Router Configuration</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] mb-2 uppercase tracking-wider">Description*</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-[#f1f5f9] text-sm h-32 resize-none focus:border-[#0ea5e9] outline-none transition-all"
                  placeholder="Please provide as much detail as possible..."
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#334155] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#0ea5e9]/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? 'Submitting...' : 'Send Request'} <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* My Tickets List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#0ea5e9]" /> My Support History
          </h3>
          
          <div className="space-y-4">
            {tickets.length > 0 ? tickets.map((ticket: any) => (
              <Link 
                key={ticket.id}
                href={`/portal/tickets/${ticket.id}`}
                className="block bg-[#1e293b] rounded-2xl border border-[#334155] p-5 hover:border-[#0ea5e9]/50 hover:bg-[#1e293b]/80 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      ticket.status === 'open' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' : 
                      ticket.status === 'resolved' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#94a3b8]/10 text-[#94a3b8]'
                    }`}>
                      <Tag className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#475569] uppercase font-bold bg-[#0f172a] px-1.5 py-0.5 rounded border border-[#334155]">#{ticket.ticket_no}</span>
                        <h4 className="text-[#f1f5f9] font-bold group-hover:text-[#0ea5e9] transition-colors">{ticket.subject}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className="text-[10px] text-[#475569] font-bold uppercase tracking-tighter flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDate(ticket.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#334155] group-hover:text-[#0ea5e9] transition-all" />
                </div>
              </Link>
            )) : (
              <div className="bg-[#1e293b] rounded-2xl border border-[#334155] border-dashed p-20 text-center space-y-4">
                <HelpCircle className="w-12 h-12 text-[#334155] mx-auto" />
                <div className="max-w-xs mx-auto">
                  <h4 className="text-[#f1f5f9] font-bold">No tickets found</h4>
                  <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                    You haven't opened any support requests yet. If you have any issues, use the form on the left.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* FAQ/Help section */}
          <div className="bg-gradient-to-br from-[#0ea5e9]/5 to-transparent rounded-2xl border border-[#0ea5e9]/10 p-6 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#f1f5f9]">Common Solutions</h4>
              <p className="text-[10px] text-[#94a3b8]">Check our quick troubleshooting guides before opening a ticket.</p>
            </div>
            <button className="px-4 py-2 bg-[#1e293b] border border-[#334155] text-[#0ea5e9] text-[10px] font-bold uppercase rounded-lg hover:bg-[#334155] transition-all">Browse FAQ</button>
          </div>
        </div>
      </div>
    </div>
  )
}
