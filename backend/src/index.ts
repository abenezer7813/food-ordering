import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { authRoutes } from './routes/auth.js'
import {loungeRoutes} from './routes/lounges.js'
import {staffRoutes} from './routes/staff.js'
import { authMiddleware,requireRole } from './middleware/auth.js'
import { menuRoutes } from './routes/menu.js'
import { orderRoutes } from './routes/order.js'

const app = new Hono()

app.get('/', (c) => {
  return c.json({'message':'Hello Hono!'})
})

//routes 
app.route('/lounges',loungeRoutes)
app.route('/auth',authRoutes)
app.route('/staff',staffRoutes)
app.route('/menu',menuRoutes)
app.route('/order',orderRoutes)


// //temporary route to test middleware
// app.get('/protected', authMiddleware, (c) => {
//   const userId = c.get('userId')
//   const role = c.get('userRole')
//   return c.json({ userId, role })
// })


serve({
  fetch: app.fetch,
  port: Number(process.env.PORT)||3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
