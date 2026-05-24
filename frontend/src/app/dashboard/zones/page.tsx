'use client'
import { useEffect, useState } from 'react'
import { Plus, Map, MapPin, Users, UserCheck, ChevronRight, ChevronDown, Edit2, Trash2, X, MoreVertical, Search, Globe, LayoutGrid } from 'lucide-react'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'

export default function ZonesPage() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    description: ''
  })

  const fetchData = async () => {
    try {
      const res = await api.get('/zones')
      setZones(res.data?.data || [])
    } catch (error) {
      console.error('Error fetching zones:', error)
      toast.error('Failed to load zones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    if (!formData.name) return toast.error('Zone name is required')
    setSubmitting(true)
    try {
      await api.post('/zones', formData)
      setShowModal(false)
      fetchData()
      setFormData({ name: '', parent_id: '', description: '' })
      toast.success('Zone created successfully')
    } catch (e) {
      toast.error('Failed to add zone')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Coverage Zones</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Organize your service areas and network distribution</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2">
            <Globe size={18} />
            <span>Map View</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            <span>Add New Zone</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats & Tools */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid className="text-primary" size={18} />
              Statistics
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Total Regions</span>
                <span className="text-2xl font-black text-white">{zones.length}</span>
              </div>
              <div className="flex items-center justify-between group">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Primary Hubs</span>
                <span className="text-2xl font-black text-primary">{zones.filter((z: any) => !z.parent_id).length}</span>
              </div>
              <div className="flex items-center justify-between group">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Sub-Areas</span>
                <span className="text-2xl font-black text-indigo-400">{zones.filter((z: any) => z.parent_id).length}</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Tip: Nest zones to create hierarchical routing for technicians.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Zones Tree List */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Hierarchy Explorer</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Find zone..." 
                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          
          <div className="divide-y divide-white/5 min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-full py-20">
                <LoadingSpinner />
              </div>
            ) : zones.length > 0 ? (
              <div className="p-2">
                {zones.filter((z: any) => !z.parent_id).map((zone: any) => (
                  <ZoneItem key={zone.id} zone={zone} allZones={zones} />
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center gap-6 text-center">
                <div className="p-6 bg-primary/10 rounded-3xl text-primary">
                  <Map size={48} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">No Service Zones</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Start by creating your main coverage area or city branch.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in">
          <div className="glass-card w-full max-w-lg shadow-2xl overflow-hidden border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-black text-white tracking-tight">Create Territory</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Territory Name*</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all placeholder:text-slate-700"
                  placeholder="e.g. Dhaka North"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Parent Territory</label>
                <select 
                  value={formData.parent_id}
                  onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="" className="bg-navy-900">None (Root Level)</option>
                  {zones.filter((z: any) => !z.parent_id).map((z: any) => (
                    <option key={z.id} value={z.id} className="bg-navy-900">{z.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Area Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all h-28 resize-none placeholder:text-slate-700"
                  placeholder="Details about specific roads or landmarks..."
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
                {submitting ? 'Saving...' : 'Establish Zone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ZoneItem({ zone, allZones, depth = 0 }: { zone: any, allZones: any[], depth?: number }) {
  const [isOpen, setIsOpen] = useState(true)
  const children = allZones.filter(z => z.parent_id === zone.id)
  const hasChildren = children.length > 0

  return (
    <div className="animate-in">
      <div className={`flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all group ${depth > 0 ? 'ml-6 border-l border-white/5' : ''}`}>
        <div className="flex items-center gap-4">
          {hasChildren ? (
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-primary transition-colors">
              {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div className="w-[18px]"></div>
          )}
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{zone.name}</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                <Users size={12} className="text-indigo-400" /> {zone.customer_count || 0} Subscriptions
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                <UserCheck size={12} className="text-emerald-400" /> {zone.staff_count || 0} Personnel
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
          <button className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><Edit2 size={16} /></button>
          <button className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
          <button className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"><MoreVertical size={16} /></button>
        </div>
      </div>
      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {children.map(child => (
            <ZoneItem key={child.id} zone={child} allZones={allZones} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
