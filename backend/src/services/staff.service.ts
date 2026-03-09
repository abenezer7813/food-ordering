import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users,lounge_staff,lounges} from "../db/schema.js";
import { AppError, Errors } from "../utils/errors.js";
import bcrypt from "bcryptjs";


export async function createLoungeStaff(data:{
    first_name:string,
    last_name:string,
    email:string,
    password:string,
    role:"cashier"|"cook"
},loungeId:string) {
    const user=await db.query.users.findFirst({
        where:eq(users.email,data.email)
    })
    if(user) throw Errors.alreadyExists("User");

    const hashedPassword= await bcrypt.hash(data.password,10)

   return await db.transaction(async (tx)=>{
       const [staffUser] =await tx.insert(users).values({
        first_name:data.first_name,
        last_name:data.last_name,
        email:data.email,
        password:hashedPassword,
        role:data.role
    }).returning()
//assignnig to specific lounge
   await tx.insert(lounge_staff).values({
        lounge_id:loungeId,
        user_id:staffUser.id
    })
 const { password: _, ...userWithoutPassword } = staffUser
    return userWithoutPassword
})
}

export async function getLoungeStaff(loungeId: string) {
  const staff = await db.query.lounge_staff.findMany({
    where: eq(lounge_staff.lounge_id, loungeId),
    with: {
      user: {
        columns: {
          password: false 
        }
      }
    }
  })
 
  return staff
}

export async function deactivateStaff(staffId:string,lougeId:string) {
    const staffMember=await db.query.lounge_staff.findFirst({
        where:and(eq(lounge_staff.user_id,staffId),
                  eq(lounge_staff.lounge_id,lougeId))
    })
    if(!staffMember) throw Errors.notFound('staff ')
        await db.update(users).set({
    is_active:false}).where(eq(users.id,staffId))
    
}