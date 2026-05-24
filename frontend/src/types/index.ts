export interface User {
  id: string
  name: string
  email: string
  role: string
  tenant_id?: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  address: string
  status: string
  schema_name: string
  plan_id: string
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  max_customers: number
  max_bandwidth_mbps: number
  features: string
}

export interface Customer {
  id: string
  customer_code: string
  name: string
  phone: string
  email?: string
  address?: string
  zone_id?: string
  zone?: Zone
  status: 'active' | 'inactive' | 'suspended' | 'blocked'
  wallet_balance: number
  created_at: string
}

export interface Zone {
  id: string
  name: string
  parent_id?: string
}

export interface Package {
  id: string
  name: string
  speed_download: number
  speed_upload: number
  price: number
  billing_cycle: string
  status: string
}

export interface Connection {
  id: string
  customer_id: string
  customer?: Customer
  package_id: string
  package?: Package
  username: string
  ip_address?: string
  status: 'active' | 'suspended' | 'terminated'
  created_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  customer?: Customer
  amount: number
  discount: number
  tax: number
  total: number
  paid_amount: number
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
  created_at: string
}

export interface Payment {
  id: string
  payment_number: string
  customer_id: string
  customer?: Customer
  amount: number
  method: string
  reference?: string
  notes?: string
  created_at: string
}

export interface Router {
  id: string
  name: string
  host: string
  port: number
  username: string
  model?: string
  status: 'online' | 'offline' | 'unknown'
  zone_id?: string
}

export interface Ticket {
  id: string
  ticket_number: string
  customer_id: string
  customer?: Customer
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
}

export interface Staff {
  id: string
  name: string
  phone: string
  email?: string
  role: string
  status: string
  created_at: string
}

export interface InventoryItem {
  id: string
  name: string
  sku: string
  category_id?: string
  current_stock: number
  min_stock: number
  unit_price: number
  status: string
}

export interface Reseller {
  id: string
  name: string
  phone: string
  email?: string
  wallet_balance: number
  commission_rate: number
  status: string
}

export interface HotspotProfile {
  id: string
  name: string
  speed_download: number
  speed_upload: number
  validity_hours: number
  price: number
  status: string
}

export interface HotspotVoucher {
  id: string
  code: string
  profile_id: string
  profile?: HotspotProfile
  batch_name: string
  status: 'available' | 'used' | 'expired'
  created_at: string
}

export interface DashboardStats {
  total_customers?: number
  active_customers?: number
  inactive_customers?: number
  suspended_customers?: number
  today_collection?: number
  monthly_revenue?: number
  total_due?: number
  pending_tickets?: number
  active_connections?: number
  new_connections_this_month?: number
  total_tenants?: number
  active_tenants?: number
  trial_tenants?: number
  currency_symbol: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
