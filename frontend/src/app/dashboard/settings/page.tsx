'use client'
import { useEffect, useState } from 'react'
import { 
  Settings, Building2, CreditCard, MessageSquare, 
  Mail, Bell, Save, Shield, Smartphone, Globe, Lock,
  Zap, Cloud, Database, Cpu
} from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const tabs = [
    { id: 'company', label: 'Organization', icon: Building2 },
    { id: 'billing', label: 'Billing & Ops', icon: CreditCard },
    { id: 'sms', label: 'SMS Gateway', icon: Smartphone },
    { id: 'email', label: 'SMTP Server', icon: Mail },
    { id: 'notifications', label: 'Automations', icon: Bell },
  ]

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings')
        setSettings(res.data?.data || {})
      } catch (e) {
        console.error(e)
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', settings)
      toast.success('Configuration updated successfully')
    } catch (e) {
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  if (loading) return (
    <div className="py-40 flex justify-center">
      <LoadingSpinner />
    </div>
  )

  return (
    <div className="space-y-12 animate-in max-w-7xl mx-auto pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
            <Cpu size={14} className="text-primary" />
            <span>Core Configuration</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">System <span className="text-primary">Control</span></h1>
          <p className="text-slate-500 font-medium tracking-wide">
            Manage your ISP platform parameters and third-party integrations
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="premium-button primary-glow bg-primary text-white flex items-center space-x-3 px-8 py-4 shadow-xl"
        >
          {saving ? <Zap className="animate-spin" size={18} /> : <Save size={18} />}
          <span className="font-bold uppercase tracking-widest text-xs">{saving ? 'Synchronizing...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-3 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-slate-600 group-hover:text-primary transition-colors'} />
                <span className="text-sm font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="glass-card p-6 bg-primary/5 border-primary/10">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Shield size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest">Security Context</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Changes to core billing parameters will affect all subsequent automated cycles. Please verify API keys before saving.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="glass-card overflow-hidden">
            {activeTab === 'company' && (
              <div className="p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 shadow-inner">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Organization Profile</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Identity & Metadata</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official ISP Name</label>
                    <input 
                      type="text" 
                      value={settings.company_name || ''}
                      onChange={(e) => updateSetting('company_name', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-primary outline-none transition-all font-semibold" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Support Email</label>
                    <input 
                      type="email" 
                      value={settings.support_email || ''} 
                      onChange={(e) => updateSetting('support_email', e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-primary outline-none transition-all font-semibold" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Support Hotline</label>
                    <input 
                      type="text" 
                      value={settings.support_phone || ''} 
                      onChange={(e) => updateSetting('support_phone', e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-primary outline-none transition-all font-semibold" 
                    />
                  </div>
                  <div className="col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Physical Headquarters</label>
                    <textarea 
                      value={settings.address || ''} 
                      onChange={(e) => updateSetting('address', e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm h-32 resize-none focus:border-primary outline-none transition-all font-semibold" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 shadow-inner">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Billing Parameters</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Currency & Automation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Invoice Prefix</label>
                    <input 
                      type="text" 
                      value={settings.invoice_prefix || 'INV-'} 
                      onChange={(e) => updateSetting('invoice_prefix', e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-mono font-bold" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Currency Symbol</label>
                    <input 
                      type="text" 
                      value={settings.currency || '৳'} 
                      onChange={(e) => updateSetting('currency', e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-black" 
                    />
                  </div>
                  
                  <div className="col-span-2 bg-primary/5 rounded-[2rem] border border-primary/10 p-8 flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-base font-black text-white tracking-tight group-hover:text-primary transition-colors">Automatic Service Suspension</p>
                      <p className="text-xs text-slate-500 font-medium max-w-sm">Automatically block internet access if invoice remains unpaid after the grace period.</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Grace Period</p>
                        <p className="text-sm font-bold text-white">3 Business Days</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.auto_suspend} 
                          onChange={(e) => updateSetting('auto_suspend', e.target.checked)} 
                        />
                        <div className="w-14 h-7 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-600 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sms' && (
              <div className="p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 shadow-inner">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">SMS Gateway</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Broadcast Intelligence</p>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20 tracking-[0.2em]">Live Connector</div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">API Key / Secret Token</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="password" 
                        value={settings.sms_api_key || ''} 
                        onChange={(e) => updateSetting('sms_api_key', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white text-sm focus:border-primary outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sender Identity (SID)</label>
                    <input 
                      type="text" 
                      value={settings.sms_sender_id || ''} 
                      onChange={(e) => updateSetting('sms_sender_id', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold tracking-widest" 
                    />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/5">
                  <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5">Execute Transmission Test</button>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 shadow-inner">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Email Intelligence</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">SMTP Routing & Relay</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SMTP Host Hostname</label>
                    <input 
                      type="text" 
                      value={settings.smtp_host || ''} 
                      onChange={(e) => updateSetting('smtp_host', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-semibold" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Port</label>
                    <input 
                      type="number" 
                      value={settings.smtp_port || 587} 
                      onChange={(e) => updateSetting('smtp_port', Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold" 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Authentication Password</label>
                    <input 
                      type="password" 
                      value={settings.smtp_pass || ''} 
                      onChange={(e) => updateSetting('smtp_pass', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Encryption Protocol</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm appearance-none font-bold uppercase tracking-widest">
                      <option className="bg-navy-950">TLS / SSL</option>
                      <option className="bg-navy-950">None</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 shadow-inner">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Automated Events</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Lifecycle Templates</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'welcome', label: 'Welcome Protocol', desc: 'Triggered upon new customer account creation' },
                    { id: 'invoice', label: 'Billing Cycle', desc: 'Triggered on monthly invoice generation' },
                    { id: 'payment', label: 'Financial Receipt', desc: 'Triggered after ledger confirmation' },
                    { id: 'suspend', label: 'Service Block', desc: 'Triggered on automated account suspension' },
                  ].map((tpl) => (
                    <div key={tpl.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all duration-300">
                      <div>
                        <p className="text-sm font-black text-white tracking-tight group-hover:text-primary transition-colors uppercase">{tpl.label}</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">{tpl.desc}</p>
                      </div>
                      <button className="px-6 py-2.5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5">Architect Template</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
