import { Hono } from "hono";
import z from "zod";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { zValidator } from "../utils/validator.js";
import { handleError } from "../utils/errors.js";
import { collectOrder, createOrder, createWalkInOrder, getCustomerOrders, getLoungeOrders, updateOrderStatus } from "../services/order.service.js";
import { db } from "../db/index.js";
import { orders } from "../db/schema.js";
import { eq } from "drizzle-orm";

type Variables = {
  userId: string
}
export const orderRoutes=new Hono<{ Variables: Variables }>()

orderRoutes.use('*',authMiddleware)


const createOrderSchema = z.object({
  lounge_id:      z.uuid(),
  items:          z.array(z.object({
    menu_item_id:         z.uuid(),
    quantity:             z.number().int().positive(),
    special_instructions: z.string().optional(),
  })).min(1),
  payment_method: z.enum(['wallet', 'chapa', 'cash']),
})
  
orderRoutes.post('/',
  zValidator('json',createOrderSchema,
  ),
  requireRole('customer'),
  async (c)=>{
    try{
      const customerId=c.get('userId')as string 
      const orderData=c.req.valid('json')
      const orderRes=await createOrder(orderData,customerId)
      return c.json({ order:orderRes?.order, payment_url:orderRes?.payment_url, tx_ref:orderRes?.tx_ref }, 201)
    }catch(e){
      return handleError(e,c)
    }
  }
)
//walkin order by cashier
orderRoutes.post('/walk-in',
  requireRole('cashier'),
  zValidator('json', z.object({
    items: z.array(z.object({
      menu_item_id:         z.string().uuid(),
      quantity:             z.number().int().positive(),
      special_instructions: z.string().optional(),
    })).min(1),
  })),
  async (c) => {
    try {
      const cashierId = c.get('userId') as string
      const data = c.req.valid('json')
      const order = await createWalkInOrder(data, cashierId)
      return c.json({ data:order }, 201)
    } catch (e) {
      return handleError(e, c)
    }
  }
)

//update status only cook
const updateStatusSchema=z.object({
  status:z.enum(['preparing','ready'])
})
orderRoutes.patch('/:id/status',
  requireRole('cook'),
  zValidator('json',updateStatusSchema),
  async (c)=>{
    try{
       const staffId=c.get('userId') as string
       const data=c.req.valid('json')
       const orderId=c.req.param('id')
       const updatedOrder=await updateOrderStatus(orderId,data.status,staffId)
      return c.json({data:updatedOrder})
    }catch(e){
      return handleError(e,c)
    }
  }

)

//mark as collected 
orderRoutes.patch('/:id/collect',
  requireRole('cashier'),
  async (c)=>{
    try{
      const cashierId=c.get('userId') as string
      const orderId=c.req.param('id') as string
      const updatedOrder=await collectOrder(orderId,cashierId)
      return c.json({data:updatedOrder})
    }catch(e){
      return handleError(e,c)
    }
  }

)

// GET /order — cashier + cook + manager
orderRoutes.get('/',
  requireRole('cashier', 'cook', 'lounge_manager'),
  async (c) => {
    try {
      const staffId = c.get('userId') as string
      const loungeIdParam = c.req.query('lounge_id')
      
      // For manager with lounge_id param, get orders for that lounge
      // For cashier/cook, get orders from their assigned lounge
      if (loungeIdParam) {
        // Manager case: get orders for specified lounge
        const loungeOrders = await db.query.orders.findMany({
          where: eq(orders.lounge_id, loungeIdParam),
          with: {
            order_items: {
              with: {
                menu_item: true
              }
            }
          }
        })
        return c.json({ orders: loungeOrders })
      } else {
        // Cashier/cook case: get orders from their assigned lounge
        const loungeOrders = await getLoungeOrders(staffId)
        return c.json({ orders: loungeOrders })
      }
    } catch (e) {
      return handleError(e, c)
    }
  }
)

// GET /order/my-orders — customer
orderRoutes.get('/my-orders',
  requireRole('customer'),
  async (c) => {
    try {
      const customerId = c.get('userId') as string
      const orders = await getCustomerOrders(customerId)
      return c.json({ orders })
    } catch (e) {
      return handleError(e, c)
    }
  }
)

