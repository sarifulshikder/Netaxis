'use client'
import { useEffect, useState } from 'react'
import { Plus, Network, Cpu, HardDrive, Clock, Activity, RefreshCw, Play, Edit2, Trash2, X, Globe, Shield } from 'lucide-react'

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

interface Router {
  id: string
  name: string
  ip_address: string
  port: number
  status: string
  model: string
  cpu_usage: number
  memory_usage: number
  uptime: string
  active_sessions: number
  zone_name: string
}

export default function RoutersPage() {
  const [routers, setRouters] = useState<Router[]>([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: 8728,
    username: '',
    password: '',
    model: 'RB750',
    zone_id: ''
  })

  const fetchData = async () => {
    try {
      const [routersRes, zonesRes] = await Promise.all([
        apiFetch('/routers'),
        apiFetch('/zones')
      ])
      setRouters(routersRes.data || [])
      setZones(zonesRes.data || [])
    } catch (error) {
      console.error('Error fetching routers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTestConnection = async (id: string) => {
    try {
      const res = await apiFetch(`/routers/${id}/test`, { method: 'POST' })
      alert(res.message || 'Connection successful!')
    } catch (e) {
      alert('Connection failed')
    }
  }

  const handleSync = async (id: string) => {
    try {
      await apiFetch(`/routers/${id}/sync`, { method: 'POST' })
      alert('Router sync started')
      fetchData()
    } catch (e) {
      alert('Sync failed')
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await apiFetch('/routers', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      setShowModal(false)
      fetchData()
    } catch (e) {
      alert('Failed to add router')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Network Routers</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Manage and monitor MikroTik NAS devices</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-[#0ea5e9]/20"
        >
          <Plus className="w-4 h-4" /> Add Router
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-[#94a3b8]">Loading routers...</p>
        ) : routers.map((router) => (
          <div key={router.id} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 hover:border-[#0ea5e9] transition-all group relative overflow-hidden">
            {/* Status Indicator */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rotate-45 opacity-10 ${router.status === 'online' ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0ea5e9]/10 rounded-xl">
                  <Network className="w-6 h-6 text-[#0ea5e9]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#f1f5f9]">{router.name}</h3>
                  <p className="text-xs text-[#94a3b8]">{router.model}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                router.status === 'online' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${router.status === 'online' ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}></div>
                {router.status}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#94a3b8] flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> IP Address</span>
                <span className="text-[#f1f5f9] font-mono">{router.ip_address}:{router.port}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-[#0f172a] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[10px] text-[#475569] uppercase font-bold mb-1">
                    <Cpu className="w-3 h-3" /> CPU
                  </div>
                  <p className="text-sm font-bold text-[#f1f5f9]">{router.cpu_usage}%</p>
                </div>
                <div className="bg-[#0f172a] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[10px] text-[#475569] uppercase font-bold mb-1">
                    <HardDrive className="w-3 h-3" /> RAM
                  </div>
                  <p className="text-sm font-bold text-[#f1f5f9]">{router.memory_usage}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Uptime: {router.uptime}</span>
                <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> {router.active_sessions} Sessions</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleTestConnection(router.id)}
                className="flex-1 bg-[#0ea5e9]/10 hover:bg-[#0ea5e9] text-[#0ea5e9] hover:text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3 h-3" /> Test
              </button>
              <button 
                onClick={() => handleSync(router.id)}
                className="flex-1 bg-[#334155] hover:bg-[#475569] text-[#f1f5f9] py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3 h-3" /> Sync
              </button>
              <button className="p-2 bg-[#334155] hover:bg-[#475569] text-[#f1f5f9] rounded-lg transition-all">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#334155]">
              <h2 className="text-lg font-semibold text-[#f1f5f9]">Add New MikroTik Router</h2>
              <button onClick={() => setShowModal(false)} className="text-[#94a3b8] hover:text-[#f1f5f9]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">Router Name*</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#0ea5e9] text-sm"
                    placeholder="e.g. Core-Router-01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">IP / Host*</label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#0ea5e9] text-sm"
                    placeholder="192.168.88.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">API Port</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#0ea5e9] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">API Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#0ea5e9] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">API Password*</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#0ea5e9] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">Model</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#0ea5e9] text-sm appearance-none"
                  >
                    <option>RB750</option>
                    <option>RB951</option>
                    <option>CCR1009</option>
                    <option>hEX</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">Zone</label>
                  <select
                    value={formData.zone_id}
                    onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#0ea5e9] text-sm appearance-none"
                  >
                    <option value="">Select Zone</option>
                    {zones.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#334155]">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-[#334155] rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] text-sm transition-colors">Cancel</button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? 'Connecting...' : 'Add Router'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
