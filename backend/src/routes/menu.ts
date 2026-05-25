import { Hono } from "hono";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { createMenuItem, getAllMenuItems, getCashierLounge, getMenuItems, updateAvailablity, updateMenuItem } from "../services/menu.service.js";
import { handleError } from "../utils/errors.js";
import { getManagerLounge } from "./staff.js";
import z from "zod";
import { zValidator } from "../utils/validator.js";

type Variables = {
    userId: string
}
export const menuRoutes = new Hono<{ Variables: Variables }>()

const createMenuItemSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    image_url: z.string().optional(),
    estimated_preparation_time: z.number().int().positive(),
    category: z.enum(['food', 'drink']).optional(),
    meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'all_day']).optional(),
    drink_type: z.enum(['juice', 'coffee', 'tea', 'water', 'soda', 'smoothie', 'other']).optional(),
})
const updateMenuItemSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    image_url: z.string().optional(),
    estimated_preparation_time: z.number().int().positive(),
    category: z.enum(['food', 'drink']).nullable().optional(),
    meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'all_day']).nullable().optional(),
    drink_type: z.enum(['juice', 'coffee', 'tea', 'water', 'soda', 'smoothie', 'other']).nullable().optional(),
})
//get all menu Items for specific lounge
menuRoutes.get('/manage',
    authMiddleware,
    requireRole('cashier', 'lounge_manager'),
    async (c) => {
        try {
            const userId = c.get('userId') as string
            const loungeIdParam = c.req.query('lounge_id')

            let loungeId: string

            // If lounge_id provided (manager), use it; otherwise get from staff assignment (cashier)
            if (loungeIdParam) {
                loungeId = loungeIdParam
            } else {
                loungeId = await getCashierLounge(userId)
            }

            const menuItems = await getAllMenuItems(loungeId)
            return c.json({ menuItems })
        } catch (e) {
            return handleError(e, c)
        }
    }
)
//get all menu Items for specific lounge
menuRoutes.get('/:loungeId', async (c) => {
    const loungeId = c.req.param('loungeId')
    try {
        const menuItems = await getMenuItems(loungeId)
        return c.json({ menuItems })
    } catch (e) {
        return handleError(e, c)
    }
})

//create new menu 
menuRoutes.post('/',
    authMiddleware,
    requireRole('cashier', 'lounge_manager'),
    zValidator('json', createMenuItemSchema),
    async (c) => {
        try {
            const userId = c.get('userId') as string
            const loungeIdParam = c.req.query('lounge_id')

            let loungeId: string

            // If lounge_id provided (manager), use it; otherwise get from staff assignment (cashier)
            if (loungeIdParam) {
                loungeId = loungeIdParam
            } else {
                loungeId = await getCashierLounge(userId)
            }

            const data = c.req.valid('json')

            const menuItem = await createMenuItem({ ...data, price: data.price.toString() }, loungeId)
            return c.json({ menuItem })
        } catch (e) {
            return handleError(e, c)
        }
    })
//update menu item
menuRoutes.patch('/:id',
    authMiddleware,
    requireRole('cashier', 'lounge_manager'),
    zValidator('json', updateMenuItemSchema),
    async (c) => {
        try {
            const menuItemId = c.req.param('id')
            const data = c.req.valid('json')
            const updatedMenu = await updateMenuItem({ ...data, price: data.price.toString(), }, menuItemId)
            return c.json({ updatedMenu })
        } catch (e) {
            return handleError(e, c)
        }
    })

//update availablity
menuRoutes.patch('/:id/availability',
    authMiddleware,
    requireRole('cashier', 'lounge_manager'),
    async (c) => {
        try {
            const menuItemId = c.req.param('id') as string
            const updatedMenu = await updateAvailablity(menuItemId)
            return c.json({ updatedMenu })
        } catch (e) {
            return handleError(e, c)
        }
    }
)