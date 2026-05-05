import { Hono } from "hono";
import { balanceTopUp, getNonCafeUser, getTransactionHistory, getWalletBalance, nonCafeRegistration, verifyTopUp } from "../services/wallet.service.js";
import z, { string } from "zod";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { zValidator } from "@hono/zod-validator";
import { Errors, handleError } from "../utils/errors.js";

type Variables = {
  userId: string
}
export const walletRoutes=new Hono<{ Variables: Variables }>()
walletRoutes.use('*',authMiddleware)

walletRoutes.get('/customers/non-cafe/status',
  requireRole('customer'),async(c)=>{

    const customerId = c.get('userId')  as string
  const loungeId = c.req.query('lounge_id')

  if (!loungeId) {
    return c.json({ message: 'lounge_id is required' }, 400)
  }

  const isNonCafe = await getNonCafeUser(customerId, loungeId)
  return c.json({ is_non_cafe: isNonCafe })
  }
)
walletRoutes.post('/register',
  requireRole('customer'),
  zValidator('json', z.object({ lounge_id: z.string().uuid() })),
  async (c) => {
    try {
      const customerId = c.get('userId') as string
      const { lounge_id } = c.req.valid('json')
      const wallet = await nonCafeRegistration(customerId, lounge_id)
      return c.json({ wallet }, 201)
    } catch (e) {
      return handleError(e, c)
    }
  }
)
const topupSchema=z.object({
  amount: z.number().positive().min(10), // ← minimum 10 ETB
})
//top-up
walletRoutes.post('/:loungeId/topup',
  requireRole('customer'),
  zValidator('json',topupSchema),
  async (c)=>{
    try{
    const loungeId=c.req.param('loungeId')as string
    const customerId = c.get('userId') as string
    const data=c.req.valid('json')

      const topUp=await balanceTopUp(data.amount,loungeId,customerId)
      return c.json({ payment_url: topUp.payment_url, tx_ref: topUp.tx_ref }, 201)
    }catch(e){
      return handleError(e,c)
    }
  }
)

//verify transaction
const verificationSchema=z.object(
  {tx_ref:z.string()}
)
walletRoutes.post('/verify',
  requireRole('customer'),
  zValidator('json',verificationSchema),
  async (c)=>{
    try{
      const data=c.req.valid('json')
      const verificationData=await verifyTopUp(data.tx_ref)
      return c.json({verificationData})
    }catch(e){
      return handleError(e,c)
    }
  }
)

//get balance
walletRoutes.get('/:loungeId',
  requireRole('customer'),
  async (c)=>{
    try{
      const loungeId=c.req.param('loungeId')as string
       const customerId=c.get('userId') as string 
       const wallet=await getWalletBalance(loungeId,customerId)
       
       return c.json({...wallet,balance:Number(wallet.balance)})
    }catch(e){
      return handleError(e,c)
    }
  }
)

//get all transactions

walletRoutes.get('/:loungeId/transaction',
  requireRole('customer'),
  async (c)=>{
    try{
    const loungeId=c.req.param('loungeId')as string
       const customerId=c.get('userId') as string 
    const transactions=await getTransactionHistory(loungeId,customerId)
    return c.json({transactions})
    }catch(e){
      return handleError(e,c)
    }
  }
)
