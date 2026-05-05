import { Hono } from "hono";
import z from "zod";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { zValidator } from "@hono/zod-validator";
import { handleError } from "../utils/errors.js";
import { collectOrder, createOrder, createWalkInOrder, getCustomerOrders, getLoungeOrders, updateOrderStatus } from "../services/order.service.js";

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

// GET /orders — cashier + cook
orderRoutes.get('/',
  requireRole('cashier', 'cook'),
  async (c) => {
    try {
      const staffId = c.get('userId') as string
      const orders = await getLoungeOrders(staffId)
      return c.json({ orders })
    } catch (e) {
      return handleError(e, c)
    }
  }
)

// GET /orders/my-orders — customer
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

// GET /orders — cashier + cook
orderRoutes.get('/',
  requireRole('cashier', 'cook'),
  async (c) => {
    try {
      const staffId = c.get('userId') as string
      const orders = await getLoungeOrders(staffId)
      return c.json({ orders })
    } catch (e) {
      return handleError(e, c)
    }
  }
)

// GET /orders/my-orders — customer
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

