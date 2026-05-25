import { zValidator } from "../utils/validator.js";
import { Hono } from "hono";
import z, { email } from "zod";
import { requireRole, authMiddleware } from "../middleware/auth.js";
import { createLounge, getAllLounges, createLoungeManager, assignLoungeManager, getAllLoungesForadmin, loungeStatus } from "../services/lounge.service.js";
import { AppError, handleError } from "../utils/errors.js";



export const loungeRoutes = new Hono()
//calling authmiddlewRre for all api's
loungeRoutes.use('*', authMiddleware)


const createLoungeSchema = z.object({
  name: z.string().min(2)
})

const createLoungeManagerSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.email(),
  password: z.string()
})
const assignManagerSchema = z.object({
  manager_id: z.string(),
})

// Create lounge
loungeRoutes.post('/',
  requireRole('super_admin'),
  zValidator('json', createLoungeSchema),
  async (c) => {
    try {
      const { name } = c.req.valid('json')
      const lounge = await createLounge(name)
      return c.json({ lounge }, 201)
    } catch (e: any) {
      return handleError(e, c)
    }
  }
)

//get lounge 
loungeRoutes.get('/', async (c) => {
  try {
    const lounges = await getAllLounges()
    return c.json({ lounges })
  } catch (e) {
    return handleError(e, c)
  }
})

//get for admin
loungeRoutes.get('/admin', 
  requireRole('super_admin'),
  async (c) => {
    try {
      const lounges = await getAllLoungesForadmin()
      return c.json({ lounges })
    } catch (e) {
      return handleError(e, c)
    }
  }
)

//create manager
loungeRoutes.post('/managers',
  requireRole('super_admin'),
  zValidator('json', createLoungeManagerSchema),
  async (c) => {
    try {
      const data = c.req.valid('json')
      const manager = await createLoungeManager(data)
      return c.json({ manager }, 201)
    } catch (e: any) {
      return handleError(e, c)
    }
  }
)

//assign lounge manager
loungeRoutes.patch('/:id/assign-manager',
  requireRole('super_admin'),
  zValidator('json', assignManagerSchema),
  async (c) => {
    try {
      const loungeId = c.req.param('id')
      const { manager_id } = c.req.valid('json')

      if (!loungeId) {
        throw new AppError("Lounge id is required", 400)
      }
      const lounge = await assignLoungeManager(loungeId, manager_id)
      return c.json({ lounge })
    } catch (e: any) {
      return handleError(e, c)
    }
  }
)

//deactivate lounge
loungeRoutes.patch('/:id',
  requireRole('super_admin'),
  async (c) => {
    try {
      const loungeId = c.req.param('id')
      if (!loungeId) {
        throw new AppError("Lounge id is required", 400)
      }
      await loungeStatus(loungeId)
      return c.json({ message: 'Lounge deactivated successfully' })
    } catch (e) {
      return handleError(e, c)
    }
  }
)
