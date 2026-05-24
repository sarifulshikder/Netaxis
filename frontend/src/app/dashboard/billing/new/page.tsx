'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Trash2, ArrowLeft, User, Calendar, FileText, Check } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

const apiFetch = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

interface Item {
  description: string
  quantity: number
  unit_price: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unit_price: 0 }])
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [lateFee, setLateFee] = useState(0)
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (search.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await apiFetch(`/customers?search=${search}`)
          setCustomers(res.data || [])
          setShowDropdown(true)
        } catch (error) {
          console.error('Search error:', error)
        }
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowDropdown(false)
    }
  }, [search])

  const selectCustomer = async (customer: any) => {
    setSelectedCustomer(customer)
    setSearch('')
    setShowDropdown(false)
    
    // Auto-fill first item with customer's package if available
    try {
      const res = await apiFetch(`/connections?customer_id=${customer.id}`)
      if (res.data && res.data.length > 0) {
        const pkg = res.data[0]
        setItems([{ 
          description: `Internet Service - ${pkg.package_name}`, 
          quantity: 1, 
          unit_price: pkg.package_price || 0 
        }])
      }
    } catch (e) {}
  }

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
  const taxAmount = (subtotal * tax) / 100
  const grandTotal = subtotal + taxAmount + lateFee - discount

  const handleSubmit = async () => {
    if (!selectedCustomer) return alert('Please select a customer')
    if (items.some(item => !item.description || item.unit_price <= 0)) return alert('Please fill in all item details')

    setSubmitting(true)
    try {
      await apiFetch('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          items: items.map(item => ({ ...item, total: item.quantity * item.unit_price })),
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discount,
          late_fee: lateFee,
          total_amount: grandTotal,
          due_date: dueDate,
          notes
        })
      })
      router.push('/dashboard/billing')
    } catch (error) {
      alert('Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Create New Invoice</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Generate a manual invoice for a customer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Customer Search */}
          {!selectedCustomer ? (
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-[#0ea5e9]/10 rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-[#0ea5e9]" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-bold text-[#f1f5f9]">Find Customer</h3>
                <p className="text-[#94a3b8] text-sm">Search by name, customer code, or phone number to start the invoice.</p>
              </div>
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-[#334155] rounded-2xl pl-12 pr-4 py-4 text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#0ea5e9] transition-all shadow-xl"
                  placeholder="Type name or phone number..."
                />
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl z-50 overflow-hidden">
                    {customers.length > 0 ? customers.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => selectCustomer(c)}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#334155] transition-colors text-left border-b border-[#334155] last:border-0"
                      >
                        <div>
                          <p className="text-[#f1f5f9] font-semibold">{c.name}</p>
                          <p className="text-[#94a3b8] text-xs">ID: {c.customer_code} • {c.phone}</p>
                        </div>
                        <Plus className="w-4 h-4 text-[#0ea5e9]" />
                      </button>
                    )) : (
                      <div className="p-4 text-[#94a3b8] text-sm italic">No customers found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Customer Card */}
              <div className="bg-[#1e293b] rounded-2xl border border-[#0ea5e9]/30 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0ea5e9]/10 rounded-xl flex items-center justify-center text-[#0ea5e9]">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[#f1f5f9] font-bold">{selectedCustomer.name}</p>
                    <p className="text-[#94a3b8] text-xs">CODE: {selectedCustomer.customer_code} • {selectedCustomer.phone}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-[#ef4444] text-sm font-medium hover:underline">Change</button>
              </div>

              {/* Items Table */}
              <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
                <div className="p-4 border-b border-[#334155] bg-[#0f172a]/50">
                  <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">Invoice Items</h3>
                </div>
                <table className="w-full">
                  <thead className="bg-[#0f172a] text-[#94a3b8] text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3 text-left">Description</th>
                      <th className="px-6 py-3 text-center w-24">Qty</th>
                      <th className="px-6 py-3 text-right w-32">Unit Price</th>
                      <th className="px-6 py-3 text-right w-32">Total</th>
                      <th className="px-6 py-3 text-right w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {items.map((item, index) => (
                      <tr key={index} className="group">
                        <td className="px-6 py-4">
                          <input 
                            type="text" 
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Service description"
                            className="w-full bg-transparent text-[#f1f5f9] placeholder-[#475569] focus:outline-none"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                            className="w-full bg-transparent text-center text-[#f1f5f9] focus:outline-none"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                            className="w-full bg-transparent text-right text-[#f1f5f9] focus:outline-none"
                          />
                        </td>
                        <td className="px-6 py-4 text-right text-[#f1f5f9] font-semibold">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {items.length > 1 && (
                            <button onClick={() => removeItem(index)} className="text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 border-t border-[#334155]">
                  <button onClick={addItem} className="text-[#0ea5e9] text-xs font-bold flex items-center gap-1 hover:underline">
                    <Plus className="w-3 h-3" /> ADD LINE ITEM
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-4">
                <label className="block text-sm font-medium text-[#94a3b8]">Internal Notes / Payment Instructions</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#0ea5e9] h-24 resize-none"
                  placeholder="Include any special instructions for this invoice..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-6 sticky top-8">
            <h3 className="font-bold text-[#f1f5f9] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0ea5e9]" /> Invoice Summary
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] mb-2 uppercase tracking-wider">Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg pl-10 pr-3 py-2 text-[#f1f5f9] focus:outline-none focus:border-[#0ea5e9] text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#334155] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94a3b8]">Subtotal</span>
                  <span className="text-[#f1f5f9] font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#94a3b8] text-sm">Tax (%)</span>
                  <input 
                    type="number" 
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-20 bg-[#0f172a] border border-[#334155] rounded px-2 py-1 text-right text-[#f1f5f9] text-sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#94a3b8] text-sm">Discount (৳)</span>
                  <input 
                    type="number" 
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-20 bg-[#0f172a] border border-[#334155] rounded px-2 py-1 text-right text-[#f1f5f9] text-sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#94a3b8] text-sm">Late Fee (৳)</span>
                  <input 
                    type="number" 
                    value={lateFee}
                    onChange={(e) => setLateFee(Number(e.target.value))}
                    className="w-20 bg-[#0f172a] border border-[#334155] rounded px-2 py-1 text-right text-[#f1f5f9] text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#334155]">
                <div className="flex justify-between items-center">
                  <span className="text-[#f1f5f9] font-bold">Grand Total</span>
                  <span className="text-2xl font-bold text-[#0ea5e9]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={submitting || !selectedCustomer}
              className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 disabled:bg-[#334155] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#0ea5e9]/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Processing...' : (
                <>
                  <Check className="w-5 h-5" /> Generate Invoice
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
