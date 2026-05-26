import { Hono } from "hono";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import z from "zod";
import { zValidator } from "../utils/validator.js";
import { handleError } from "../utils/errors.js";
import { generateReport } from "../services/report.service.js";

type Variables = {
  userId: string
}
export const reportRoutes=new Hono<{ Variables: Variables }>()

reportRoutes.use('*',authMiddleware)


const reportSchema=z.object({
    period:z.enum(['daily','weekly','monthly'])
})
reportRoutes.get('/',
    requireRole('cashier','lounge_manager'),
    zValidator('query', z.object({
      period: z.enum(['daily','weekly','monthly']),
      lounge_id: z.string().optional(),
    })),
    async (c)=>{
        try{
         const staffId=c.get('userId')as string
         const { period, lounge_id } = c.req.valid('query')
         const report=await generateReport(staffId, period, lounge_id)
         return c.json({data:{...report,total_sales:Number(report.total_sales)}})
        }catch(e){
            return handleError(e,c)
        }
    }
)