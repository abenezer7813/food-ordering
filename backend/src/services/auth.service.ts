import { db } from "../db/index.js";
import { users,customers,non_cafe_customers } from "../db/schema.js";
import {eq} from "drizzle-orm"
import bcrypt from "bcryptjs";
import  jwt  from "jsonwebtoken";
import { AppError, Errors } from "../utils/errors.js";
import { storeOTP, verifyOTP } from '../utils/otp.js'
import { sendOTPEmail } from '../utils/email.js'
import { OAuth2Client } from 'google-auth-library'

export async function loginStaff(email:string,password:string){
    
    const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  if(!user)return null;

  if(!user.is_active) return null
   

   const isValidPassword=await bcrypt.compare(password,user.password)
   if(!isValidPassword)return null;

    if (user.role === 'super_admin') {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    storeOTP(email, otp)
    await sendOTPEmail(email, otp)
    return { requiresOtp: true, email: user.email }
  }
   const token=jwt.sign({
    id:user.id,
    role:user.role,
   }, process.env.JWT_SECRET!, { expiresIn: '24h' })
//retun token
const {password:_,...userWithoutPassword}=user
return{token,user:userWithoutPassword}

}



export async function customerRegistration(data: {
  first_name:          string
  last_name:           string
  gender?:             string
  email:               string
  password:            string
  registration_method: 'email' | 'google'
  device_token?:       string
}) {
  const existing = await db.query.customers.findFirst({
    where: eq(customers.email, data.email)
  })
  if (existing) throw Errors.alreadyExists('Email')

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const [newCustomer] = await db.insert(customers).values({
    first_name:          data.first_name,
    last_name:           data.last_name,
    email:               data.email,
    password:            hashedPassword,
    gender:              data.gender,
    device_token:        data.device_token,
    registration_method: data.registration_method,
    is_verified:         false,
  }).returning()

  // Generate and send OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  storeOTP(data.email, otp)
  await sendOTPEmail(data.email, otp)

  const { password: _, ...customerWithoutPassword } = newCustomer
  return customerWithoutPassword
}
//user verification 
 export async function verifyUser(data:{email:string,otp:string}){
   const isVerified=await verifyOTP(data.email,data.otp)
   if(!isVerified) throw Errors.badRequest('Invalid OTP ')
    const [customer]=await db.update(customers).set({
  is_verified:true}).where(eq(customers.email,data.email)).returning()

  const token = jwt.sign(
  { id: customer.id, role: 'customer' }, 
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }

)
const {password: _,...customerWithoutPassword}=customer
return {token,customer:customerWithoutPassword}
 }
 export async function loginCustomer(data:{
  email:string,
  password:string
 }) {
     const customer=await db.query.customers.findFirst({
      where:eq(customers.email,data.email)
     })
    if(!customer) throw Errors.notFound('Customer is not ')
    if(!customer.is_verified) throw Errors.badRequest('Customer is not verified')
      const password=customer.password as string
      const isValidPassword= await bcrypt.compare(data.password,password)
      if(!isValidPassword)throw Errors.badRequest('password is not correct')

        const token=jwt.sign({id:customer.id,role:'customer'},
                       process.env.JWT_SECRET!,
                      { expiresIn: '7d' }
        )

        const {password:_,...customerWithoutPassword}=customer
        return {token,customer:customerWithoutPassword}
 }
 export async function getCustomerProfile(customerId: string) {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, customerId),
    columns: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      gender: true,
      is_verified: true,
      created_at: true,
    }
  })
  if (!customer) throw Errors.notFound('Customer')
  return customer
}
export async function updateDeviceToken(customerId: string, deviceToken: string) {
  await db.update(customers)
    .set({ device_token: deviceToken })
    .where(eq(customers.id, customerId))
}


export async function updateCustomerProfile(
  customerId: string,
  data: {
    first_name?: string
    last_name?: string
    gender?: string
   
  }
) {
  const existingCustomer = await db.query.customers.findFirst({
    where: eq(customers.id, customerId),
  })

  if (!existingCustomer) {
    throw Errors.notFound('Customer')
  }

  const [updatedCustomer] = await db
    .update(customers)
    .set({
      ...(data.first_name && { first_name: data.first_name }),
      ...(data.last_name && { last_name: data.last_name }),
      ...(data.gender && { gender: data.gender }),
      updated_at: new Date(),
    })
    .where(eq(customers.id, customerId))
    .returning()

  const { password: _, ...customerWithoutPassword } = updatedCustomer

  return customerWithoutPassword
}
export async function requestStaffPasswordReset(email: string): Promise<void> {
  const staffUser = await db.query.users.findFirst({ 
    where: eq(users.email, email), 
    columns: { id: true } 
  })
  if (!staffUser) throw Errors.notFound('Account')

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  storeOTP(email, otp)
  await sendOTPEmail(email, otp)
}

export async function resetStaffPassword(input: { 
  email: string; 
  otp: string; 
  new_password: string 
}): Promise<void> {
  const isValid = verifyOTP(input.email, input.otp)
  if (!isValid) throw Errors.badRequest('Invalid or expired OTP')

  const staffUser = await db.query.users.findFirst({ 
    where: eq(users.email, input.email), 
    columns: { id: true } 
  })
  if (!staffUser) throw Errors.notFound('Account')

  const hashedPassword = await bcrypt.hash(input.new_password, 10)
  await db.update(users)
    .set({ password: hashedPassword, updated_at: new Date() })
    .where(eq(users.email, input.email))
}
export async function verifyAdminOtp(email: string, otp: string) {
  const isValid = verifyOTP(email, otp)
  if (!isValid) throw Errors.badRequest('Invalid or expired OTP')

  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })
  if (!user) throw Errors.notFound('User')

  const token = jwt.sign({
    id: user.id,
    role: user.role,
  }, process.env.JWT_SECRET!, { expiresIn: '24h' })

  const { password: _, ...userWithoutPassword } = user
  return { token, user: userWithoutPassword }
}
export async function requestCustomerPasswordReset(email: string): Promise<void> {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.email, email),
    columns: { id: true }
  })
  if (!customer) throw Errors.notFound('Account')

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  storeOTP(email, otp)
  await sendOTPEmail(email, otp)
}

export async function resetCustomerPassword(input: {
  email: string
  otp: string
  new_password: string
}): Promise<void> {
  const isValid = verifyOTP(input.email, input.otp)
  if (!isValid) throw Errors.badRequest('Invalid or expired OTP')

  const customer = await db.query.customers.findFirst({
    where: eq(customers.email, input.email),
    columns: { id: true }
  })
  if (!customer) throw Errors.notFound('Account')

  const hashedPassword = await bcrypt.hash(input.new_password, 10)
  await db.update(customers)
    .set({ password: hashedPassword, updated_at: new Date() })
    .where(eq(customers.email, input.email))
}
export async function changePassword(customerId: string, newPassword: string) {
  const hashed = await bcrypt.hash(newPassword, 10)
  await db.update(customers)
    .set({ password: hashed, updated_at: new Date() })
    .where(eq(customers.id, customerId))
}
export async function changeStaffPassword(staffId: string, new_password: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, staffId))
    .limit(1)
    .then(r => r[0])

  if (!user) throw new AppError('User not found', 404)

  const hashed = await bcrypt.hash(new_password, 12)

  await db
    .update(users)
    .set({
      password: hashed,
      is_first_login: false,   
    })
    .where(eq(users.id, staffId))
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function googleAuth(idToken: string, device_token?: string) {
  // 1. Verify the idToken
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload || !payload.email) {
    throw Errors.badRequest('Invalid Google token')
  }

  const { email, given_name, family_name } = payload

  // 2. Check if customer already exists by email
  const existing = await db.query.customers.findFirst({
    where: eq(customers.email, email)
  })

  if (existing) {
    // 3a. Already registered — just return a JWT
    const token = jwt.sign(
      { id: existing.id, role: 'customer' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    const { password: _, ...customerWithoutPassword } = existing
    return { token, customer: customerWithoutPassword }
  }

  // 3b. New customer — create account
  const [newCustomer] = await db.insert(customers).values({
    first_name:          given_name ?? email.split('@')[0],
    last_name:           family_name ?? '',
    email,
    password:            null,
    registration_method: 'google',
    device_token:        device_token ?? null,
    is_verified:         true,
  }).returning()

  const token = jwt.sign(
    { id: newCustomer.id, role: 'customer' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  const { password: _, ...customerWithoutPassword } = newCustomer
  return { token, customer: customerWithoutPassword }
}