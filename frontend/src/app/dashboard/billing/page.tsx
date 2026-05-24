"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { Plus, Send, FileText, Download, Filter, MoreHorizontal, Printer, CheckCircle, Clock, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import StatsCard from "@/components/ui/StatsCard";

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["invoices", search, page],
    queryFn: async () => {
      const response = await api.get("/invoices", {
        params: { search, page, limit }
      });
      return response.data;
    },
  });

  const handleBulkGenerate = async () => {
    const confirm = window.confirm("Are you sure you want to generate monthly invoices for all active customers?");
    if (!confirm) return;

    try {
      await api.post("/invoices/bulk-generate");
      toast.success("Bulk invoices generated successfully");
      refetch();
    } catch {
      toast.error("Failed to generate bulk invoices");
    }
  };

  const columns: Column<any>[] = [
    {
      header: "Invoice #",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FileText size={14} />
          </div>
          <span className="text-xs font-mono font-bold text-white uppercase tracking-tighter">
            {row.invoice_no || `INV-${row.id.slice(0, 8)}`}
          </span>
        </div>
      )
    },
    {
      header: "Customer",
      cell: (row) => (
        <div>
          <p className="text-sm font-bold text-slate-200">{row.customer_name}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{row.customer_code}</p>
        </div>
      )
    },
    {
      header: "Period",
      cell: (row) => (
        <div className="text-[10px] text-slate-400 font-medium">
          {formatDate(row.billing_period_start)} - {formatDate(row.billing_period_end)}
        </div>
      )
    },
    {
      header: "Amount",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="text-sm font-black text-white">{formatCurrency(row.total_amount)}</p>
          {row.paid_amount > 0 && (
            <p className="text-[10px] text-emerald-500 font-bold">Paid: {formatCurrency(row.paid_amount)}</p>
          )}
        </div>
      )
    },
    {
      header: "Status",
      cell: (row) => {
        const statusConfig: any = {
          paid: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
          pending: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
          overdue: { color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: AlertTriangle },
          void: { color: "bg-slate-500/10 text-slate-500 border-slate-500/20", icon: XCircle },
        };
        const config = statusConfig[row.status] || statusConfig.pending;
        const Icon = config.icon;
        return (
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
            <Icon size={10} />
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
          <h1 className="text-3xl font-black text-white tracking-tight">Billing & Invoices</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Monitor revenue and manage customer billing cycles</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBulkGenerate}
            className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Bulk Generate</span>
          </button>
          <Link 
            href="/dashboard/billing/new" 
            className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Invoices" value={data?.total || 0} icon={FileText} color="bg-primary" />
        <StatsCard title="Total Amount" value={data?.summary?.total_amount || 0} icon={DollarSign} color="bg-indigo-500" currency />
        <StatsCard title="Total Collected" value={data?.summary?.total_paid || 0} icon={CheckCircle} color="bg-emerald-500" currency />
        <StatsCard title="Overdue Amount" value={(data?.summary?.total_amount - data?.summary?.total_paid) || 0} icon={AlertTriangle} color="bg-rose-500" currency />
      </div>

      <div className="glass-card p-6">
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          searchable
          searchPlaceholder="Search by invoice # or customer..."
          onSearch={setSearch}
          pagination={{
            page,
            limit,
            total: data?.total || 0,
            onPageChange: setPage
          }}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <button 
                className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-primary transition-all hover:bg-primary/10"
                title="View PDF"
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${row.id}/pdf`, '_blank')}
              >
                <Download size={16} />
              </button>
              <button 
                className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-emerald-400 transition-all hover:bg-emerald-400/10"
                title="Send Reminder"
              >
                <Send size={16} />
              </button>
              <button 
                className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-amber-400 transition-all hover:bg-amber-400/10"
                title="Print Receipt"
              >
                <Printer size={16} />
              </button>
            </div>
          )}
          emptyMessage="No invoices found in the current period"
        />
      </div>
    </div>
  );
}
