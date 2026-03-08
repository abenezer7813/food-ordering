import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";

export async function authMiddleware(c:Context,next:Next){
    
    const authHeader=c.req.header('Authorization')

    if(!authHeader||!authHeader.startsWith('Bearer ')){
        return c.json({error:'unaothorized- no token provided'},401)
    }

    const token=authHeader.split(' ')[1]

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET!)as{
            id:string,
            role:string
        }
        c.set('userId',decoded.id)
        c.set('userRole',decoded.role)
        
        await next()//authentication passed so continue
    }catch{
        return c.json({error:'unauthorized -invaid token'},401)
    }

}

//middleware to check if user has required role
export function requireRole(...roles:string[]){
    return async (c:Context,next:Next)=>{
        const userRole=c.get('userRole')

        if(!roles.includes(userRole)){
            console.log(roles)
            return c.json({error:'fobidden -insuffient permissions'},403)
        }
        await next()
    }
}