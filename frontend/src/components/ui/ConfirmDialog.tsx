'use client'
import Modal from './Modal'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className={`p-4 rounded-2xl ${danger ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'} animate-bounce-slow`}>
          <AlertTriangle size={32} />
        </div>
        <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
          {message}
        </p>
      </div>
      
      <div className="flex gap-3 justify-center">
        <button 
          onClick={onClose} 
          className="flex-1 px-4 py-3 text-sm font-bold text-slate-400 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 premium-button ${danger ? 'bg-danger shadow-glow shadow-danger/20' : 'bg-primary shadow-glow shadow-primary/20'} text-white text-sm font-bold flex items-center justify-center`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
