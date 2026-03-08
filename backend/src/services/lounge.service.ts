import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import {lounges,users} from  '../db/schema.js'
import bcrypt from "bcryptjs";



//get all lounges for customers
export async function getAllLounges(){
    return await db.query.lounges.findMany({
        where:eq(lounges.is_active,true)
    }
     
    )
}
//for admin
export async function getAllLoungesForadmin(){
    return await db.query.lounges.findMany(  )
}
export async function createLounge(name:string){
const [lounge]=await db.insert(lounges).values({
    name,
    is_active:true
}).returning()
return lounge
}

export async function createLoungeManager(data:{
    first_name:string,
    last_name:string,
    email:string,
    password:string
}) {
    const user=await db.query.users.findFirst({
        where:eq(users.email,data.email)
    })
    if(user)throw new Error('user already exist')
    
        const hashedPassword=await bcrypt.hash(data.password,10)

        const [manager]=await db.insert(users).values({
            first_name:data.first_name,
            last_name:data.last_name,
            email:data.email,
            password:hashedPassword,
            role:'lounge_manager'
        }).returning()
        const {password:_,...managerWithoutPassword}=manager
        return managerWithoutPassword


}

export async function  assignLoungeManager(loungeId:string,managerId:string){
    const manager=await db.query.users.findFirst({
        where:eq(users.id ,managerId)
    })
    if(!manager) throw new Error('User not found')
    if(manager.role!=='lounge_manager')throw new Error('User is not a lounge manager') 
    
    const [lounge]=await db.update(lounges)
    .set({manager_id:managerId})
    .where(eq(lounges.id,loungeId))
    .returning()

    return lounge
       
} 

export async function deactivateLounge(loungeId:string) {
    await db.update(lounges)
    .set({is_active:false})
    .where(eq(lounges.id,loungeId))
    
}