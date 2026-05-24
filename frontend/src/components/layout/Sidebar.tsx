"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, FileText, CreditCard, Network, Wifi,
  LifeBuoy, Archive, UserCheck, Map, Handshake, BookOpen,
  BarChart2, Settings, Package, LogOut, ChevronLeft, ChevronRight,
  Menu, X, ShieldCheck
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", path: "/dashboard/customers", icon: Users },
  { name: "Packages", path: "/dashboard/packages", icon: Package },
  { name: "Billing", path: "/dashboard/billing", icon: FileText },
  { name: "Payments", path: "/dashboard/payments", icon: CreditCard },
  { name: "Network", path: "/dashboard/network", icon: Network },
  { name: "Hotspot", path: "/dashboard/hotspot", icon: Wifi },
  { name: "Support", path: "/dashboard/support", icon: LifeBuoy },
  { name: "Inventory", path: "/dashboard/inventory", icon: Archive },
  { name: "Staff", path: "/dashboard/staff", icon: UserCheck },
  { name: "Zones", path: "/dashboard/zones", icon: Map },
  { name: "Resellers", path: "/dashboard/resellers", icon: Handshake },
  { name: "Accounting", path: "/dashboard/accounting", icon: BookOpen },
  { name: "Reports", path: "/dashboard/reports", icon: BarChart2 },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const NavLinks = () => (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
        return (
          <Link
            key={item.path}
            href={item.path}
            title={collapsed ? item.name : ""}
            className={`nav-link ${isActive ? "nav-link-active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
          >
            <Icon size={20} className={`${isActive ? "text-white" : "text-slate-500"} flex-shrink-0`} />
            {!collapsed && <span className="font-semibold">{item.name}</span>}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-navy-950/80 backdrop-blur-xl border-b border-white/5 z-[100] flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Network className="text-white" size={18} />
          </div>
          <span className="text-lg font-black text-white tracking-tighter uppercase">NETAXIS</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[110]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-navy-950 z-[120] border-r border-white/5 flex flex-col transition-transform duration-500 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Network className="text-white" size={18} />
            </div>
            <span className="text-lg font-black text-white tracking-tighter uppercase">NETAXIS</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLinks />
        </nav>
        <div className="p-6 border-t border-white/5 bg-white/5 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${
          collapsed ? "w-20" : "w-64"
        } bg-navy-950/50 backdrop-blur-2xl border-r border-white/5 flex-col fixed inset-y-0 z-50 transition-all duration-500 ease-in-out`}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg z-[60] hover:scale-110 transition-transform"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <div className={`p-6 ${collapsed ? "px-4" : "px-6"} transition-all duration-500 shrink-0`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg">
              <Network className="text-white" size={22} />
            </div>
            {!collapsed && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h1 className="text-xl font-black text-white tracking-tighter uppercase">NETAXIS</h1>
                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-1">ISP Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className={`flex-1 ${collapsed ? "px-3" : "px-4"} space-y-2 overflow-y-auto custom-scrollbar transition-all duration-500`}>
          <NavLinks />
        </nav>

        {/* Logout */}
        <div className={`p-4 border-t border-white/5 bg-white/5 ${collapsed ? "px-3" : "px-4"} transition-all duration-500 shrink-0`}>
          <button
            onClick={handleLogout}
            title={collapsed ? "Sign Out" : ""}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-xs font-bold uppercase tracking-widest ${collapsed ? "px-0" : ""}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Spacer for desktop layout */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-500 ${collapsed ? "w-20" : "w-64"}`} />
    </>
  );
}
