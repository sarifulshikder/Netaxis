'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface CollectionChartProps {
  data: { date: string; amount: number }[]
}

export default function CollectionChart({ data }: CollectionChartProps) {
  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
      <h3 className="text-sm font-medium text-[#94a3b8] mb-4">Daily Collection</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#94a3b8', fontSize: 11 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 11 }} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={v => `৳${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} 
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            itemStyle={{ color: '#0ea5e9' }}
            labelStyle={{ color: '#f1f5f9', marginBottom: '4px' }}
            formatter={(v: number) => [formatCurrency(v), 'Amount']}
            cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
          />
          <Bar 
            dataKey="amount" 
            fill="#0ea5e9" 
            radius={[4, 4, 0, 0]} 
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
