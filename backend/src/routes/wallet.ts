import { Hono } from "hono";
import { balanceTopUp, cashierApproveTopUp, createTopUpRequest, getCustomerTopUpRequests, getNonCafeUser, getTopUpRequests, getTransactionHistory, getWalletBalance, managerApproveTopUp, nonCafeRegistration, rejectTopUpRequest, verifyTopUp } from "../services/wallet.service.js";
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
  amount: z.number().positive().min(10), 
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
// Customer creates top up request
walletRoutes.post('/:loungeId/topup-request',
  requireRole('customer'),
  zValidator('json', z.object({
    amount: z.number().positive().min(10),
    payment_method: z.enum(['cash', 'bank_transfer']),
    receipt_image_url: z.string().optional(),
  })),
  async (c) => {
    try {
      const customerId = c.get('userId') as string
      const loungeId = c.req.param('loungeId')
      const data = c.req.valid('json')
      const request = await createTopUpRequest({
        customer_id: customerId,
        lounge_id: loungeId,
        ...data,
      })
      return c.json({ request }, 201)
    } catch (e) {
      return handleError(e, c)
    }
  }
)

// Customer gets their top up requests
walletRoutes.get('/:loungeId/topup-requests/my',
  requireRole('customer'),
  async (c) => {
    try {
      const customerId = c.get('userId') as string
      const loungeId = c.req.param('loungeId')as string
      const requests = await getCustomerTopUpRequests(customerId, loungeId)
      return c.json({ requests })
    } catch (e) {
      return handleError(e, c)
    }
  }
)

// Staff gets all top up requests for a lounge
walletRoutes.get('/:loungeId/topup-requests',
  requireRole('cashier', 'lounge_manager'),
  async (c) => {
    try {
      const loungeId = c.req.param('loungeId')as string
      const requests = await getTopUpRequests(loungeId)
      return c.json({ requests })
    } catch (e) {
      return handleError(e, c)
    }
  }
)

// Cashier approves top up request
walletRoutes.patch('/:loungeId/topup-requests/:requestId/cashier-approve',
  requireRole('cashier'),
  async (c) => {
    try {
      const cashierId = c.get('userId') as string
      const requestId = c.req.param('requestId')as string
      const request = await cashierApproveTopUp(requestId, cashierId)
      return c.json({ request })
    } catch (e) {
      return handleError(e, c)
    }
  }
)

// Manager approves top up request
walletRoutes.patch('/:loungeId/topup-requests/:requestId/manager-approve',
  requireRole('lounge_manager'),
  async (c) => {
    try {
      const managerId = c.get('userId') as string
      const requestId = c.req.param('requestId')as string 
      const result = await managerApproveTopUp(requestId, managerId)
      return c.json(result)
    } catch (e) {
      return handleError(e, c)
    }
  }
)

// Reject top up request (cashier or manager)
walletRoutes.patch('/:loungeId/topup-requests/:requestId/reject',
  requireRole('cashier', 'lounge_manager'),
  zValidator('json', z.object({
    rejection_reason: z.string().min(1),
  })),
  async (c) => {
    try {
      const staffId = c.get('userId') as string
      const requestId = c.req.param('requestId')
      const { rejection_reason } = c.req.valid('json')
      const request = await rejectTopUpRequest(requestId, staffId, rejection_reason)
      return c.json({ request })
    } catch (e) {
      return handleError(e, c)
    }
  }
)