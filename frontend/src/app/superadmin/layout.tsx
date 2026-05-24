'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Building2, CreditCard, BarChart2, Settings, LogOut, User, ShieldCheck, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'

const menuItems = [
  { name: 'Overview', path: '/superadmin/dashboard', icon: LayoutDashboard },
  { name: 'ISP Tenants', path: '/superadmin/tenants', icon: Building2 },
  { name: 'Plans', path: '/superadmin/plans', icon: CreditCard },
  { name: 'Analytics', path: '/superadmin/analytics', icon: BarChart2 },
  { name: 'Settings', path: '/superadmin/settings', icon: Settings },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('user_role')
    const userStr = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (role !== 'superadmin') {
      router.push('/dashboard')
      return
    }

    if (userStr) {
      try {
        setAdmin(JSON.parse(userStr))
      } catch (e) {
        setAdmin({ name: 'Super Admin', email: 'admin@netaxis.com' })
      }
    } else {
      setAdmin({ name: 'Super Admin', email: 'admin@netaxis.com' })
    }
    
    setLoading(false)
  }, [router])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-primary/5 rounded-full blur-[100px] md:blur-[150px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/5 rounded-full blur-[80px] md:blur-[130px] -z-10 -translate-x-1/2 translate-y-1/2" />

      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden lg:flex ${
          collapsed ? 'w-20' : 'w-72'
        } bg-navy-950/50 backdrop-blur-2xl border-r border-white/5 flex-col fixed inset-y-0 z-50 transition-all duration-500 ease-in-out group`}
      >
        {/* Collapse Toggle Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white border border-white/10 shadow-glow shadow-primary/20 z-[60] hover:scale-110 transition-transform"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-8 ${collapsed ? 'px-4' : 'px-8'} transition-all duration-500`}>
          <div className="flex items-center space-x-3 group/logo cursor-pointer overflow-hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex-shrink-0 flex items-center justify-center shadow-glow shadow-primary/40 group-hover/logo:scale-110 transition-transform duration-300">
              <ShieldCheck className="text-white" size={24} />
            </div>
            {!collapsed && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase">NETAXIS</h1>
                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-1">Super Admin</p>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 ${collapsed ? 'px-3' : 'px-6'} space-y-2 mt-4 overflow-y-auto custom-scrollbar transition-all duration-500`}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                title={collapsed ? item.name : ""}
                className={`nav-link ${isActive ? 'nav-link-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500'} flex-shrink-0`} />
                {!collapsed && <span className="font-semibold">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className={`p-6 border-t border-white/5 bg-white/5 backdrop-blur-xl ${collapsed ? 'px-3' : 'px-6'} transition-all duration-500`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'} mb-6 overflow-hidden`}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent p-[1px] flex-shrink-0">
              <div className="w-full h-full rounded-2xl bg-navy-950 flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-primary" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{admin?.name}</p>
                <p className="text-[10px] font-medium text-slate-500 truncate uppercase tracking-wider">{admin?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 text-slate-400 hover:text-danger hover:bg-danger/10 hover:border-danger/20 transition-all duration-300 text-xs font-bold uppercase tracking-widest ${collapsed ? 'px-0' : ''}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-navy-950/80 backdrop-blur-xl border-b border-white/5 z-[100] flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white" size={18} />
          </div>
          <span className="text-lg font-black text-white tracking-tighter uppercase">NETAXIS</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[110] animate-in fade-in duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Content */}
      <aside 
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-navy-950 z-[120] border-r border-white/5 flex flex-col transition-transform duration-500 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white" size={18} />
            </div>
            <span className="text-lg font-black text-white tracking-tighter uppercase">NETAXIS</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span className="font-semibold">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-white/5">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-navy-950 flex items-center justify-center border border-white/5">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{admin?.name}</p>
              <p className="text-[10px] font-medium text-slate-500 truncate uppercase tracking-wider">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 text-slate-400 hover:text-danger transition-all text-xs font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-500 ease-in-out pt-16 lg:pt-0 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto animate-in overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
