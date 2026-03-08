import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import {eq} from "drizzle-orm"
import bcrypt from "bcryptjs";
import  jwt  from "jsonwebtoken";

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