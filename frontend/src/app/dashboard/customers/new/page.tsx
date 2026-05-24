"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const customerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(5),
  zone_id: z.string().uuid(),
});

export default function NewCustomerPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      await api.post("/customers", data);
      toast.success("Customer created successfully");
      router.push("/dashboard/customers");
    } catch (error) {
      toast.error("Failed to create customer");
    }
  };

  return (
    <div className="max-w-2xl bg-navy-800 p-6 rounded-lg border border-navy-700">
      <h1 className="text-xl font-bold mb-6">New Customer</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300">Name</label>
          <input {...register("name")} className="w-full mt-1 p-2 bg-navy-700 border-none rounded text-white" />
        </div>
        <div>
          <label className="block text-sm text-slate-300">Phone</label>
          <input {...register("phone")} className="w-full mt-1 p-2 bg-navy-700 border-none rounded text-white" />
        </div>
        <div>
          <label className="block text-sm text-slate-300">Address</label>
          <textarea {...register("address")} className="w-full mt-1 p-2 bg-navy-700 border-none rounded text-white" />
        </div>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-sky-600">Save Customer</button>
      </form>
    </div>
  );
}
