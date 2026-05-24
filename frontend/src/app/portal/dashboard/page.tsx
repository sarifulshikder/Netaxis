"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function PortalDashboardPage() {
  const { data } = useQuery({
    queryKey: ["portalStats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Connection</h1>
      <div className="bg-navy-800 p-6 rounded-lg border border-navy-700">
        <p className="text-slate-400">Status</p>
        <div className="text-2xl font-bold text-success uppercase">Active</div>
        <div className="mt-4">
          <p className="text-slate-400">Current Package</p>
          <div className="text-lg font-semibold">10 Mbps Home Plan</div>
        </div>
      </div>
    </div>
  );
}
