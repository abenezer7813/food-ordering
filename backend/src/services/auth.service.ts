import { db } from "../db/index.js";
import { users,customers,non_cafe_customers } from "../db/schema.js";
import {eq} from "drizzle-orm"
import bcrypt from "bcryptjs";
import  jwt  from "jsonwebtoken";
import { Errors } from "../utils/errors.js";
import { storeOTP, verifyOTP } from '../utils/otp.js'
import { sendOTPEmail } from '../utils/email.js'
import { bytes } from "drizzle-orm/gel-core";
export async function loginStaff(email:string,password:string){
    
    const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  if(!user)return null;

  if(!user.is_active) return null
   
  //compare password
   const isValidPassword=await bcrypt.compare(password,user.password)
   if(!isValidPassword)return null;

   //generate token
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