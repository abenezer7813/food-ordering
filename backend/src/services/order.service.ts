import { eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { lounges, order_items, orders,menu_items } from "../db/schema.js";
import { Errors } from "../utils/errors.js";

export async function createOrder(data:{
    lounge_id:      string,
      items:     { 
        menu_item_id:         string,
        quantity:             number,
        special_instructions?: string
    }[],
      payment_method: 'wallet'| 'chapa'|'cash',
},customerId:string) {
    let totalAmount=0
    let estimatedReadyTime=0
     // 1. Fetch all menu items in one query
  const menuItemIds = data.items.map(item => item.menu_item_id)
  const fetchedItems = await db.query.menu_items.findMany({
    where: inArray(menu_items.id, menuItemIds)
  })

    for (const item of data.items) {
    const menuItem = fetchedItems.find(m => m.id === item.menu_item_id)

    if (!menuItem) throw Errors.notFound('Menu item')
    if (menuItem.lounge_id !== data.lounge_id) throw Errors.badRequest('Menu item does not belong to this lounge')
    if (!menuItem.is_available) throw Errors.badRequest(`${menuItem.name} is not available`)

    totalAmount += Number(menuItem.price) * item.quantity
    estimatedReadyTime += Number(menuItem.estimated_preparation_time)
  }
 return await db.transaction(async (tx)=>{
    const [order]=await tx.insert(orders).values({
        customer_id:customerId,
        lounge_id:data.lounge_id,
        order_type:'online',
        status:'pending',
        total_amount:String(totalAmount),
        estimated_ready_time:estimatedReadyTime
    }).returning() 

    await tx.insert(order_items).values(
        data.items.map((item)=>{
            const menuItem=fetchedItems.find(menu=>menu.id===item.menu_item_id)! //to get the price
            return{
                 order_id:order.id,
                 menu_item_id:item.menu_item_id,
                quantity:item.quantity,
                unit_price:menuItem?.price,
                special_instructions:item.special_instructions
            }

        })
    )
    return order
 })
       
}