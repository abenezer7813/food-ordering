// feedback.service.ts
import { db } from '../db/index.js'
import { customer_feedback, lounges } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { Errors } from '../utils/errors.js'

export async function submitFeedback(data: {
  lounge_id: string
  order_id:string,
  rating:    number
  comment?:  string
}, customerId: string) {
  const lounge = await db.query.lounges.findFirst({
    where: eq(lounges.id, data.lounge_id)
  })
  if (!lounge) throw Errors.notFound('Lounge')

  const [feedback] = await db.insert(customer_feedback).values({
    customer_id: customerId,
    order_id:data.order_id,
    lounge_id:   data.lounge_id,
    rating:      data.rating,
    comment:     data.comment,
  }).returning()

  return feedback
}

export async function getLoungeFeedback(managerId: string, loungeId?: string) {
  let resolvedLoungeId: string

  if (loungeId) {
    // Validate manager owns this lounge
    const lounge = await db.query.lounges.findFirst({
      where: eq(lounges.id, loungeId)
    })
    if (!lounge || lounge.manager_id !== managerId) throw Errors.notFound('Lounge')
    resolvedLoungeId = lounge.id
  } else {
    const lounge = await db.query.lounges.findFirst({
      where: eq(lounges.manager_id, managerId)
    })
    if (!lounge) throw Errors.notFound('Lounge')
    resolvedLoungeId = lounge.id
  }

  return await db.query.customer_feedback.findMany({
    where: eq(customer_feedback.lounge_id, resolvedLoungeId)
  })
}