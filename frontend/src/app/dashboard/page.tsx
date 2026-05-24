"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import StatsCard from "@/components/ui/StatsCard";
import RevenueChart from "@/components/charts/RevenueChart";
import CustomerGrowthChart from "@/components/charts/CustomerGrowthChart";
import { 
  Users, DollarSign, Activity, Ticket, Calendar, Plus, 
  ArrowUpRight, ArrowDownRight, CreditCard, Clock, MessageSquare,
  Package, Receipt, Zap
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data;
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[600px]">
      <LoadingSpinner />
    </div>
  );

  const stats = data?.data || {};
  const currentDate = format(new Date(), "EEEE, MMMM do, yyyy");

  const revenueData = stats.revenue_history || [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const growthData = stats.growth_history || [
    { month: 'Jan', customers: 120 },
    { month: 'Feb', customers: 135 },
    { month: 'Mar', customers: 150 },
    { month: 'Apr', customers: 180 },
    { month: 'May', customers: 210 },
    { month: 'Jun', customers: 245 },
  ];

  const quickActions = [
    { label: "New Customer", icon: Plus, href: "/dashboard/customers/new", color: "text-primary" },
    { label: "New Invoice", icon: Receipt, href: "/dashboard/billing/new", color: "text-success" },
    { label: "Collect Payment", icon: CreditCard, href: "/dashboard/payments", color: "text-warning" },
    { label: "New Ticket", icon: MessageSquare, href: "/dashboard/support", color: "text-purple-400" },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
          <div className="flex items-center text-slate-500 mt-2 font-medium">
            <Calendar size={16} className="mr-2 text-primary" />
            <span>{currentDate}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            href="/dashboard/reports"
            className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2"
          >
            <Activity size={18} />
            <span>Reports</span>
          </Link>
          <button className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20">
            <Zap size={18} />
            <span>Network Sync</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <Link 
            key={i} 
            href={action.href}
            className="glass-card p-4 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-3 text-center group"
          >
            <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${action.color}`}>
              <action.icon size={24} />
            </div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatsCard title="Total Customers" value={stats.total_customers || 0} icon={Users} color="bg-primary" />
        <StatsCard title="Active Connections" value={stats.active_customers || 0} icon={Activity} color="bg-success" trend="+5.2%" trendLabel="from last month" />
        <StatsCard title="Monthly Revenue" value={stats.monthly_revenue || 0} icon={DollarSign} color="bg-indigo-500" currency trend="+12.5%" trendLabel="vs prev. month" />
        <StatsCard title="Today's Collection" value={stats.today_collection || 0} icon={CreditCard} color="bg-emerald-500" currency />
        <StatsCard title="Outstanding Due" value={stats.total_due || 0} icon={DollarSign} color="bg-rose-500" currency />
        <StatsCard title="Support Tickets" value={stats.pending_tickets || 0} icon={Ticket} color="bg-amber-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueChart data={revenueData} />
        <CustomerGrowthChart data={growthData} />
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Payments */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="text-primary" size={20} />
              Recent Payments
            </h3>
            <Link href="/dashboard/payments" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recent_payments?.length > 0 ? stats.recent_payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-200">{p.customer_name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{p.customer_code}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">{formatDate(p.payment_date)}</td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-400">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-slate-400 uppercase border border-white/5">
                        {p.payment_method}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <Clock size={32} />
                        <p className="text-sm font-medium">No recent payments</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Tickets */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="text-amber-500" size={20} />
              Pending Tickets
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recent_tickets?.length > 0 ? stats.recent_tickets.map((t: any) => (
              <div key={t.id} className="p-4 hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-slate-200 line-clamp-1">{t.subject}</p>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                    t.priority === 'urgent' ? 'bg-rose-500/20 text-rose-500' : 
                    t.priority === 'high' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{t.customer_name}</p>
                  <span className="text-[10px] text-slate-600 font-medium">{formatDate(t.created_at)}</span>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center opacity-30">
                <MessageSquare className="mx-auto mb-2" size={32} />
                <p className="text-sm font-medium">All caught up!</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-white/5 border-t border-white/5">
            <Link href="/dashboard/support" className="w-full block py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
              Manage All Tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
