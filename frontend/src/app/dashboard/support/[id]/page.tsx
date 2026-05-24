'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, MessageSquare, User, Clock, AlertCircle, 
  Send, MoreVertical, CheckCircle, XCircle, UserPlus, Tag
} from 'lucide-react'
import { formatDateTime, getStatusColor } from '@/lib/utils'

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

export default function TicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [ticketRes, staffRes] = await Promise.all([
        apiFetch(`/tickets/${id}`),
        apiFetch('/staff')
      ])
      setTicket(ticketRes.data)
      setComments(ticketRes.data?.comments || [])
      setStaff(staffRes.data || [])
    } catch (error) {
      console.error('Error fetching ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      const res = await apiFetch(`/tickets/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment })
      })
      setComments([...comments, res.data])
      setNewComment('')
    } catch (e) {
      alert('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    try {
      await apiFetch(`/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      fetchData()
    } catch (e) {
      alert('Failed to update status')
    }
  }

  const handleAssign = async (staffId: string) => {
    try {
      await apiFetch(`/tickets/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assigned_to: staffId })
      })
      fetchData()
    } catch (e) {
      alert('Failed to assign staff')
    }
  }

  if (loading) return <div className="text-[#f1f5f9]">Loading ticket...</div>
  if (!ticket) return <div className="text-[#f1f5f9]">Ticket not found</div>

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
              <span className="px-2 py-0.5 bg-[#334155] text-[#94a3b8] text-xs font-mono rounded border border-[#475569]">
                #{ticket.ticket_no}
              </span>
              <h1 className="text-xl font-bold text-[#f1f5f9]">{ticket.subject}</h1>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                ticket.priority === 'high' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 
                ticket.priority === 'medium' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#10b981]/10 text-[#10b981]'
              }`}>
                {ticket.priority} Priority
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            onChange={(e) => handleAssign(e.target.value)}
            value={ticket.assigned_to || ''}
            className="bg-[#1e293b] border border-[#334155] text-[#f1f5f9] text-sm rounded-xl px-4 py-2.5 focus:border-[#0ea5e9] outline-none transition-all"
          >
            <option value="">Unassigned</option>
            {staff.map((s: any) => <option key={s.id} value={s.id}>Assign: {s.name}</option>)}
          </select>
          <button 
            onClick={() => handleUpdateStatus('resolved')}
            className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#10b981]/20"
          >
            <CheckCircle className="w-4 h-4" /> Resolve
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col h-[700px] bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
          <div className="p-4 border-b border-[#334155] bg-[#0f172a]/30 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#f1f5f9] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0ea5e9]" /> Conversation Thread
            </h3>
            <span className="text-[10px] text-[#475569] font-bold uppercase">SLA: {ticket.sla_status || 'Within Time'}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#334155]">
            {/* Initial Problem Description */}
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#334155] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <div className="space-y-1 max-w-[85%]">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#f1f5f9]">{ticket.customer_name}</span>
                  <span className="text-[10px] text-[#475569]">{formatDateTime(ticket.created_at)}</span>
                </div>
                <div className="bg-[#0f172a] p-4 rounded-2xl rounded-tl-none border border-[#334155] text-[#f1f5f9] text-sm">
                  {ticket.description}
                </div>
              </div>
            </div>

            {/* Comments */}
            {comments.map((comment, i) => {
              const isStaff = comment.sender_type === 'staff'
              return (
                <div key={i} className={`flex gap-4 ${isStaff ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isStaff ? 'bg-[#0ea5e9]' : 'bg-[#334155]'}`}>
                    <User className={`w-5 h-5 ${isStaff ? 'text-white' : 'text-[#94a3b8]'}`} />
                  </div>
                  <div className={`space-y-1 max-w-[85%] ${isStaff ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-3 ${isStaff ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm font-bold text-[#f1f5f9]">{comment.sender_name}</span>
                      <span className="text-[10px] text-[#475569]">{formatDateTime(comment.created_at)}</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-sm ${
                      isStaff 
                        ? 'bg-[#0ea5e9] text-white rounded-tr-none' 
                        : 'bg-[#0f172a] text-[#f1f5f9] rounded-tl-none border border-[#334155]'
                    }`}>
                      {comment.content}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-4 bg-[#0f172a]/50 border-t border-[#334155]">
            <div className="relative">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); }}}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl pl-4 pr-14 py-3 text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#0ea5e9] transition-all h-20 resize-none"
                placeholder="Type your response here..."
              />
              <button 
                onClick={handleAddComment}
                disabled={submitting || !newComment.trim()}
                className="absolute right-2 bottom-2 p-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 text-white rounded-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-4 px-2">
              <button className="text-[10px] font-bold text-[#475569] hover:text-[#0ea5e9] transition-colors flex items-center gap-1">
                <Tag className="w-3 h-3" /> Canned Response
              </button>
              <button className="text-[10px] font-bold text-[#475569] hover:text-[#0ea5e9] transition-colors flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Internal Note
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
            <div className="p-4 bg-[#0f172a]/30 border-b border-[#334155]">
              <h3 className="text-xs font-bold text-[#f1f5f9] uppercase tracking-wider">Ticket Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] text-[#475569] font-bold uppercase mb-1">Customer</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#334155] rounded-lg flex items-center justify-center text-[#94a3b8] text-xs font-bold">
                    {ticket.customer_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#f1f5f9]">{ticket.customer_name}</p>
                    <p className="text-[10px] text-[#0ea5e9] hover:underline cursor-pointer">View Customer Profile</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] text-[#475569] font-bold uppercase mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[#475569] font-bold uppercase mb-1">Priority</p>
                  <span className="text-sm font-bold text-[#f1f5f9] capitalize">{ticket.priority}</span>
                </div>
                <div>
                  <p className="text-[10px] text-[#475569] font-bold uppercase mb-1">Assigned To</p>
                  <p className="text-sm font-bold text-[#f1f5f9]">{ticket.assigned_to_name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#475569] font-bold uppercase mb-1">Category</p>
                  <p className="text-sm font-bold text-[#f1f5f9]">{ticket.category || 'General'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-[#334155]">
                <div className="flex items-center gap-2 text-[#94a3b8] text-xs mb-3">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Created: {formatDateTime(ticket.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-[#94a3b8] text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated: {formatDateTime(ticket.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl border border-[#334155] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#f59e0b]" /> Quick Actions
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => handleUpdateStatus('pending')}
                className="w-full text-left px-4 py-2.5 rounded-xl bg-[#0f172a]/50 text-[#f1f5f9] text-xs font-bold border border-[#334155] hover:border-[#0ea5e9] transition-all"
              >
                Move to Pending
              </button>
              <button 
                onClick={() => handleUpdateStatus('closed')}
                className="w-full text-left px-4 py-2.5 rounded-xl bg-[#0f172a]/50 text-[#f1f5f9] text-xs font-bold border border-[#334155] hover:border-[#ef4444] transition-all"
              >
                Close Ticket
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-xl bg-[#0f172a]/50 text-[#f1f5f9] text-xs font-bold border border-[#334155] hover:border-[#8b5cf6] transition-all">
                Transfer to Department
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
