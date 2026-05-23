// feedback.ts (route)
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { submitFeedback, getLoungeFeedback } from '../services/feedback.service.js'
import { handleError } from '../utils/errors.js'

type Variables = {
  userId: string
}
export const feedbackRoutes = new Hono<{ Variables: Variables }>()

feedbackRoutes.use('*', authMiddleware)

const feedbackSchema = z.object({
  lounge_id: z.uuid(),
  order_id:z.uuid(),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().optional(),
})

// Customer submits feedback
feedbackRoutes.post('/',
  requireRole('customer'),
  zValidator('json', feedbackSchema),
  async (c) => {
    try {
      const customerId = c.get('userId') as string
      const data       = c.req.valid('json')
      const feedback   = await submitFeedback(data, customerId)
      return c.json({ feedback }, 201)
    } catch (e) {
      return handleError(e, c)
    }
  }
)

// Manager views feedback for their lounge
feedbackRoutes.get('/',
  requireRole('lounge_manager'),
  async (c) => {
    try {
      const managerId = c.get('userId') as string
      const loungeId  = c.req.query('lounge_id')
      const feedback  = await getLoungeFeedback(managerId, loungeId)
      return c.json({ feedback })
    } catch (e) {
      return handleError(e, c)
    }
  }
)