import bcrypt from "bcryptjs";
import { users } from "./schema.js";
import { db } from "./index.js";
import { error } from "console";

async function seed() {
    const hashedPassword=await bcrypt.hash('admin123',10)
    await db.insert(users).values({
        first_name :'super',
        last_name:'admin',
        email:'admin@test.com',
        password:hashedPassword,
        role:'super_admin',
        is_active:true
    })
    console.log('super admin created successfully')

    process.exit(0)//exist or stop the proccess

}
seed().catch((error)=>{
    console.error(error)
    process.exit(1)
})