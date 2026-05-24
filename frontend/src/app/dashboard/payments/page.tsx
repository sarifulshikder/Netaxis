"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function PaymentsPage() {
  const { data } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const response = await api.get("/payments");
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <div className="bg-navy-800 rounded-lg border border-navy-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-900 text-slate-400 text-sm text-left">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Method</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data?.data?.map((pay: any) => (
              <tr key={pay.id} className="border-t border-navy-700 hover:bg-navy-700">
                <td className="p-4">{pay.customer_name}</td>
                <td className="p-4">৳{pay.amount}</td>
                <td className="p-4">{pay.method}</td>
                <td className="p-4">{new Date(pay.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
