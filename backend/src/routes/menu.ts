import { Hono } from "hono";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { createMenuItem, getAllMenuItems, getCashierLounge, getMenuItems, updateAvailablity, updateMenuItem } from "../services/menu.service.js";
import { handleError } from "../utils/errors.js";
import z from "zod";
import { zValidator } from "@hono/zod-validator";


export const menuRoutes =new Hono()

const createMenuItemSchema = z.object({
  name:                      z.string().min(2),
  description:               z.string().optional(),
  price:                     z.number().positive(),
  image_url:                 z.string().url().optional(),
  estimated_preparation_time: z.number().int().positive(),
})
const updateMenuItemSchema = z.object({
  name:                       z.string().min(2),
  description:                z.string(),
  price:                      z.number().positive(),
  image_url:                  z.string().url(),
  estimated_preparation_time: z.number().int().positive(),
})
//get all menu Items for specific lounge
menuRoutes.get('/manage' ,
    authMiddleware,
    requireRole('cashier'),
    async (c)=>{
        try{
            const cashierId=c.get('userId')as string
            
            const loungeId= await getCashierLounge(cashierId)
            
            const menuItems=await getAllMenuItems(loungeId)
            return c.json({menuItems})
        }catch(e){
            return handleError(e,c)
        }
    }    
)
//get all menu Items for specific lounge
menuRoutes.get('/:loungeId' ,async (c)=>{
const loungeId=c.req.param('loungeId')
try{
    const menuItems=await getMenuItems(loungeId)
    return c.json({menuItems})
}catch(e){
    return handleError(e,c)
}
}    )

//create new menu 
menuRoutes.post('/',
    authMiddleware,
requireRole('cashier'),
zValidator('json',createMenuItemSchema),
async (c)=>{
    try{
        const cashierId=c.get('userId') as string
        const loungeId=await getCashierLounge(cashierId)

        const data=c.req.valid('json')
    
        const menuItem=await createMenuItem({...data,price: data.price.toString()},loungeId)
        return c.json({menuItem})
    }catch(e){
        return handleError(e,c)
    }
})
//update menu item
menuRoutes.patch('/:id',
    authMiddleware,
requireRole('cashier'),
zValidator('json',updateMenuItemSchema),
async (c)=>{
    const menuItemId=c.req.param('id')
    const data=c.req.valid('json')
    const updatedMenu=await updateMenuItem({...data,price:data.price.toString(),},menuItemId)
    return c.json({updatedMenu})
})

//update availablity
menuRoutes.patch('/:id/availability',
    authMiddleware,
    requireRole('cashier'),
    async (c)=>{
        try{
            const menuItemId=c.req.param('id')as string
            const updatedMenu=await updateAvailablity(menuItemId)
            return c.json({updatedMenu})
        }catch(e){
            return handleError(e,c)
        }
    }
)