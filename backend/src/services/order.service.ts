import { eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { lounges, order_items, orders, menu_items, payments, customers, lounge_staff } from "../db/schema.js";
import { Errors } from "../utils/errors.js";
import { initializeChapaPayment } from "../utils/chapa.js";
import { findOrder } from "./common.js";
import { sendPushNotification } from "../utils/fcm.js";

export async function createOrder(data: {
  lounge_id: string,
  items: {
    menu_item_id: string,
    quantity: number,
    special_instructions?: string
  }[],
  payment_method: 'wallet' | 'chapa'|'cash',
}, customerId: string) {

  let totalAmount = 0
  let estimatedReadyTime = 0

  const menuItemIds = data.items.map(item => item.menu_item_id)

  const fetchedItems = await db.query.menu_items.findMany({
    where: inArray(menu_items.id, menuItemIds)
  })

  for (const item of data.items) {
    const menuItem = fetchedItems.find(m => m.id === item.menu_item_id)

    if (!menuItem) throw Errors.notFound('Menu item')
    if (menuItem.lounge_id !== data.lounge_id) throw Errors.badRequest('Menu item does not belong to this lounge')
    if (!menuItem.is_available) throw Errors.badRequest(`${menuItem.name} is not available`)

    totalAmount += Number(menuItem.price) * item.quantity
    estimatedReadyTime += Number(menuItem.estimated_preparation_time) * item.quantity
  }

  return await db.transaction(async (tx) => {

    const [order] = await tx.insert(orders).values({
      customer_id: customerId,
      lounge_id: data.lounge_id,
      order_type: 'online',
      status: 'pending',
      total_amount: String(totalAmount),
      estimated_ready_time: estimatedReadyTime
    }).returning()

    await tx.insert(order_items).values(
      data.items.map((item) => {
        const menuItem = fetchedItems.find(menu => menu.id === item.menu_item_id)!

        return {
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: menuItem.price,
          special_instructions: item.special_instructions
        }
      })
    )

    if (data.payment_method === 'chapa') {

      const customer = await tx.query.customers.findFirst({
        where: eq(customers.id, customerId)
      })

      const chapaPayment = await initializeChapaPayment({
        amount: totalAmount,
        email: customer!.email,
        first_name: customer!.first_name,
        last_name: customer!.last_name,
        reference: order.id,
      })

      await tx.insert(payments).values({
        order_id: order.id,
        lounge_id: data.lounge_id,
        amount: String(totalAmount),
        payment_method: 'chapa',
        payment_status: 'pending',
        payer_type: 'cafe',
        tx_ref: chapaPayment.tx_ref
      })

      return {
        order,
        payment_url: chapaPayment.payment_url,
        tx_ref: chapaPayment.tx_ref
      }
    }
  })
}


// update order status
export async function updateOrderStatus(orderId: string, status: 'preparing' | 'ready', staffId: string) {

  const order = await findOrder(orderId)

  const staffEntry = await db.query.lounge_staff.findFirst({
    where: eq(lounge_staff.user_id, staffId)
  })

  if (!staffEntry) throw Errors.notFound('Staff')

  if (staffEntry.lounge_id !== order.lounge_id) {
    throw Errors.badRequest('Order does not belong to your lounge')
  }

  if (order.status === 'confirmed' && status !== 'preparing') {
    throw Errors.badRequest('Order must go to preparing first')
  }

  if (order.status === 'preparing' && status !== 'ready') {
    throw Errors.badRequest('Order must go to ready next')
  }

  if (order.status !== 'confirmed' && order.status !== 'preparing') {
    throw Errors.badRequest('Order cannot be updated at this stage')
  }

  const [updatedOrder] = await db.update(orders)
    .set({ status })
    .where(eq(orders.id, orderId))
    .returning()

  if (status === 'ready' && updatedOrder.customer_id) {

    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, updatedOrder.customer_id)
    })

    if (customer?.device_token) {
      await sendPushNotification({
        device_token: customer.device_token,
        title: 'Your order is ready! 🍽️',
        body: 'Come pick up your order at the lounge.',
        order_id: orderId,
      })
    }
  }

  return updatedOrder
}


// collect order
export async function collectOrder(orderId: string, cashierId: string) {

  const order = await findOrder(orderId)

  const staffEntry = await db.query.lounge_staff.findFirst({
    where: eq(lounge_staff.user_id, cashierId)
  })

  if (!staffEntry) throw Errors.notFound('Staff')

  if (staffEntry.lounge_id !== order.lounge_id) {
    throw Errors.badRequest('Order does not belong to your lounge')
  }

  if (order.status !== 'ready') {
    throw Errors.badRequest('Only ready status can be marked collected')
  }

  const [updatedOrder] = await db.update(orders)
    .set({ status: 'collected' })
    .where(eq(orders.id, orderId))
    .returning()

  return updatedOrder
}


// get lounge orders
export async function getLoungeOrders(staffId: string) {

  const staffEntry = await db.query.lounge_staff.findFirst({
    where: eq(lounge_staff.user_id, staffId)
  })

  if (!staffEntry) throw Errors.notFound('Staff')

  return await db.query.orders.findMany({
    where: eq(orders.lounge_id, staffEntry.lounge_id),
    with: {
      order_items: {
        with: {
          menu_item: true
        }
      }
    }
  })
}


// get customer orders
export async function getCustomerOrders(customerId: string) {

  return await db.query.orders.findMany({
    where: eq(orders.customer_id, customerId),
    with: {
      order_items: {
        with: {
          menu_item: true
        }
      }
    }
  })
}


// walk-in orders
export async function createWalkInOrder(data: {
  items: {
    menu_item_id: string
    quantity: number
    special_instructions?: string
  }[]
}, cashierId: string) {

  const staffEntry = await db.query.lounge_staff.findFirst({
    where: eq(lounge_staff.user_id, cashierId)
  })

  if (!staffEntry) throw Errors.notFound('lounge')

  let totalAmount = 0
  let estimatedReadyTime = 0

  const menuItemIds = data.items.map(item => item.menu_item_id)

  const fetchedItems = await db.query.menu_items.findMany({
    where: inArray(menu_items.id, menuItemIds)
  })

  for (const item of data.items) {

    const menuItem = fetchedItems.find(m => m.id === item.menu_item_id)

    if (!menuItem) throw Errors.notFound('Menu item')

    if (menuItem.lounge_id !== staffEntry.lounge_id) {
      throw Errors.badRequest('Menu item does not belong to this lounge')
    }

    if (!menuItem.is_available) {
      throw Errors.badRequest(`${menuItem.name} is not available`)
    }

    totalAmount += Number(menuItem.price) * item.quantity
    estimatedReadyTime += Number(menuItem.estimated_preparation_time) * item.quantity
  }

  return await db.transaction(async (tx) => {

    const [order] = await tx.insert(orders).values({
      order_type: 'walk_in',
      lounge_id: staffEntry.lounge_id,
      status: 'confirmed',
      total_amount: String(totalAmount),
      estimated_ready_time: estimatedReadyTime
    }).returning()

    const items = await tx.insert(order_items).values(
      data.items.map((item) => {
        const menuItem = fetchedItems.find(menu => menu.id === item.menu_item_id)!

        return {
          menu_item_id: item.menu_item_id,
          order_id: order.id,
          special_instructions: item.special_instructions,
          quantity: item.quantity,
          unit_price: menuItem.price
        }
      })
    ).returning()

    await tx.insert(payments).values({
      order_id: order.id,
      lounge_id: staffEntry.lounge_id,
      amount: String(totalAmount),
      payment_method: 'cash',
      payment_status: 'completed',
      payer_type: 'walk_in',
    })

    return { order, items }
  })
}