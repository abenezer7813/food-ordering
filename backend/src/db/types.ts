import type { InferInsertModel,InferSelectModel } from "drizzle-orm"
import {
  users, lounges, lounge_staff, customers,
  non_cafe_customers, wallets, wallet_transactions,
  menu_items, orders, order_items,
  payments, customer_feedback, sales_report
} from "./schema.js"

// Users
export type User        = InferSelectModel<typeof users>
export type NewUser     = InferInsertModel<typeof users>

// Lounges
export type Lounge      = InferSelectModel<typeof lounges>
export type NewLounge   = InferInsertModel<typeof lounges>

// Staff
export type LoungeStaff    = InferSelectModel<typeof lounge_staff>
export type NewLoungeStaff = InferInsertModel<typeof lounge_staff>

// Customers
export type Customer    = InferSelectModel<typeof customers>
export type NewCustomer = InferInsertModel<typeof customers>

// Menu
export type MenuItem    = InferSelectModel<typeof menu_items>
export type NewMenuItem = InferInsertModel<typeof menu_items>

// Orders
export type Order       = InferSelectModel<typeof orders>
export type NewOrder    = InferInsertModel<typeof orders>

// Order Items
export type OrderItem    = InferSelectModel<typeof order_items>
export type NewOrderItem = InferInsertModel<typeof order_items>

// Payments
export type Payment     = InferSelectModel<typeof payments>
export type NewPayment  = InferInsertModel<typeof payments>

// Wallets
export type Wallet      = InferSelectModel<typeof wallets>
export type NewWallet   = InferInsertModel<typeof wallets>