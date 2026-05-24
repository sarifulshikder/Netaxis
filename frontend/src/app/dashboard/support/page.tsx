"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { 
  Plus, MessageSquare, Ticket, Clock, CheckCircle, 
  AlertCircle, ShieldAlert, User, Search, Filter,
  MoreHorizontal, Eye, MessageCircle
} from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import StatsCard from "@/components/ui/StatsCard";
import Link from "next/link";

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", search, page],
    queryFn: async () => {
      const response = await api.get("/tickets", {
        params: { search, page, limit }
      });
      return response.data;
    },
  });

  const columns: Column<any>[] = [
    {
      header: "Ticket Details",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            row.priority === 'urgent' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
            row.priority === 'high' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
            'bg-primary/10 text-primary border-primary/20'
          }`}>
            <Ticket size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{row.subject}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">#{row.ticket_no || row.id.slice(0, 8)}</p>
          </div>
        </div>
      )
    },
    {
      header: "Customer",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <User size={12} className="text-slate-500" />
          <div>
            <p className="text-xs font-bold text-slate-300">{row.customer_name}</p>
            <p className="text-[10px] text-slate-500 font-medium">{row.customer_phone}</p>
          </div>
        </div>
      )
    },
    {
      header: "Category",
      cell: (row) => (
        <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-slate-400 uppercase border border-white/5">
          {row.category || 'General'}
        </span>
      )
    },
    {
      header: "Priority",
      cell: (row) => {
        const priorityColors: any = {
          urgent: "text-rose-500 bg-rose-500/10 border-rose-500/20",
          high: "text-amber-500 bg-amber-500/10 border-amber-500/20",
          medium: "text-primary bg-primary/10 border-primary/20",
          low: "text-slate-400 bg-white/5 border-white/5",
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${priorityColors[row.priority] || priorityColors.medium}`}>
            {row.priority}
          </span>
        );
      }
    },
    {
      header: "Status",
      cell: (row) => {
        const statusColors: any = {
          open: "text-rose-400",
          "in-progress": "text-amber-400",
          resolved: "text-emerald-400",
          closed: "text-slate-500",
        };
        return (
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${statusColors[row.status] || 'bg-slate-500'} animate-pulse`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{row.status}</span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Support Desk</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Manage technical issues and customer inquiries</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2">
            <ShieldAlert size={18} />
            <span>Escalations</span>
          </button>
          <button className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20">
            <Plus size={18} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Open Tickets" value={data?.summary?.open || 0} icon={AlertCircle} color="bg-rose-500" />
        <StatsCard title="In Progress" value={data?.summary?.in_progress || 0} icon={Clock} color="bg-amber-500" />
        <StatsCard title="Resolved Today" value={data?.summary?.resolved_today || 0} icon={CheckCircle} color="bg-emerald-500" />
        <StatsCard title="Avg. Response" value="14m" icon={MessageSquare} color="bg-primary" />
      </div>

      <div className="glass-card p-6">
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          searchable
          onSearch={setSearch}
          pagination={{
            page,
            limit,
            total: data?.total || 0,
            onPageChange: setPage
          }}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <Link 
                href={`/dashboard/support/${row.id}`}
                className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-primary transition-all hover:bg-primary/10"
                title="View Conversation"
              >
                <MessageCircle size={16} />
              </Link>
              <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-emerald-400 transition-all hover:bg-emerald-400/10" title="Resolve">
                <CheckCircle size={16} />
              </button>
            </div>
          )}
          emptyMessage="No pending tickets. Your customers are happy!"
        />
      </div>
    </div>
  );
}
