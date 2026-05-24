'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, ShieldCheck, Check, Info, Sparkles, Loader2 } from 'lucide-react'
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
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'API request failed')
  return data
}
interface Plan {
  id: string
  name: string
  price: number
  max_customers: number
  max_staff: number
  features: string[]
}
export default function NewTenantPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    plan_id: '',
    admin_password: ''
  })
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await apiFetch('/superadmin/plans')
        setPlans(res.data || [])
      } catch (error) {
        console.error('Error fetching plans:', error)
        toast.error('Failed to load service plans')
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    setFormData({ ...formData, name, slug })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.plan_id || !formData.admin_password || !formData.owner_name) {
      toast.error('Please fill in all required fields marked with *')
      return
    }
    setSubmitting(true)
    const toastId = toast.loading('Provisioning ISP environment...')
    try {
      await apiFetch('/superadmin/tenants', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      toast.success('ISP Registry created successfully', { id: toastId })
      router.push('/superadmin/tenants')
    } catch (error: any) {
      toast.error(error.message || 'Failed to register ISP', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }
  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  )
  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold"
  const labelClasses = "block text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1"
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Register <span className="text-primary">New ISP</span></h1>
            <p className="text-slate-500 font-medium tracking-wide mt-1 text-sm">Provision a dedicated infrastructure for a new provider</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <div className="glass-card p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <Building2 size={120} className="text-primary" />
            </div>
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Building2 size={20} />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-wider">Entity Profile</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="md:col-span-2 space-y-2">
                <label className={labelClasses}>ISP Business Name*</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. IDC Network"
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Workspace ID*</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.slug}
                    readOnly
                    className={`${inputClasses} bg-white/[0.02] text-slate-400 cursor-not-allowed`}
                  />
                  <span className="text-slate-600 font-bold text-xs uppercase tracking-widest">.netaxis.io</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Business Phone*</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`${inputClasses} pl-14`}
                    placeholder="017XXXXXXXX"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className={labelClasses}>Physical Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-5 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`${inputClasses} pl-14 h-32 resize-none pt-4`}
                    placeholder="Headquarters full physical address..."
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <ShieldCheck size={120} className="text-success" />
            </div>
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
              <div className="p-2.5 bg-success/10 rounded-xl text-success">
                <User size={20} />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-wider">Root Administrator</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-2">
                <label className={labelClasses}>Owner Full Name*</label>
                <input
                  required
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  className={inputClasses}
                  placeholder="Full name of primary owner"
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Owner Email*</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${inputClasses} pl-14`}
                    placeholder="owner@domain.com"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className={labelClasses}>Admin Password*</label>
                <input
                  required
                  type="password"
                  value={formData.admin_password}
                  onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                  className={inputClasses}
                  placeholder="Secure administrative password"
                />
                <div className="flex items-center gap-2 mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <Info className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    This password will be used for the very first administrative ISP login.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-10">
          <div className="sticky top-24 space-y-8">
            <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-wider px-2 flex items-center gap-2">
              <Sparkles size={20} className="text-accent" /> Select Plan
            </h2>
            <div className="space-y-4">
              {plans.length > 0 ? plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, plan_id: plan.id })}
                  className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-500 relative group overflow-hidden ${
                    formData.plan_id === plan.id
                      ? 'bg-primary/10 border-primary shadow-glow shadow-primary/20'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  {formData.plan_id === plan.id && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-bl-[100%] flex items-center justify-center pl-6 pb-6">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <h3 className="font-black text-white text-lg tracking-tight group-hover:text-primary transition-colors">{plan.name}</h3>
                  <p className="text-3xl font-black text-white tracking-tighter mt-2">৳{plan.price}<span className="text-[10px] text-slate-500 uppercase tracking-widest ml-1 font-bold">/mo</span></p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Check className="w-3.5 h-3.5 text-success" />
                      {plan.max_customers} Max Customers
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Check className="w-3.5 h-3.5 text-success" />
                      {plan.max_staff} Staff Capacity
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 rounded-3xl border border-white/5 bg-white/5 text-center">
                  <Info className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No plans configured</p>
                  <Link href="/superadmin/plans" className="text-primary text-[10px] font-black uppercase mt-4 inline-block hover:underline">Create Tiers</Link>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full premium-button primary-glow bg-primary text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 group disabled:bg-slate-800 transition-all duration-300 shadow-2xl"
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="text-sm uppercase tracking-[0.2em]">Register ISP</span>
              )}
            </button>
            <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em] px-4 leading-relaxed">
              By authorizing registration, you agree to the <span className="text-slate-400">System Protocols</span> and <span className="text-slate-400">Data Integrity Policies</span>.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
