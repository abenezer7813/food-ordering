import { Hono } from 'hono'
import { verifyChapaPayment } from '../utils/chapa.js'
import { db } from '../db/index.js'
import { payments, orders, customers } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { handleError } from '../utils/errors.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendPushNotification } from '../utils/fcm.js'

export const paymentRoutes = new Hono()


paymentRoutes.post('/verify',
  authMiddleware,
  async (c) => {
    try {
      const { tx_ref } = await c.req.json()

      // 1. Verify with Chapa
      const chapaData = await verifyChapaPayment(tx_ref)
      if (chapaData.status !== 'success') {
        return c.json({ error: 'Payment not completed yet' }, 400)
      }

      // 2. Find payment by tx_ref
      const payment = await db.query.payments.findFirst({
        where: eq(payments.tx_ref, tx_ref)
      })
      if (!payment) return c.json({ error: 'Payment not found' }, 404)

      // 3. Update payment status
      await db.update(payments)
        .set({ payment_status: 'completed' })
        .where(eq(payments.tx_ref, tx_ref))

      // 4. Find order
const order = await db.query.orders.findFirst({
  where: eq(orders.id, payment.order_id!)
})

// 5. Update order status
await db.update(orders)
  .set({ status: 'confirmed' })
  .where(eq(orders.id, payment.order_id!))

// 6. Send notification
if (order) {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, order.customer_id!)
  })
  if (customer?.device_token) {
    await sendPushNotification({
      device_token: customer.device_token,
      title: 'Order Confirmed! 🎉',
      body: 'Your payment was received. We are now preparing your order.',
      order_id: order.id,
    })
  }
}

      return c.json({
        message: 'Payment verified successfully',
        order_id: payment.order_id
      })
    } catch (e) {
      return handleError(e, c)
    }
  }
)
// Chapa calls this after payment
paymentRoutes.post('/webhook', async (c) => {
  try {
    const body = await c.req.json()
    const { tx_ref } = body

    // Verify payment with Chapa
    const chapaData = await verifyChapaPayment(tx_ref)

    if (chapaData.status === 'success') {
      // Update payment status
      await db.update(payments)
        .set({ payment_status: 'completed' })
        .where(eq(payments.order_id, chapaData.meta?.order_id))

      // Update order status to confirmed
      await db.update(orders)
        .set({ status: 'confirmed' })
        .where(eq(orders.id, chapaData.meta?.order_id))
    }

    return c.json({ message: 'Webhook received' })
  } catch (e) {
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

