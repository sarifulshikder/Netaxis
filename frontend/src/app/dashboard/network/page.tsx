"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Network, Plus, Wifi, WifiOff, RefreshCw, Activity } from "lucide-react";
import Link from "next/link";

export default function NetworkPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["routers"],
    queryFn: async () => {
      const response = await api.get("/routers");
      return response.data;
    },
  });

  const handleTest = async (id: string) => {
    try {
      await api.post(`/routers/${id}/test`);
      toast.success("Router is online");
    } catch {
      toast.error("Router is offline");
    }
  };

  const routers = data?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Network <span className="text-primary">Routers</span></h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor your MikroTik routers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw size={18} />
          </button>
          <Link
            href="/dashboard/network/routers"
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/80 transition-all"
          >
            <Plus size={18} />
            <span>Add Router</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      ) : routers.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-6 text-center">
          <div className="p-6 bg-primary/10 rounded-3xl text-primary">
            <Network size={48} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-2">No Routers Added</h3>
            <p className="text-slate-500 font-medium">Add your first MikroTik router to get started.</p>
          </div>
          <Link
            href="/dashboard/network/routers"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/80 transition-all"
          >
            <Plus size={18} />
            <span>Add First Router</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routers.map((router: any) => (
            <div key={router.id} className="glass-card p-6 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Network size={20} />
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                  router.is_online
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}>
                  {router.is_online ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {router.is_online ? "Online" : "Offline"}
                </span>
              </div>
              <h3 className="font-black text-white text-lg">{router.name}</h3>
              <p className="text-slate-500 text-sm mt-1 mb-4">{router.host}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTest(router.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all"
                >
                  <Activity size={14} />
                  Test
                </button>
                <button className="flex-1 py-2.5 bg-white/5 text-slate-400 rounded-xl text-xs font-bold hover:bg-white/10 hover:text-white transition-all">
                  Sync
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
