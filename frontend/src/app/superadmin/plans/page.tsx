'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Check, X, CreditCard, Users, Shield, Zap, Sparkles, Activity, Cpu } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  max_customers: number
  max_staff: number
  max_bandwidth_mbps: number
  features: string[]
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    max_customers: '',
    max_staff: '5',
    max_bandwidth_mbps: '1000',
    features_text: ''
  })

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await api.get('/superadmin/plans')
      setPlans(res.data?.data || [])
    } catch (error: any) {
      console.error('Error fetching plans:', error)
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const openCreateModal = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      max_customers: '',
      max_staff: '5',
      max_bandwidth_mbps: '1000',
      features_text: ''
    })
    setShowModal(true)
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      price: String(plan.price ?? ''),
      max_customers: String(plan.max_customers ?? ''),
      max_staff: String(plan.max_staff ?? ''),
      max_bandwidth_mbps: String(plan.max_bandwidth_mbps ?? ''),
      features_text: (plan.features || []).join('\n')
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.price) {
      toast.error('Plan name and price are required')
      return
    }
    
    setSubmitting(true)
    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      max_customers: Number(formData.max_customers),
      max_staff: Number(formData.max_staff),
      max_bandwidth_mbps: Number(formData.max_bandwidth_mbps),
      features: formData.features_text.split('\n').filter(f => f.trim() !== '')
    }

    try {
      if (editingPlan) {
        await api.put(`/superadmin/plans/${editingPlan.id}`, payload)
        toast.success('Plan updated')
      } else {
        await api.post('/superadmin/plans', payload)
        toast.success('Plan created')
      }
      setShowModal(false)
      fetchPlans()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save plan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    try {
      await api.delete(`/superadmin/plans/${id}`)
      toast.success('Plan deleted')
      fetchPlans()
    } catch (error: any) {
      toast.error('Failed to delete plan')
    }
  }

  return (
    <div className="space-y-12 animate-in pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-accent font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
            <Zap size={14} className="fill-accent text-accent" />
            <span>Monetization Strategy</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">Service <span className="text-accent">Architect</span></h1>
          <p className="text-slate-500 font-medium tracking-wide">
            Design and deploy subscription tiers for your ISP network
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="premium-button bg-accent text-white flex items-center space-x-2 px-8 py-4 shadow-[0_0_25px_rgba(139,92,246,0.3)]"
        >
          <Plus size={18} />
          <span className="font-bold">Create New Tier</span>
        </button>
      </div>

      {loading ? (
        <div className="py-40 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : plans.length === 0 ? (
        <div className="py-32 flex flex-col items-center gap-6 text-center glass-card border-dashed">
          <div className="p-8 bg-accent/10 rounded-full text-accent">
            <CreditCard size={64} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">No Tiers Defined</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">Start by creating your first subscription tier to begin onboarding ISPs.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="premium-button bg-accent text-white flex items-center space-x-2 px-8 py-4"
          >
            <Plus size={18} />
            <span className="font-bold uppercase tracking-widest text-xs">Establish First Tier</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className="glass-card p-10 group hover:border-accent/40 transition-all duration-500 flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                <Shield size={120} className="text-accent" />
              </div>

              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter group-hover:text-accent transition-colors">{plan.name}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{plan.max_bandwidth_mbps} Mbps Capacity</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleEdit(plan)} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-accent transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500 transition-all"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white tracking-tighter">{formatCurrency(plan.price)}</span>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">/ Month</span>
                </div>
                <p className="text-sm text-slate-400 mt-4 leading-relaxed font-medium line-clamp-2 h-10">{plan.description || 'Enterprise-grade ISP management solution for growing providers.'}</p>
              </div>

              <div className="space-y-5 flex-1">
                {[
                  { label: 'Max Subscribers', value: plan.max_customers.toLocaleString(), icon: Users },
                  { label: 'Staff Accounts', value: plan.max_staff, icon: Shield },
                  { label: 'Bandwidth Hub', value: `${plan.max_bandwidth_mbps} Mbps`, icon: Activity },
                ].map((spec, i) => (
                  <div key={i} className="flex items-center gap-4 text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent/60 group-hover:text-accent transition-colors">
                      <spec.icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">{spec.label}</p>
                      <p className="text-sm font-black text-white mt-1 leading-none">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 space-y-3">
                {plan.features?.slice(0, 4).map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-400">
                    <Check size={14} className="text-accent" />
                    <span className="text-xs font-medium">{feature}</span>
                  </div>
                ))}
                {plan.features?.length > 4 && (
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest pl-6">+{plan.features.length - 4} More Features</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingPlan ? "Modify Service Tier" : "Create New Tier"} size="lg">
        <div className="space-y-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tier Identity*</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all text-sm font-semibold"
                placeholder="e.g. ISP Platinum"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Monthly Pricing (৳)*</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all text-sm font-semibold"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Customer Capacity*</label>
              <input
                type="number"
                value={formData.max_customers}
                onChange={(e) => setFormData({ ...formData, max_customers: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent/50 text-sm font-semibold"
                placeholder="500"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Max Bandwidth (Mbps)*</label>
              <input
                type="number"
                value={formData.max_bandwidth_mbps}
                onChange={(e) => setFormData({ ...formData, max_bandwidth_mbps: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent/50 text-sm font-semibold"
                placeholder="1000"
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Core Features (One per line)</label>
              <textarea
                value={formData.features_text}
                onChange={(e) => setFormData({ ...formData, features_text: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 h-32 resize-none text-sm font-medium"
                placeholder="Unlimited Customers&#10;Mikrotik Integration&#10;Android App Access..."
              />
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
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 premium-button bg-accent text-white font-bold uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2 group"
            >
              {submitting ? <Sparkles className="animate-spin" size={16} /> : <Check size={16} />}
              {submitting ? 'Saving Changes...' : 'Authorize Tier Deployment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
