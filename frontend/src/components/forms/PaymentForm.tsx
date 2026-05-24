'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Customer } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface PaymentFormProps {
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
  preselectedCustomer?: Customer
}

export default function PaymentForm({ onSubmit, loading, preselectedCustomer }: PaymentFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState(preselectedCustomer?.name || '')
  const [selected, setSelected] = useState<Customer | null>(preselectedCustomer || null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (search.length > 1 && !selected) {
      api.get(`/customers?search=${search}&limit=5`).then(r => setCustomers(r.data.data || [])).catch(() => {})
    }
  }, [search, selected])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    onSubmit({ customer_id: selected.id, amount: Number(amount), method, reference, notes })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 mb-1">Customer *</label>
        <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null) }}
          placeholder="Search by name or phone..."
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
        {customers.length > 0 && !selected && (
          <div className="mt-1 bg-slate-700 border border-slate-600 rounded-lg overflow-hidden">
            {customers.map(c => (
              <button key={c.id} type="button" onClick={() => { setSelected(c); setSearch(c.name); setCustomers([]) }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-600">
                {c.name} — {c.phone} | Due: {formatCurrency(c.wallet_balance < 0 ? Math.abs(c.wallet_balance) : 0)}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Amount (৳) *</label>
          <input required type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Method *</label>
          <select value={method} onChange={e => setMethod(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500">
            <option value="cash">Cash</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="bank">Bank Transfer</option>
            <option value="card">Card</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Reference/Transaction ID</label>
        <input value={reference} onChange={e => setReference(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Notes</label>
        <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={loading || !selected || !amount}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Processing...' : 'Collect Payment'}
        </button>
      </div>
    </form>
  )
}
