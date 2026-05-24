'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

interface RevenueChartProps {
  data: { month: string; revenue: number }[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="text-primary" size={18} />
          Revenue Trend
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">Monthly Revenue</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
            tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} 
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
            itemStyle={{ color: '#0ea5e9', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '800' }}
            formatter={(v: number) => [formatCurrency(v), 'Revenue']}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#0ea5e9" 
            strokeWidth={4} 
            dot={{ fill: '#0ea5e9', stroke: '#0f172a', strokeWidth: 2, r: 6 }} 
            activeDot={{ r: 8, strokeWidth: 0 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
