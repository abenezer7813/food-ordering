import { and, eq,gte,lte } from "drizzle-orm";
import { db } from "../db/index.js";
import { findStaff } from "./common.js";
import { lounges, orders, sales_report } from "../db/schema.js";
import { Errors } from "../utils/errors.js";

export async function generateReport(
  staffId: string,
  period: 'daily' | 'weekly' | 'monthly'
){
  const  staffEntry=await findStaff(staffId)
 let loungeId: string



if (staffEntry) {
  loungeId = staffEntry.lounge_id
} else {
 
  const lounge = await db.query.lounges.findFirst({
    where: eq(lounges.manager_id, staffId)
  })
  if (!lounge) throw Errors.notFound('Lounge')
  loungeId = lounge.id
}

const now = new Date()
let period_start: Date
let period_end: Date
let total_amount=0
if (period === 'daily') {
  period_start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  period_end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
} else if (period === 'weekly') {
  const day    = now.getDay()
  period_start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
  period_end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - day))
} else {
  period_start = new Date(now.getFullYear(), now.getMonth(), 1)
  period_end   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
}
const collectedOrders=await db.query.orders.findMany({
    where:and(eq(orders.status,'collected'),
             eq(orders.lounge_id,loungeId),
             gte(orders.created_at,period_start),
             lte(orders.created_at,period_end)
        )
})
for(const order of collectedOrders){
    total_amount+=Number(order.total_amount)
}
const [report]=await db.insert(sales_report).values({
    lounge_id:loungeId,
    period_type:period,
    period_start:period_start,
    period_end:period_end,
    total_orders:collectedOrders.length,
    total_sales :String(total_amount)
}).returning()
return report
}