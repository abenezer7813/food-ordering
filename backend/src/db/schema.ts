import { uuid,decimal,integer,pgTable,varchar ,boolean, timestamp, uniqueIndex, primaryKey, text} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"

export const userRoleEnum=pgEnum('user_role',[
    'super_admin',
    'lounge_manager',
    'cashier',
    'cook'
    
])
export const orderStatusEnum=pgEnum('order_status',[
    'pending',
    'preparing',
    'ready',
    'collected'
])
export const ordertypeEnum=pgEnum('order_type',
    [
        'walk_in',
        'online'
    ]
)
export  const paymentMethodEnum=pgEnum('payment_method',[
    'cash',
    'wallet',
    'chapa'
])
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed"
])

export const payerTypeEnum = pgEnum("payer_type", [
  "non_cafe",
  "cafe",
  "walk_in"
])

export const registrationMethodEnum = pgEnum("registration_method", [
  "email",
  "google"
])

export const transactionTypeEnum = pgEnum("transaction_type", [
  "top_up",
  "deduction"
])

export const periodTypeEnum = pgEnum("period_type", [
  "daily",
  "weekly",
  "monthly"
])

export const users = pgTable('users', {
  id:         uuid("id").primaryKey().defaultRandom(),
  first_name: varchar("first_name", { length: 100 }).notNull(),
  last_name:  varchar("last_name", { length: 100 }).notNull(),
  email:      varchar("email", { length: 255 }).notNull().unique(),
  password:   varchar("password", { length: 255 }).notNull(),
  role:       userRoleEnum("role").notNull(),
  is_active:  boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
})

export const lounges=pgTable('lounges',{
    id:uuid().primaryKey().defaultRandom(),
    name:varchar({length:100}).notNull(),
    is_active:boolean().notNull().default(true),
    manager_id:uuid().references(()=>users.id),
    created_at:timestamp().notNull().defaultNow(),
    updated_at:timestamp().notNull().defaultNow()
})
export const lounge_staff=pgTable('lounge_staff',{
    lounge_id:uuid().references(()=>lounges.id).notNull(),
    user_id:uuid().notNull().references(()=>users.id),
    created_at:timestamp().notNull().defaultNow(),
    
},(t)=>({
        pk: primaryKey({ columns: [t.user_id, t.lounge_id] }),
    })
)
export const customers=pgTable("customers",{
    id:uuid("id").primaryKey().defaultRandom(),
    first_name:varchar("first_name",{length:100}).notNull(),
    last_name:varchar("last_name",{length:100}).notNull(),
    gender:varchar('gender',{length:10}),
    email:varchar("email",{length:255}).unique().notNull(),
    //for google regigistration passseword can be null
    password:varchar("password",{length:255}),
    registration_method:registrationMethodEnum("registration_method").notNull(),
    is_active:boolean("is_active").notNull().default(true),
    is_verified:boolean("is_verified").notNull().default(false),
    device_token:varchar('device_token',{length:255}),//for push notification
    created_at:timestamp("created_at").notNull().defaultNow(),
    updated_at:timestamp("updated_at").notNull().defaultNow()

})
export const non_cafe_customers=pgTable("non_cafe_customers",{
    lounge_id:uuid("lounge_id").references(()=>lounges.id).notNull(),
    customer_id:uuid("customer_id").references(()=>customers.id).notNull(),
    created_at:timestamp("created_at").notNull().defaultNow(),
},

(t)=>({
    pk:primaryKey({columns:[t.customer_id,t.lounge_id]})//composite primary key to ensure a customer can be associated with a lounge only once
})
)
export const wallets = pgTable("wallets", {
  id:          uuid("id").primaryKey().defaultRandom(),
  customer_id: uuid("customer_id").notNull().references(() => customers.id),
  lounge_id:   uuid("lounge_id").notNull().references(() => lounges.id),
  balance:     decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  created_at:  timestamp("created_at").notNull().defaultNow(),
  updated_at:  timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  unq: uniqueIndex("wallet_customer_lounge_unique").on(t.customer_id, t.lounge_id)
}))
export const menu_items=pgTable("menu_items",{
    id:uuid("id").primaryKey().defaultRandom(),
    lounge_id:uuid("lounge_id").notNull().references(()=>lounges.id),
    name:varchar("name",{length:100}).notNull(),
    description:varchar("description",{length:255}),
    image_url:text('image_url'),
    price:decimal("price",{precision:10,scale:2}).notNull(),
    is_available:boolean("is_available").notNull().default(true),
    estimated_preparation_time:integer("estimated_preparation_time").notNull(),
    created_at:  timestamp("created_at").notNull().defaultNow(),
    updated_at:  timestamp("updated_at").notNull().defaultNow(),

})
export const orders=pgTable("orders",{
    id:uuid("id").primaryKey().defaultRandom(),
    customer_id:uuid("customer_id").references(()=>customers.id),//can be null for walk in orders
    lounge_id:uuid("lounge_id").notNull().references(()=>lounges.id),
    order_type:ordertypeEnum("order_type").notNull(),
    status:orderStatusEnum("status").notNull().default("pending"),
    total_amount:decimal("total_amount",{precision:10,scale:2}).notNull(),
    estimated_ready_time:integer("estimated_ready_time").notNull(),
    created_at:  timestamp("created_at").notNull().defaultNow(),
    updated_at:  timestamp("updated_at").notNull().defaultNow(),
})
export const order_items=pgTable("order_items",{
    id:uuid("id").primaryKey().defaultRandom(),
    order_id:uuid("order_id").notNull().references(()=>orders.id),
    menu_item_id:uuid("menu_items_id").notNull().references(()=>menu_items.id),
    unit_price:decimal("unit_price",{precision:10,scale:2}).notNull(),
    quantity:integer("quantity").notNull(),
    special_instructions:text("special_instructions"),
    created_at:  timestamp("created_at").notNull().defaultNow(),


})
export const wallet_transactions=pgTable("wallet_transactions",{
    id:uuid("id").primaryKey().defaultRandom(),
    wallet_id:uuid("wallet_id").notNull().references(()=>wallets.id),
    order_id:uuid("order_id").references(()=>orders.id),
    amount:decimal("amount",{precision:10,scale:2}).notNull(),
    transaction_type:transactionTypeEnum("transaction_type").notNull(),
    description:varchar("description",{length:255}),
    created_at:  timestamp("created_at").notNull().defaultNow(),
    
})
export const payments=pgTable("payments",{
    id:uuid("id").primaryKey().defaultRandom(),
    order_id:uuid("order_id").notNull().references(()=>orders.id),
    lounge_id:uuid("lounge_id").notNull().references(()=>lounges.id),
    amount:decimal("amount",{precision:10,scale:2}).notNull(),
    payment_method:paymentMethodEnum("payment_method").notNull(),
    payment_status:paymentStatusEnum("payment_status").notNull().default("pending"),
    payer_type:payerTypeEnum("payer_type").notNull(),
    created_at:  timestamp("created_at").notNull().defaultNow(),

})
export const customer_feedback=pgTable('customer_feedback',{
    id:uuid("id").primaryKey().defaultRandom(),
    lounge_id:uuid("lounge_id").notNull().references(()=>lounges.id),
    customer_id:uuid("customer_id").notNull().references(()=>customers.id), 
    rating:integer("rating").notNull(),
    comment:text("comment"),
    created_at:  timestamp("created_at").notNull().defaultNow(),
})
export const sales_report=pgTable("sales_report",{
    id:uuid("id").primaryKey().defaultRandom(),
    lounge_id:uuid("lounge_id").notNull().references(()=>lounges.id),
    period_type:periodTypeEnum("period_type").notNull(),
    period_start:timestamp("period_start").notNull(),
    period_end:timestamp("period_end").notNull(),
    total_sales:decimal("total_sales",{precision:10,scale:2}).notNull(), 
    total_orders:integer("total_orders").notNull(),
    created_at:  timestamp("created_at").notNull().defaultNow(),
})      




export const lounge_staff_relations = relations(lounge_staff, ({ one }) => ({
  user: one(users, {
    fields: [lounge_staff.user_id],
    references: [users.id]
  }),
  lounge: one(lounges, {
    fields: [lounge_staff.lounge_id],
    references: [lounges.id]
  })
}))