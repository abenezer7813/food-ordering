export type UserRole = 'super_admin' | 'lounge_manager' | 'cashier' | 'cook'

export interface User {
  id:         string
  first_name: string
  last_name:  string
  email:      string
  role:       UserRole
  is_active:  boolean
}

export interface Lounge {
  id:         string
  name:       string
  is_active:  boolean
  manager_id: string | null
}

export interface MenuItem {
  id:                        string
  name:                      string
  description:               string | null
  price:                     string
  image_url:                 string | null
  is_available:              boolean
  estimated_preparation_time: number
}

export interface Order {
  id:                   string
  status:               'pending' | 'preparing' | 'ready' | 'collected'
  order_type:           'online' | 'walk_in'
  total_amount:         string
  estimated_ready_time: number
  created_at:           string
}