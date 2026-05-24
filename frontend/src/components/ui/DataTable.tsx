'use client'
import { useState, ReactNode } from 'react'
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

export interface Column<T> {
  header: string
  accessor?: keyof T
  cell?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (q: string) => void
  pagination?: { page: number; total: number; limit: number; onPageChange: (p: number) => void }
  onRowClick?: (row: T) => void
  actions?: (row: T) => ReactNode
  emptyMessage?: string
}

export default function DataTable<T extends { id?: string }>({
  columns, data, loading, searchable, searchPlaceholder = 'Search...', onSearch,
  pagination, onRowClick, actions, emptyMessage = 'No data found'
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')

  const handleSearch = (v: string) => {
    setQuery(v)
    onSearch?.(v)
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {searchable && (
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-navy-900/40 border border-white/5 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button className="p-2.5 bg-navy-900/40 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all hover:border-white/10">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-navy-950/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                {columns.map((col, i) => (
                  <th key={i} className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
                {actions && <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="py-20"><LoadingSpinner /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="py-20 text-center text-slate-500 font-medium">{emptyMessage}</td></tr>
              ) : data.map((row, ri) => (
                <tr
                  key={(row as any).id || ri}
                  onClick={() => onRowClick?.(row)}
                  className={`group hover:bg-white/5 transition-all duration-200 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, ci) => (
                    <td key={ci} className={`px-6 py-4 text-slate-300 group-hover:text-white transition-colors ${col.className || ''}`}>
                      {col.cell ? col.cell(row) : col.accessor ? String(row[col.accessor] ?? '-') : '-'}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.total > pagination.limit && (
        <div className="flex items-center justify-between px-2 text-sm text-slate-500 font-medium">
          <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            Showing <span className="text-white font-bold">{((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-white font-bold">{pagination.total}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-xl bg-navy-900/40 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            ><ChevronLeft className="h-5 w-5" /></button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="p-2 rounded-xl bg-navy-900/40 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            ><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
