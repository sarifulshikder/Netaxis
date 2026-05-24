'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Zone } from '@/types'
import { Loader2, User, Phone, Mail, FileText, MapPin, Tag } from 'lucide-react'

interface CustomerFormProps {
  initial?: any
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
}

export default function CustomerForm({ initial, onSubmit, loading }: CustomerFormProps) {
  const [zones, setZones] = useState<Zone[]>([])
  const [form, setForm] = useState({
    name: '', phone: '', email: '', nid: '', address: '',
    zone_id: '', type: 'home', status: 'active', ...initial
  })

  useEffect(() => {
    api.get('/zones').then(r => setZones(r.data.data || [])).catch(() => {})
  }, [])

  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
  const labelClasses = "block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelClasses}>Full Name *</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="John Doe" className={`${inputClasses} pl-11`} />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className={labelClasses}>Phone *</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
            <input required value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+880 1XXX XXXXXX" className={`${inputClasses} pl-11`} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClasses}>Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="john@example.com" className={`${inputClasses} pl-11`} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClasses}>National ID / Passport</label>
          <div className="relative group">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
            <input value={form.nid} onChange={e => set('nid', e.target.value)}
              placeholder="NID Number" className={`${inputClasses} pl-11`} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClasses}>Service Zone</label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
            <select value={form.zone_id} onChange={e => set('zone_id', e.target.value)}
              className={`${inputClasses} pl-11 appearance-none`}>
              <option value="" className="bg-navy-900">Select Zone</option>
              {zones.map(z => <option key={z.id} value={z.id} className="bg-navy-900">{z.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClasses}>Customer Type</label>
          <div className="relative group">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none" />
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className={`${inputClasses} pl-11 appearance-none`}>
              <option value="home" className="bg-navy-900">Home / Personal</option>
              <option value="office" className="bg-navy-900">Office / Small Business</option>
              <option value="corporate" className="bg-navy-900">Corporate / Dedicated</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className={labelClasses}>Installation Address</label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
            <textarea rows={3} value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="House #, Road #, Area..." className={`${inputClasses} pl-11 pt-3 resize-none`} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
        <button type="submit" disabled={loading}
          className="premium-button primary-glow bg-primary text-white text-sm font-bold min-w-[160px] flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {loading ? 'Processing...' : 'Save Customer Profile'}
        </button>
      </div>
    </form>
  )
}
