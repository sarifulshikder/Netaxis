"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { 
  Plus, Archive, Package, ShoppingCart, 
  ArrowUpRight, ArrowDownRight, Search, 
  AlertTriangle, History, Truck
} from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import StatsCard from "@/components/ui/StatsCard";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", search, page],
    queryFn: async () => {
      const response = await api.get("/inventory/items", {
        params: { search, page, limit }
      });
      return response.data;
    },
  });

  const columns: Column<any>[] = [
    {
      header: "Item Name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Package size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{row.name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{row.sku || 'No SKU'}</p>
          </div>
        </div>
      )
    },
    {
      header: "Category",
      cell: (row) => (
        <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-slate-400 uppercase border border-white/5">
          {row.category_name || row.category || 'General'}
        </span>
      )
    },
    {
      header: "Stock Level",
      cell: (row) => {
        const isLow = row.current_stock <= row.min_stock_level;
        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-black ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
              {row.current_stock}
            </span>
            {isLow && <AlertTriangle size={14} className="text-rose-500 animate-pulse" />}
          </div>
        );
      }
    },
    {
      header: "Unit Price",
      cell: (row) => (
        <span className="text-sm font-bold text-slate-300">
          {formatCurrency(row.unit_price || 0)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Inventory</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Track hardware stock, CPEs, and infrastructure assets</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="premium-button bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center space-x-2">
            <History size={18} />
            <span>History</span>
          </button>
          <button className="premium-button primary-glow bg-primary text-white flex items-center space-x-2 shadow-lg shadow-primary/20">
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Items" value={data?.total || 0} icon={Archive} color="bg-primary" />
        <StatsCard title="Low Stock Alerts" value={data?.data?.filter((i:any) => i.current_stock <= i.min_stock_level).length || 0} icon={AlertTriangle} color="bg-rose-500" />
        <StatsCard title="Total Asset Value" value={data?.summary?.total_value || 0} icon={ShoppingCart} color="bg-indigo-500" currency />
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
              <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-primary transition-all hover:bg-primary/10" title="Restock">
                <ArrowUpRight size={16} />
              </button>
              <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-emerald-400 transition-all hover:bg-emerald-400/10" title="Assign">
                <Truck size={16} />
              </button>
            </div>
          )}
          emptyMessage="Inventory is empty. Add hardware items to start tracking."
        />
      </div>
    </div>
  );
}
