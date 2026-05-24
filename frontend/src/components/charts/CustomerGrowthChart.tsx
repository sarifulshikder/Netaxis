'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users } from 'lucide-react'

interface CustomerGrowthChartProps {
  data: { month: string; customers: number }[]
}

export default function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <Users className="text-success" size={18} />
          Customer Growth
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">New Signups</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
          />
          <YAxis 
            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
            itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '800' }}
            formatter={(v: number) => [v, 'Customers']}
          />
          <Bar 
            dataKey="customers" 
            fill="#10b981" 
            radius={[6, 6, 0, 0]} 
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
