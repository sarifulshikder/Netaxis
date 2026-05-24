"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function HotspotPage() {
  const { data } = useQuery({
    queryKey: ["hotspotProfiles"],
    queryFn: async () => {
      const response = await api.get("/hotspot/profiles");
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hotspot Profiles</h1>
      <div className="bg-navy-800 rounded-lg border border-navy-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-900 text-slate-400 text-sm text-left">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Rate Limit</th>
              <th className="p-4">Price</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data?.data?.map((profile: any) => (
              <tr key={profile.id} className="border-t border-navy-700">
                <td className="p-4">{profile.name}</td>
                <td className="p-4">{profile.rate_limit}</td>
                <td className="p-4">৳{profile.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
