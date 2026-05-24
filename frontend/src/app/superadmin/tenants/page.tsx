'use client'
import { useEffect, useState } from 'react'
import { Plus, Search, Filter, X, Building2, User, Mail, Phone, MapPin, CheckCircle, AlertTriangle, Trash2, Eye, Sparkles, Globe, Shield } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import Modal from '@/components/ui/Modal'

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

interface Tenant {
  id: string
  name: string
  slug: string
  owner_email: string
  owner_phone: string
  address: string
  plan_id: string
  plan_name: string
  status: string
  customers_count: number
  created_at: string
}

interface Plan {
  id: string
  name: string
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    owner_email: '',
    owner_phone: '',
    address: '',
    plan_id: '',
    admin_password: 'Password123!' 
  })

  const fetchData = async () => {
    try {
      const [tenantsRes, plansRes] = await Promise.all([
        apiFetch('/superadmin/tenants'),
        apiFetch('/superadmin/plans')
      ])
      setTenants(tenantsRes.data || [])
      setPlans(plansRes.data || [])
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.owner_email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || t.status === filter
    return matchesSearch && matchesFilter
  })

  const handleCreateTenant = async () => {
    if (!formData.name || !formData.owner_email || !formData.plan_id) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      await apiFetch('/superadmin/tenants', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-')
        })
      })
      setShowModal(false)
      fetchData()
      setFormData({ name: '', owner_email: '', owner_phone: '', address: '', plan_id: '', admin_password: 'Password123!' })
    } catch (error) {
      alert('Failed to create tenant')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'suspend' : 'activate'
    try {
      await apiFetch(`/superadmin/tenants/${id}/${action}`, { method: 'POST' })
      fetchData()
    } catch (error) {
      alert(`Failed to ${action} tenant`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ISP? This action cannot be undone.')) return
    try {
      await apiFetch(`/superadmin/tenants/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      alert('Failed to delete tenant')
    }
  }

  return (
    <div className="space-y-10 animate-in">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
            <Globe size={14} />
            <span>Multi-Tenant Network</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">ISP <span className="text-primary">Registry</span></h1>
          <p className="text-slate-500 font-medium tracking-wide">
            Infrastructure management for registered service providers
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 px-6 py-3.5 shadow-xl"
        >
          <Plus size={18} /> 
          <span className="font-bold">Register New ISP</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-[450px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by ISP name, slug, or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium" 
          />
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
          {['all', 'active', 'trial', 'suspended'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                filter === f ? 'bg-primary text-white shadow-glow shadow-primary/30' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Table */}
      <div className="overflow-hidden rounded-3xl border border-white/5 bg-navy-950/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Provider Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contact Node</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Service Plan</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Node Count</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div></td></tr>
              ) : filteredTenants.length > 0 ? filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="group hover:bg-white/5 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="font-bold text-white group-hover:text-primary transition-colors text-base tracking-tight">{tenant.name}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider flex items-center gap-1.5">
                      <Globe size={10} />
                      {tenant.slug}.netaxis.io
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-semibold text-white">{tenant.owner_email}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{tenant.owner_phone}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black border border-accent/20 uppercase tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                      {tenant.plan_name}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(tenant.status).replace('bg-', 'border-').replace('text-', 'text-')}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-white bg-white/5 w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 group-hover:border-primary/20 transition-all">
                      {tenant.customers_count || 0}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all"><Eye className="w-4.5 h-4.5" /></button>
                      <button 
                        onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                        className={`p-2.5 rounded-xl bg-white/5 border border-transparent transition-all ${tenant.status === 'active' ? 'text-warning hover:text-warning hover:bg-warning/10 hover:border-warning/20' : 'text-success hover:text-success hover:bg-success/10 hover:border-success/20'}`}
                      >
                        {tenant.status === 'active' ? <AlertTriangle className="w-4.5 h-4.5" /> : <CheckCircle className="w-4.5 h-4.5" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(tenant.id)}
                        className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all"
                      ><Trash2 className="w-4.5 h-4.5" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Building2 size={64} className="text-slate-600" />
                      <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.3em]">No ISP Entities Cataloged</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add ISP Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Provision New ISP Entity" size="lg">
        <div className="space-y-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Service Entity Name*</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-all duration-300" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold"
                  placeholder="e.g. HyperNet Broadband"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subscription Tier*</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-all duration-300 pointer-events-none" />
                <select
                  value={formData.plan_id}
                  onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold appearance-none"
                >
                  <option value="" className="bg-navy-950">Assign Service Plan</option>
                  {plans.map(p => <option key={p.id} value={p.id} className="bg-navy-950">{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Administrative Email*</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-all duration-300" />
                <input
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold"
                  placeholder="owner@isp-domain.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Emergency Contact*</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-all duration-300" />
                <input
                  type="text"
                  value={formData.owner_phone}
                  onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold"
                  placeholder="+880 1XXX XXXXXX"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Operational Address</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-all duration-300" />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold h-24 resize-none"
                  placeholder="Full business headquarters address..."
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 pt-6 border-t border-white/5">
            <button 
              onClick={() => setShowModal(false)}
              className="flex-1 px-6 py-4 rounded-2xl border border-white/5 text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-white/5 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateTenant}
              disabled={submitting}
              className="flex-1 premium-button primary-glow bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2 group"
            >
              {submitting ? <Sparkles className="animate-spin" size={16} /> : <Plus size={16} />}
              {submitting ? 'Initializing...' : 'Authorize Provisioning'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
