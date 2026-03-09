import z from "zod";
import { createLoungeStaff, deactivateStaff, getLoungeStaff } from "../services/staff.service.js";
import { Hono, type Context } from "hono";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { lounges } from "../db/schema.js";
import { handleError } from "../utils/errors.js";



const createLoungeStaffSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum(['cashier', 'cook'])
})
//getting manager id
// staff.service.ts
export async function getManagerLounge(managerId: string) {
    const lounge = await db.query.lounges.findFirst({
        where: eq(lounges.manager_id, managerId)
    })
    if (!lounge) throw new Error('No lounge assigned to this manager')
    return lounge
}

export const staffRoutes = new Hono()

staffRoutes.use('*', authMiddleware)
//get all staff for specific lounge
staffRoutes.get('/',
    requireRole('lounge_manager'),
    async (c) => {
        const managerId = c.get('userId') as string
        try {
            const lounge = await getManagerLounge(managerId);

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
            // Find manager's lounge
            const lounge = await getManagerLounge(managerId)

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
            const lounge = await getManagerLounge(managerId)
            const staffId = c.req.param('id') as string

            await deactivateStaff(staffId, lounge.id)
            return c.json({message:"Staff member deactivated successdully"})

        } catch (e) {
            return handleError(e, c)
        }
    }
)