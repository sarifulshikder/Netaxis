import { create } from 'zustand'
import { User } from '@/types'

interface AppStore {
  user: User | null
  tenantName: string
  notifications: number
  sidebarOpen: boolean
  setUser: (user: User | null) => void
  setTenantName: (name: string) => void
  setNotifications: (count: number) => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  tenantName: 'NETAXIS',
  notifications: 0,
  sidebarOpen: true,
  setUser: (user) => set({ user }),
  setTenantName: (tenantName) => set({ tenantName }),
  setNotifications: (notifications) => set({ notifications }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
