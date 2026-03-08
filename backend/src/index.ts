import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { authRoutes } from './routes/auth.js'
import {loungeRoutes} from './routes/lounges.js'
import { authMiddleware,requireRole } from './middleware/auth.js'

const app = new Hono()

app.get('/', (c) => {
  return c.json({'message':'Hello Hono!'})
})

//routes 
app.route('/lounges',loungeRoutes)
app.route('/auth',authRoutes)


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
