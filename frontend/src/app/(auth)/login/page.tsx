'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, Shield, Building2, User, ArrowRight, Loader2, Network, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('admin')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    schema: ''
  })
  const router = useRouter()

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      return toast.error('Please enter both email and password')
    }

    if (role !== 'superadmin' && !formData.schema) {
      return toast.error('Please enter your ISP workspace slug')
    }

    setLoading(true)
    const toastId = toast.loading('Authenticating...')

    try {
      const response = await api.post('/auth/login', {
        ...formData,
        role: role
      })
      
      const { access_token, user } = response.data.data
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user_role', user.role)
      localStorage.setItem('user', JSON.stringify(user))

      // Set cookie for middleware
      document.cookie = `access_token=${access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`

      toast.success('Welcome back, ' + user.name, { id: toastId })

      if (user.role === 'superadmin') {
        router.push('/superadmin/dashboard')
      } else if (user.role === 'customer') {
        router.push('/portal/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#030712]">
      {/* Premium Background Effects */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[180px] -z-10 translate-x-1/3 -translate-y-1/3 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent/15 rounded-full blur-[160px] -z-10 -translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none -z-5" />

      <div className="w-full max-w-[500px] z-10 animate-in fade-in zoom-in duration-700">
        {/* Subtle Badge */}
        <div className="flex justify-center mb-6">
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center space-x-2 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Secure Enterprise Access</span>
          </div>
        </div>

        <div className="bg-navy-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Brand Header */}
          <div className="p-12 pb-8 text-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-glow shadow-primary/20 relative group transition-transform duration-500 hover:scale-110">
              <Network size={48} className="text-white relative z-10" />
              <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-50"></div>
            </div>
            
            <h1 className="text-5xl font-black text-white tracking-tighter mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              NETAXIS
            </h1>
            <div className="flex items-center justify-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-[0.25em]">
              <Globe size={12} />
              <span>Global ISP Management</span>
            </div>
          </div>

          <div className="px-12 pb-12 space-y-8">
            {/* Access Level Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Authorization Level</label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'admin', label: 'ISP Admin', icon: Shield },
                  { id: 'staff', label: 'Staff', icon: User },
                  { id: 'customer', label: 'Customer', icon: User },
                  { id: 'superadmin', label: 'Platform', icon: Lock }
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all duration-500 text-xs font-bold relative overflow-hidden group ${
                      role === r.id 
                        ? 'bg-primary border-primary text-white shadow-glow shadow-primary/40' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <r.icon className={`w-4 h-4 ${role === r.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="relative z-10">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {/* Workspace ID */}
              {role !== 'superadmin' && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">ISP Workspace</label>
                  <div className="relative group">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-all duration-300" />
                    <input 
                      type="text" 
                      value={formData.schema}
                      onChange={(e) => setFormData({...formData, schema: e.target.value})}
                      placeholder="e.g. city-net"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Credentials</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-all duration-300" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="admin@netaxis.io"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold"
                  />
                </div>
                
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-all duration-300" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-14 py-4.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 group disabled:bg-slate-800 disabled:opacity-50 shadow-[0_20px_40px_-10px_rgba(59,130,246,0.5)] active:scale-[0.98] transition-all duration-300 overflow-hidden relative"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span className="text-sm uppercase tracking-[0.2em]">Authorize & Connect</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
              </button>
            </div>

            {/* Support Footer */}
            <div className="flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2">
              <a href="#" className="hover:text-primary transition-colors">Help Center</a>
              <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
              <a href="#" className="hover:text-primary transition-colors">System Status</a>
              <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
              <span>v3.4.0-PRO</span>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <p className="text-slate-500 text-sm font-medium">
            New to the platform? <span className="text-white hover:text-primary font-bold cursor-pointer underline underline-offset-4 transition-all">Request Onboarding</span>
          </p>
        </div>
      </div>
    </div>
  )
}
