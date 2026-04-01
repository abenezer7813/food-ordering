import { eq } from "drizzle-orm"
import { customers, lounge_staff, lounges, orders } from "../db/schema.js"
import { db } from "../db/index.js"
import { Errors } from "../utils/errors.js"

export async function findCustomer(customerId:string) {
        const customer=await db.query.customers.findFirst({
         where:eq(customers.id,customerId)
        })
        if(!customer) throw Errors.notFound('Customer ')
        return customer
    
}

export async function findLounge(loungeId:string) {
    const lounge=await db.query.lounges.findFirst({
        where:eq(lounges.id,loungeId)
    })
    if(!lounge) throw Errors.notFound('Lounge ')
    return lounge
    
}
export async function findOrder(orderId:string) {
     const  order=await db.query.orders.findFirst({
        where:eq(orders.id,orderId)
      })
      if(!order) throw Errors.notFound('Order is ')
    return order
    
}
export async function findStaff(staffId:string) {
    const staffEntry=await db.query.lounge_staff.findFirst({
         where:eq(lounge_staff.user_id,staffId)
        })
        if(!staffEntry) throw Errors.notFound('Customer ')
        return staffEntry
    
}