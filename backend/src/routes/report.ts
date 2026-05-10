import { Hono } from "hono";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
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
    requireRole('cashier','manager'),
    zValidator('query',reportSchema),
    async (c)=>{
        try{
         const staffId=c.get('userId')as string
         const data=c.req.valid('query')
         const report=await generateReport(staffId,data.period)
         return c.json({data:{...report,total_sales:Number(report.total_sales)}})
        }catch(e){
            return handleError(e,c)
        }
    }
)