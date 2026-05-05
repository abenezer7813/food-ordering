import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { authRoutes } from './routes/auth.js'
import { loungeRoutes } from './routes/lounges.js'
import { staffRoutes } from './routes/staff.js'
import { menuRoutes } from './routes/menu.js'
import { orderRoutes } from './routes/order.js'
import { paymentRoutes } from './routes/payments.js'
import { walletRoutes } from './routes/wallet.js'
import { reportRoutes } from './routes/report.js'
import { feedbackRoutes } from './routes/feedback.js'
import { cors } from 'hono/cors'

const app = new Hono()
app.use(
  "*",
  cors({
    origin:"*",
    // process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.get('/', (c) => {
  return c.json({ 'message': 'Hello Hono!' })
})

//routes 
app.route('/lounges', loungeRoutes)
app.route('/auth', authRoutes)
app.route('/staff', staffRoutes)
app.route('/menu', menuRoutes)
app.route('/order', orderRoutes)
app.route('/payments', paymentRoutes)
app.route('/wallet', walletRoutes)
app.route('/reports', reportRoutes)
app.route('/feedback', feedbackRoutes)


serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 4001,
  hostname: '0.0.0.0',
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
