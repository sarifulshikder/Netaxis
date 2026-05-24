'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Customer, Package } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

interface InvoiceFormProps {
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
}

interface Item { description: string; quantity: number; unit_price: number }

export default function InvoiceForm({ onSubmit, loading }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<Item[]>([{ description: 'Monthly Internet Bill', quantity: 1, unit_price: 0 }])
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (customerSearch.length > 1) {
      api.get(`/customers?search=${customerSearch}&limit=5`).then(r => setCustomers(r.data.data || [])).catch(() => {})
    }
  }, [customerSearch])

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const total = subtotal - discount + tax

  const addItem = () => setItems(p => [...p, { description: '', quantity: 1, unit_price: 0 }])
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i))
  const updateItem = (i: number, k: keyof Item, v: any) => setItems(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    onSubmit({ customer_id: selectedCustomer.id, items, discount, tax, due_date: dueDate, notes })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs text-slate-400 mb-1">Customer *</label>
        <input value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setSelectedCustomer(null) }}
          placeholder="Search by name or phone..."
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
        {customers.length > 0 && !selectedCustomer && (
          <div className="mt-1 bg-slate-700 border border-slate-600 rounded-lg overflow-hidden">
            {customers.map(c => (
              <button key={c.id} type="button" onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); setCustomers([]) }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-600">
                {c.name} — {c.phone} ({c.customer_code})
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400">Items</label>
          <button type="button" onClick={addItem} className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add Item
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                placeholder="Description" className="col-span-6 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
              <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                className="col-span-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
              <input type="number" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', Number(e.target.value))}
                placeholder="Price" className="col-span-3 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
              <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-red-400 hover:text-red-300 flex justify-center">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Discount (৳)</label>
          <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Tax (৳)</label>
          <input type="number" value={tax} onChange={e => setTax(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Due Date *</label>
          <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-sky-500" />
        </div>
      </div>

      <div className="bg-slate-700/50 rounded-lg p-4 space-y-1 text-sm">
        <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        <div className="flex justify-between text-slate-400"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>
        <div className="flex justify-between text-slate-400"><span>Tax</span><span>+{formatCurrency(tax)}</span></div>
        <div className="flex justify-between text-white font-semibold border-t border-slate-600 pt-2 mt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading || !selectedCustomer}
          className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </form>
  )
}
