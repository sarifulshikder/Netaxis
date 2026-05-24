"use client";
import { Bell, User, Search, ChevronDown, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser({ name: "Admin User", email: "admin@netaxis.com" });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="h-16 lg:h-20 bg-background/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 mt-16 lg:mt-0">
      {/* Search - hidden on mobile */}
      <div className="hidden md:flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-navy-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Mobile: empty div for spacing */}
      <div className="md:hidden flex-1" />

      <div className="flex items-center space-x-3 lg:space-x-6">
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </button>
        <div className="h-8 w-px bg-white/5 hidden md:block" />
        <div className="flex items-center space-x-2 p-1 pr-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
            <User size={18} className="text-white" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-white leading-none">{user?.name || "Admin User"}</p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">Administrator</p>
          </div>
          <ChevronDown size={14} className="text-slate-500 hidden md:block" />
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
