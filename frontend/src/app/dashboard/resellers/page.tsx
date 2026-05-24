'use client'
import { useEffect, useState } from 'react'
import { Plus, Handshake, Wallet, Users, MapPin, Search, Filter, Trash2, Edit2, X, ArrowUpRight, Check, BarChart3, Globe } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency, getStatusColor } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import StatsCard from '@/components/ui/StatsCard'

export default function ResellersPage() {
  const [resellers, setResellers] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTopupModal, setShowTopupModal] = useState(false)
  const [selectedReseller, setSelectedReseller] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    zone_id: '',
    commission_rate: 10,
    initial_balance: 0,
    username: '',
    password: ''
  })

  const [topupData, setTopupData] = useState({
    amount: 0,
    payment_method: 'cash',
    note: ''
  })

  const fetchData = async () => {
    try {
      const [resellersRes, zonesRes] = await Promise.all([
        api.get('/resellers'),
        api.get('/zones')
      ])
      setResellers(resellersRes.data?.data || [])
      setZones(zonesRes.data?.data || [])
    } catch (error) {
      console.error('Error fetching resellers:', error)
      toast.error('Failed to load reseller data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddReseller = async () => {
    setSubmitting(true)
    try {
      await api.post('/resellers', formData)
      setShowAddModal(false)
      fetchData()
      toast.success('Reseller registered successfully')
    } catch (e) {
      toast.error('Failed to add reseller')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTopup = async () => {
    if (!selectedReseller) return
    setSubmitting(true)
    try {
      await api.post(`/resellers/${selectedReseller.id}/wallet/topup`, topupData)
      setShowTopupModal(false)
      fetchData()
      toast.success('Wallet recharged successfully')
    } catch (e) {
      toast.error('Top-up failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Reseller Network</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Manage independent agents and their credit balances</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2">
            <Globe size={18} />
            <span>Map View</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> 
            <span>Add New Reseller</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Resellers" value={resellers.length} icon={Handshake} color="bg-primary" />
        <StatsCard title="Total Balance" value={42500} icon={Wallet} color="bg-indigo-500" currency />
        <StatsCard title="MTD Sales" value={18200} icon={BarChart3} color="bg-emerald-500" currency />
        <StatsCard title="Active Network" value={resellers.length} icon={Users} color="bg-amber-500" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-6 py-5">Agent Details</th>
                <th className="px-6 py-5">Zone</th>
                <th className="px-6 py-5">Wallet Balance</th>
                <th className="px-6 py-5 text-center">Customers</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center"><LoadingSpinner /></td></tr>
              ) : resellers.length > 0 ? resellers.map((r: any) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold border border-primary/10">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{r.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{r.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <MapPin size={12} className="text-indigo-400" />
                      {r.zone_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-emerald-400">{formatCurrency(r.wallet_balance || 0)}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-xs font-bold text-white">
                      {r.customers_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedReseller(r); setShowTopupModal(true); }}
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-primary/10"
                      >
                        <Wallet size={12} /> Top-up
                      </button>
                      <button className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"><Edit2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs opacity-20">
                    No resellers registered yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in">
          <div className="glass-card w-full max-w-2xl shadow-2xl overflow-hidden border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-black text-white tracking-tight">Onboard Reseller</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Business Name*</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Phone Number*</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Coverage Zone*</label>
                <select 
                  value={formData.zone_id}
                  onChange={(e) => setFormData({...formData, zone_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="" className="bg-navy-900">Select Zone</option>
                  {zones.map((z: any) => <option key={z.id} value={z.id} className="bg-navy-900">{z.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Commission (%)</label>
                <input 
                  type="number" 
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({...formData, commission_rate: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-4 p-8 border-t border-white/5 bg-white/5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-all uppercase tracking-widest">Cancel</button>
              <button 
                onClick={handleAddReseller}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-primary hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
              >
                {submitting ? 'Registering...' : 'Register Agent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topup Modal */}
      {showTopupModal && selectedReseller && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in">
          <div className="glass-card w-full max-w-md shadow-2xl overflow-hidden border-white/10">
            <div className="p-8 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-black text-white tracking-tight">Recharge Wallet</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">Crediting <b>{selectedReseller.name}</b></p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Top-up Amount (৳)*</label>
                <input 
                  type="number" 
                  value={topupData.amount}
                  onChange={(e) => setTopupData({...topupData, amount: Number(e.target.value)})}
                  className="w-full bg-white/5 border-2 border-primary/20 rounded-2xl px-5 py-5 text-white text-3xl font-black focus:border-primary outline-none transition-all placeholder:text-slate-800"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Method</label>
                <select 
                  value={topupData.payment_method}
                  onChange={(e) => setTopupData({...topupData, payment_method: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all appearance-none"
                >
                  <option value="cash" className="bg-navy-900">Cash Deposit</option>
                  <option value="bank" className="bg-navy-900">Bank Transfer</option>
                  <option value="bkash" className="bg-navy-900">bKash</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 p-8 border-t border-white/5 bg-white/5">
              <button onClick={() => setShowTopupModal(false)} className="flex-1 px-4 py-3 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest">Cancel</button>
              <button 
                onClick={handleTopup}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest"
              >
                {submitting ? 'Processing...' : 'Confirm Recharge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
