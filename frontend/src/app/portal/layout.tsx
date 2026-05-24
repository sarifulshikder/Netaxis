'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FileText, CreditCard, LifeBuoy, LogOut, User, Bell } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', path: '/portal/dashboard', icon: LayoutDashboard },
  { name: 'My Bills', path: '/portal/bills', icon: FileText },
  { name: 'Payments', path: '/portal/payments', icon: CreditCard },
  { name: 'Support', path: '/portal/tickets', icon: LifeBuoy },
]

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('user_role')
    const userStr = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (role !== 'customer') {
      router.push('/dashboard')
      return
    }

    if (userStr) setCustomer(JSON.parse(userStr))
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-[#f1f5f9]">Loading Portal...</div>

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9]">
      {/* Top Navbar */}
      <header className="bg-[#1e293b] border-b border-[#334155] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="text-xl font-bold text-[#0ea5e9]">NETAXIS <span className="text-[10px] text-[#475569] uppercase font-bold tracking-widest ml-1">Portal</span></div>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' 
                          : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155]'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#ef4444] rounded-full border-2 border-[#1e293b]"></span>
              </button>
              <div className="h-8 w-px bg-[#334155]"></div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                  <p className="text-xs font-bold text-[#f1f5f9]">{customer?.name || 'Customer'}</p>
                  <p className="text-[10px] text-[#475569] uppercase font-bold tracking-tighter">ID: {customer?.customer_code || '12345'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9]">
                  <User className="w-5 h-5" />
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-[#334155] px-4 py-2 flex items-center justify-around z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive ? 'text-[#0ea5e9]' : 'text-[#475569]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
