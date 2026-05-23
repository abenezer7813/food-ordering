import z from "zod";
import { createLoungeStaff, deactivateStaff, getLoungeStaff, getManagers } from "../services/staff.service.js";
import { Hono, type Context } from "hono";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { lounges, lounge_staff } from "../db/schema.js";
import { handleError } from "../utils/errors.js";


type Variables = {
  userId: string
}
const createLoungeStaffSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum(['cashier', 'cook'])
})
//getting manager id
// staff.service.ts
export async function getManagerLounge(managerId: string, loungeId?: string) {
    if (loungeId) {
        // Validate manager actually owns this lounge
        const lounge = await db.query.lounges.findFirst({
            where: eq(lounges.id, loungeId)
        })
        if (!lounge || lounge.manager_id !== managerId) throw new Error('Lounge not found or not assigned to this manager')
        return lounge
    }
    const lounge = await db.query.lounges.findFirst({
        where: eq(lounges.manager_id, managerId)
    })
    if (!lounge) throw new Error('No lounge assigned to this manager')
    return lounge
}

export const staffRoutes = new Hono<{ Variables: Variables }>()

staffRoutes.use('*', authMiddleware)
//get all staff for specific lounge
staffRoutes.get('/',
    requireRole('lounge_manager'),
    async (c) => {
        const managerId = c.get('userId') as string
        const loungeId = c.req.query('lounge_id')
        try {
            const lounge = await getManagerLounge(managerId, loungeId);
            const staff = await getLoungeStaff(lounge.id)
            return c.json({ staff });
        } catch (e) {
            return handleError(e, c)
        }
    }
)
//creating staff
staffRoutes.post('/',
    requireRole('lounge_manager'),
    zValidator('json', createLoungeStaffSchema),
    async (c) => {
        try {
            const managerId = c.get('userId') as string
            const loungeId = c.req.query('lounge_id')
            const lounge = await getManagerLounge(managerId, loungeId)
            const data = c.req.valid('json')
            const staff = await createLoungeStaff(data, lounge.id)
            return c.json({ staff })
        } catch (e: any) {
            return c.json({ error: e.message }, 400)
        }
    }
)
staffRoutes.patch('/:id/deactivate',
    requireRole('lounge_manager'),
    async (c) => {
        try {
            const managerId = c.get('userId') as string
            const loungeId = c.req.query('lounge_id')
            const lounge = await getManagerLounge(managerId, loungeId)
            const staffId = c.req.param('id') as string
            await deactivateStaff(staffId, lounge.id)
            return c.json({ message: "Staff member deactivated successfully" })
        } catch (e) {
            return handleError(e, c)
        }
    }
)
staffRoutes.get('/managers',
    requireRole('super_admin'),
    async (c) => {
        try {
            const managers = await getManagers()
            return c.json({managers})
        } catch (e) {
            return handleError(e, c)
        }
    })

// Get the lounge for the currently logged-in cashier/cook/manager
staffRoutes.get('/my-lounge',
    requireRole('cashier', 'cook', 'lounge_manager'),
    async (c) => {
        try {
            const userId = c.get('userId') as string

            // For lounge_manager, look up by manager_id on lounges table
            const managerLounge = await db.query.lounges.findFirst({
                where: eq(lounges.manager_id, userId)
            })
            if (managerLounge) return c.json({ lounge_id: managerLounge.id, lounge_name: managerLounge.name })

            // For cashier/cook, look up via lounge_staff
            const staffEntry = await db.query.lounge_staff.findFirst({
                where: eq(lounge_staff.user_id, userId)
            })
            if (!staffEntry) return c.json({ error: 'No lounge assigned' }, 404)

            const lounge = await db.query.lounges.findFirst({
                where: eq(lounges.id, staffEntry.lounge_id)
            })
            if (!lounge) return c.json({ error: 'Lounge not found' }, 404)

            return c.json({ lounge_id: lounge.id, lounge_name: lounge.name })
        } catch (e) {
            return handleError(e, c)
        }
    }
)

// Get ALL lounges for the currently logged-in manager (multi-lounge support)
staffRoutes.get('/my-lounges',
    requireRole('lounge_manager'),
    async (c) => {
        try {
            const userId = c.get('userId') as string
            const managerLounges = await db.query.lounges.findMany({
                where: eq(lounges.manager_id, userId),
                columns: { id: true, name: true, is_active: true }
            })
            return c.json({ lounges: managerLounges })
        } catch (e) {
            return handleError(e, c)
        }
    }
)