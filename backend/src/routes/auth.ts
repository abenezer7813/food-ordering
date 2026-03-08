import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { loginStaff } from "../services/auth.service.js";

export const authRoutes=new Hono()

//staff login schema 
const staffLoginSchema=z.object({
    email:z.email({error:"Invalid email address"}),
    password:z.string().min(6,{message:"Password must be at least 6 characters long"})
})

authRoutes.post("/staff/login",zValidator('json',staffLoginSchema),
async (c)=>{
    const {email,password}=c.req.valid('json')
    const result=await loginStaff(email,password)
 if (!result) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    return c.json({ token: result.token, user: result.user })
  }

  
)