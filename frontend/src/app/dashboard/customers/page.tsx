"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { Plus, User, Phone, MapPin, Package, MoreHorizontal, Eye, Edit2, Trash2, Shield, UserX, UserCheck } from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["customers", search, page],
    queryFn: async () => {
      const response = await api.get("/customers", {
        params: { search, page, limit }
      });
      return response.data;
    },
  });

  const columns: Column<any>[] = [
    {
      header: "Customer",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{row.name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{row.customer_code}</p>
          </div>
        </div>
      )
    },
    {
      header: "Contact",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
            <Phone size={12} className="text-slate-500" />
            {row.phone}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
            <MapPin size={10} />
            {row.zone_name || 'No Zone'}
          </div>
        </div>
      )
    },
    {
      header: "Package",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
            <Package size={14} className="text-indigo-400" />
          </div>
          <span className="text-xs font-bold text-slate-300">{row.package_name || 'N/A'}</span>
        </div>
      )
    },
    {
      header: "Outstanding",
      cell: (row) => (
        <span className={`text-sm font-black ${row.due_amount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
          {formatCurrency(row.due_amount || 0)}
        </span>
      )
    },
    {
      header: "Status",
      cell: (row) => {
        const colors: any = {
          active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          inactive: "bg-slate-500/10 text-slate-500 border-slate-500/20",
          suspended: "bg-rose-500/10 text-rose-500 border-rose-500/20",
          blocked: "bg-red-500/10 text-red-500 border-red-500/20",
        };
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colors[row.status] || colors.inactive}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Customers</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Manage your subscriber base and their billing status</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2">
            <Shield size={18} />
            <span>Export</span>
          </button>
          <Link 
            href="/dashboard/customers/new" 
            className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            <span>Add Customer</span>
          </Link>
        </div>
      </div>

      <div className="glass-card p-6">
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          searchable
          searchPlaceholder="Search by name, phone, or code..."
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
                href={`/dashboard/customers/${row.id}`}
                className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-primary transition-all hover:bg-primary/10"
                title="View Details"
              >
                <Eye size={16} />
              </Link>
              <button 
                className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-emerald-400 transition-all hover:bg-emerald-400/10"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button 
                className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-rose-400 transition-all hover:bg-rose-400/10"
                title="Suspend"
              >
                <UserX size={16} />
              </button>
            </div>
          )}
          emptyMessage="No customers found matching your criteria"
        />
      </div>
    </div>
  );
}
