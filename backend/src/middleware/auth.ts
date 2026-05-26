import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import { Errors } from "../utils/errors.js";

export async function authMiddleware(c:Context,next:Next){
    
    const authHeader=c.req.header('Authorization')

    if(!authHeader||!authHeader.startsWith('Bearer ')){
        throw Errors.unauthorized('Unauthorized: No token provided')
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
        throw Errors.unauthorized('Unauthorized: Invalid token')
    }

}

//middleware to check if user has required role
export function requireRole(...roles:string[]){
    return async (c:Context,next:Next)=>{
        const userRole=c.get('userRole')

        if(!roles.includes(userRole)){
            console.log(roles)
            throw Errors.forbidden('Forbidden: Insufficient permissions')
        }
        await next()
    }
}