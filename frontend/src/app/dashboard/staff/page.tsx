'use client'
import { useEffect, useState } from 'react'
import { Plus, User, Phone, MapPin, Shield, Calendar, Search, Filter, Trash2, Edit2, X, CheckCircle, Clock, Contact2, Briefcase, Users } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import StatsCard from '@/components/ui/StatsCard'

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'technician',
    salary: 0,
    zone_id: '',
    username: '',
    password: ''
  })

  const fetchData = async () => {
    try {
      const [staffRes, zonesRes] = await Promise.all([
        api.get('/staff'),
        api.get('/zones')
      ])
      setStaff(staffRes.data?.data || [])
      setZones(zonesRes.data?.data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Failed to load team data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.username) return toast.error('Required fields missing')
    setSubmitting(true)
    try {
      await api.post('/staff', formData)
      setShowModal(false)
      fetchData()
      toast.success('Team member registered')
    } catch (e) {
      toast.error('Failed to register staff')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Team Management</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Manage personnel, roles, and attendance tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2">
            <Shield size={18} />
            <span>Permissions</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> 
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Team" value={staff.length} icon={Users} color="bg-primary" />
        <StatsCard title="Technicians" value={staff.filter((s:any) => s.role === 'technician').length} icon={Briefcase} color="bg-indigo-500" />
        <StatsCard title="On Field" value={3} icon={MapPin} color="bg-emerald-500" />
        <StatsCard title="Monthly Payroll" value={145000} icon={Calendar} color="bg-rose-500" currency />
      </div>

      <div className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit">
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'list' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Contact2 size={16} />
          Directory
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'attendance' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock size={16} />
          Attendance
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-6 py-5">Personnel</th>
                  <th className="px-6 py-5">Contact Details</th>
                  <th className="px-6 py-5">Role & Zone</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center"><LoadingSpinner /></td></tr>
                ) : staff.length > 0 ? staff.map((s: any) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-black border border-indigo-500/10">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{s.name}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ID: {s.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-300 font-bold">{s.phone}</span>
                        <span className="text-slate-500">{s.email || 'No email registered'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-primary uppercase tracking-widest">{s.role}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase italic">{s.zone_name || 'Cross-Zone'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit2 size={16} /></button>
                        <button className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs opacity-20">
                      No team members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card p-20 text-center space-y-6">
          <div className="p-6 bg-white/5 rounded-full w-fit mx-auto text-slate-700">
            <Clock size={48} />
          </div>
          <div className="max-w-xs mx-auto">
            <h3 className="text-xl font-black text-white mb-2">Attendance Engine</h3>
            <p className="text-sm text-slate-500 font-medium">Synchronizing live tracking data from technician field apps. Please wait.</p>
          </div>
          <div className="w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
            <div className="w-1/3 h-full bg-primary animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in">
          <div className="glass-card w-full max-w-2xl shadow-2xl overflow-hidden border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-black text-white tracking-tight">Onboard Personnel</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Full Name*</label>
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
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Role / Designation*</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="technician" className="bg-navy-900">Technician</option>
                  <option value="manager" className="bg-navy-900">Branch Manager</option>
                  <option value="collector" className="bg-navy-900">Bill Collector</option>
                  <option value="support" className="bg-navy-900">Customer Support</option>
                  <option value="admin" className="bg-navy-900">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Base Salary (৳)</label>
                <input 
                  type="number" 
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="col-span-2 p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Authentication Access</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">System Username*</label>
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Password*</label>
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 p-8 border-t border-white/5 bg-white/5">
              <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-all uppercase tracking-widest">Cancel</button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-primary hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
              >
                {submitting ? 'Registering...' : 'Confirm Hire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
