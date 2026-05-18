import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z, { email, string } from "zod";
import { changePassword, changeStaffPassword, customerRegistration, getCustomerProfile, loginCustomer, loginStaff, requestCustomerPasswordReset, requestStaffPasswordReset, resetCustomerPassword, resetStaffPassword, updateCustomerProfile, updateDeviceToken, verifyAdminOtp, verifyUser } from "../services/auth.service.js";
import { handleError } from "../utils/errors.js";
import { storeOTP, verifyOTP } from "../utils/otp.js";
import { tr } from "zod/locales";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { sendOTPEmail } from "../utils/email.js";
import { users } from "../db/schema.js";


type Variables = {
  userId: string
}
export const authRoutes=new Hono<{ Variables: Variables }>()

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

 if ('requiresOtp' in result) {
      return c.json({ requiresOtp: true, email: result.email }, 200)
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

const resendOtpSchema=z.object({
  email:z.email({error:"Invalid email address"})
})
authRoutes.post(
  '/customer/resend-otp',
  zValidator('json', resendOtpSchema),
  async (c) => {
    try {
      const data = c.req.valid('json')

      console.log(data.email)

      // Generate OTP
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString()

      
      storeOTP(data.email, otp)

      
      await sendOTPEmail(data.email, otp)

      
      return c.json(
        {
          success: true,
          message: 'OTP resent successfully',
        },
        200
      )
    } catch (e) {
      return handleError(e, c)
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

authRoutes.get('/profile',
  authMiddleware,
  requireRole('customer'),
  async (c) => {
    try {
      const customerId = c.get('userId') as string
      const customer = await getCustomerProfile(customerId)
      return c.json({ customer })
    } catch (e) {
      return handleError(e, c)
    }
  }
)
authRoutes.patch('/device-token',
  authMiddleware,
  requireRole('customer'),
  async (c) => {
    try {
      const customerId = c.get('userId') as string
      const { device_token } = await c.req.json()
      await updateDeviceToken(customerId, device_token)
      return c.json({ message: 'Device token updated' })
    } catch (e) {
      return handleError(e, c)
    }
  }
)
export const updateCustomerSchema = z.object({
  first_name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  gender: z.string().optional(),
 
})
authRoutes.patch(
  '/customer/profile',
  authMiddleware,
  zValidator('json', updateCustomerSchema),
  async (c) => {
    try {
      const customer = c.get('userId')
      const data = c.req.valid('json')

      const updatedCustomer = await updateCustomerProfile(
        customer,
        data
      )

      return c.json(
        {
          message: 'Profile updated successfully',
          customer: updatedCustomer,
        },
        200
      )
    } catch (e) {
      return handleError(e, c)
    }
  }
)
const forgotPasswordSchema = z.object({ email: z.email() })
const resetPasswordSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
  new_password: z.string().min(6),
})

// Staff forgot password
authRoutes.post('/forgot-password', 
  zValidator('json', forgotPasswordSchema), 
  async (c) => {
    try {
      const { email } = c.req.valid('json')
      await requestStaffPasswordReset(email)
      return c.json({ success: true, message: 'If an account exists, an OTP has been sent.' }, 200)
    } catch (e) {
      return handleError(e, c)
    }
  }
)

authRoutes.post('/reset-password', 
  zValidator('json', resetPasswordSchema), 
  async (c) => {
    try {
      const data = c.req.valid('json')
      await resetStaffPassword(data)
      return c.json({ success: true, message: 'Password reset successfully.' }, 200)
    } catch (e) {
      return handleError(e, c)
    }
  }
)
const staffOtpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
})

authRoutes.post('/admin/verify-otp',
  zValidator('json', staffOtpSchema),
  async (c) => {
    try {
      const { email, otp } = c.req.valid('json')
      const result = await verifyAdminOtp(email, otp)
      return c.json({ token: result.token, user: result.user })
    } catch (e) {
      return handleError(e, c)
    }
  }
)
authRoutes.post('/customer/forgot-password',
  zValidator('json', forgotPasswordSchema),
  async (c) => {
    try {
      const { email } = c.req.valid('json')
      await requestCustomerPasswordReset(email)
      return c.json({ success: true, message: 'If an account exists, an OTP has been sent.' }, 200)
    } catch (e) {
      return handleError(e, c)
    }
  }
)

authRoutes.post('/customer/reset-password',
  zValidator('json', resetPasswordSchema),
  async (c) => {
    try {
      const data = c.req.valid('json')
      await resetCustomerPassword(data)
      return c.json({ success: true, message: 'Password reset successfully.' }, 200)
    } catch (e) {
      return handleError(e, c)
    }
  }
)
authRoutes.patch('/customer/change-password',
  authMiddleware,
  zValidator('json', z.object({ new_password: z.string().min(6) })),
  async (c) => {
    try {
      const customerId = c.get('userId')
      const { new_password } = c.req.valid('json')
      await changePassword(customerId, new_password)
      return c.json({ success: true, message: 'Password changed successfully.' })
    } catch (e) {
      return handleError(e, c)
    }
  }
)
authRoutes.patch('/staff/change-password',
  authMiddleware,
  zValidator('json', z.object({ new_password: z.string().min(6) })),
  async (c) => {
    try {
      const staffId = c.get('userId')
      const { new_password } = c.req.valid('json')
      await changeStaffPassword(staffId, new_password)
      return c.json({ success: true, message: 'Password changed successfully.' })
    } catch (e) {
      return handleError(e, c)
    }
  }
)