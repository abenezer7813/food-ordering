import { Hono } from "hono";
import z from "zod";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { zValidator } from "@hono/zod-validator";
import { handleError } from "../utils/errors.js";
import { createOrder } from "../services/order.service.js";

export const orderRoutes=new Hono()

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
      const order=await createOrder(orderData,customerId)
      return c.json({order},201)
    }catch(e){
      return handleError(e,c)
    }
  }
)
