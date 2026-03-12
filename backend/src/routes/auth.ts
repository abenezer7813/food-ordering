import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z, { email, string } from "zod";
import { customerRegistration, loginCustomer, loginStaff, verifyUser } from "../services/auth.service.js";
import { handleError } from "../utils/errors.js";
import { verifyOTP } from "../utils/otp.js";
import { tr } from "zod/locales";

export const authRoutes=new Hono()

//staff login schema 
const staffLoginSchema=z.object({
    email:z.email({error:"Invalid email address"}),
    password:z.string().min(6,{message:"Password must be at least 6 characters long"})
})
const customerLoginSchema = z.object({
  email:    z.email(),
  password: z.string().min(6),
})
const customerRegistrationSchema=z.object({
      first_name:z.string(),
      last_name:z.string(),
      gender:z.string(),
      email:z.string(),
      password:z.string(),
      registration_method:z.enum(['email','google']),
      device_token:z.string(),
})
const otpVerificationSchema=z.object({
  email:z.email(),
  otp:z.string()
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

authRoutes.post('/customer/register',
  zValidator('json',customerRegistrationSchema),
async (c)=>{
  try{
      const data=c.req.valid('json')
      const customer=await customerRegistration(data)
      return c.json({ message: 'OTP sent to your email. Please verify your account.' }, 201)
  }catch(e){
    return handleError(e,c)
  }
})
authRoutes.post('/customer/verify',
  zValidator('json',otpVerificationSchema),
  async (c)=>{
    try{
    const data=c.req.valid('json')
    const customer=await verifyUser(data)
    return c.json({token:customer.token,customer:customer.customer})
    }catch(e){
      return handleError(e,c)
    }
  }
)
authRoutes.post('/customer/login',
  zValidator('json',customerLoginSchema),
  async (c)=>{
    try{
    const data=c.req.valid('json')
    const customer=await loginCustomer(data)
    return c.json({token:customer.token,customer:customer.customer})
    }catch(e){
      return handleError(e,c)
    }
  }
)