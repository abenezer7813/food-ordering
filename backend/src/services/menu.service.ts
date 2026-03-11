import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { menu_items,lounges,lounge_staff } from "../db/schema.js";
import { Errors } from "../utils/errors.js";
import type { MenuItem, NewMenuItem } from "../db/types.js";
import { promise } from "zod";


export async function getCashierLounge(cashierId:string) {
    

const staffEntry = await db.query.lounge_staff.findFirst({
  where: eq(lounge_staff.user_id, cashierId)
})
if (!staffEntry) throw new Error('No lounge assigned')
return staffEntry.lounge_id
}


export async function getMenuItems(loungeId:string) {

    const lounge=await db.query.lounges.findFirst({
        where:eq(lounges.id,loungeId)
    })
    if (!lounge) throw Errors.notFound("Lounge");
    const menuItems=await db.query.menu_items.findMany({
        where:and( eq(menu_items.lounge_id,loungeId),
                eq(menu_items.is_available,true))
    })
    return menuItems

}

//this return all menu items including unavailable items for cashier
export async function getAllMenuItems(loungeId:string) {

    const lounge=await db.query.lounges.findFirst({
        where:eq(lounges.id,loungeId)
    })
    if (!lounge) throw Errors.notFound("Lounge");
    const menuItems=await db.query.menu_items.findMany({
        where: eq(menu_items.lounge_id,loungeId)           
    })
    return menuItems

}

export async function createMenuItem(data: {
    name: string;
    price: string;
    estimated_preparation_time: number;
    description?: string | null | undefined;
    image_url?: string | null | undefined;
},loungeId:string) {
  const [item] = await db.insert(menu_items).values({
    name:data.name,
    lounge_id:loungeId,
    price:data.price,
    description:data.description,
    estimated_preparation_time:data.estimated_preparation_time,
    image_url:data.image_url,
    is_available:true
  }).returning()
  return item
}


export async function updateMenuItem(data:{name:string,
    description?:string|null|undefined,
    price:string,
    estimated_preparation_time:number,
    image_url:string},menuItemId:string) {
    const menuItem=await db.query.menu_items.findFirst({
        where:eq(menu_items.id,menuItemId)
    })
    if(!menuItem) throw Errors.notFound('Menu item ')
    const [updatedMenu]=await db.update(menu_items).set({
name:data.name,
description:data.description,
price:data.price,
estimated_preparation_time:data.estimated_preparation_time,
image_url:data.image_url
    } ).where(eq(menu_items.id,menuItemId)).returning()
    return updatedMenu

    
}
export async function updateAvailablity(menuItemId:string) {
     const menuItem=await db.query.menu_items.findFirst({
        where:eq(menu_items.id,menuItemId)
    })
    if(!menuItem) throw Errors.notFound('Menu item ')
  const [menu]=  await db.update(menu_items).set({
is_available:!menuItem.is_available}).where(eq(menu_items.id,menuItemId)).returning()
return menu
}