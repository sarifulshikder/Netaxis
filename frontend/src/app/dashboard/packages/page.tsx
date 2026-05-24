'use client'
import { useEffect, useState } from 'react'
import { Plus, Package, Zap, Users, Edit2, Trash2, X, Info, Check, Globe, BarChart3 } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'

interface ISPPackage {
  id: string
  name: string
  type: string // pppoe, hotspot, static
  price: number
  download_speed: number
  upload_speed: number
  description: string
  customers_count: number
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<ISPPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'pppoe',
    price: 0,
    download_speed: 10,
    upload_speed: 10,
    description: ''
  })

  const fetchPackages = async () => {
    try {
      const res = await api.get('/packages')
      setPackages(res.data?.data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const handleSubmit = async () => {
    if (!formData.name || formData.price <= 0) return toast.error('Please fill in all required fields')
    setSubmitting(true)
    try {
      await api.post('/packages', formData)
      setShowModal(false)
      fetchPackages()
      setFormData({ name: '', type: 'pppoe', price: 0, download_speed: 10, upload_speed: 10, description: '' })
      toast.success('Package created successfully')
    } catch (e) {
      toast.error('Failed to add package')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Service Plans</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Define internet speed profiles and monthly subscription rates</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2">
            <BarChart3 size={18} />
            <span>Analysis</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            <span>Create Package</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : packages.length > 0 ? packages.map((pkg) => (
          <div key={pkg.id} className="glass-card p-8 group hover:border-primary/30 transition-all flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all">
              <Zap size={80} className="text-primary" />
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/10">
                <Package size={28} />
              </div>
              <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                {pkg.type}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-2">{pkg.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-6 h-8">
              {pkg.description || 'Standard high-speed internet package with priority support.'}
            </p>
            
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between mb-8 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
              <div className="flex items-center gap-3">
                <Zap className="text-amber-500 animate-pulse" size={20} />
                <span className="text-lg font-black text-white">{pkg.download_speed} Mbps</span>
              </div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Symmetric</div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Monthly Rate</span>
                <span className="text-2xl font-black text-primary">{formatCurrency(pkg.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Base</span>
                <div className="flex items-center gap-2 text-emerald-500">
                  <Users size={16} />
                  <span className="font-black">{pkg.customers_count || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-8 mt-8 border-t border-white/5">
              <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5">
                <Edit2 size={14} /> Edit
              </button>
              <button className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-white/5">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 glass-card border-dashed flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-8 bg-white/5 rounded-full text-slate-600">
              <Package size={64} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">No Service Plans</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">Create your first internet package to start onboarding customers.</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="premium-button primary-glow bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              Add Your First Package
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in">
          <div className="glass-card w-full max-w-lg shadow-2xl overflow-hidden border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-black text-white tracking-tight">New Service Plan</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Plan Name*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:border-primary text-sm transition-all"
                  placeholder="e.g. Home Ultra 50M"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Service Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm appearance-none transition-all"
                  >
                    <option value="pppoe" className="bg-navy-900">PPPoE</option>
                    <option value="hotspot" className="bg-navy-900">Hotspot</option>
                    <option value="static" className="bg-navy-900">Static IP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Rate (৳ / Month)*</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Download (Mbps)*</label>
                  <input
                    type="number"
                    value={formData.download_speed}
                    onChange={(e) => setFormData({ ...formData, download_speed: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Upload (Mbps)*</label>
                  <input
                    type="number"
                    value={formData.upload_speed}
                    onChange={(e) => setFormData({ ...formData, upload_speed: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Plan Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:border-primary text-sm h-28 resize-none transition-all"
                  placeholder="Key features of this service plan..."
                />
              </div>
            </div>
            <div className="flex gap-4 p-8 border-t border-white/5 bg-white/5">
              <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-all uppercase tracking-widest">Cancel</button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-primary hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
              >
                {submitting ? 'Creating...' : 'Deploy Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
