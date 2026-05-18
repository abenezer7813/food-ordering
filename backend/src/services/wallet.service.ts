import z, { date } from "zod";
import { db } from "../db/index.js";
import { customers, lounges, non_cafe_customers, top_up_requests, wallet_transactions, wallets } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { Errors } from "../utils/errors.js";
import { findCustomer, findLounge } from "./common.js";
import { initializeChapaPayment, verifyChapaPayment } from "../utils/chapa.js";



export async function  getNonCafeUser(customerId:string,loungeId:string) {
    const lounge = await findLounge(loungeId)
   const existing = await db.query.wallets.findFirst({
    where: and(
      eq(wallets.customer_id, customerId),
      eq(wallets.lounge_id, loungeId)
    )
  })
  if (existing) return true
  return false
}
// service
export async function nonCafeRegistration(customerId: string, loungeId: string) {
  // 1. Check lounge exists
  const lounge = await findLounge(loungeId)

  // 2. Check not already registered
  const existing = await db.query.wallets.findFirst({
    where: and(
      eq(wallets.customer_id, customerId),
      eq(wallets.lounge_id, loungeId)
    )
  })
  if (existing) throw Errors.alreadyExists('Already registered as non-cafe for this lounge')

  // 3. Create non_cafe_customer + wallet in transaction
  return await db.transaction(async (tx) => {
    await tx.insert(non_cafe_customers).values({
      customer_id: customerId,
      lounge_id: loungeId,
    })

    const [newWallet] = await tx.insert(wallets).values({
      customer_id: customerId,
      lounge_id: loungeId,
    }).returning()

    return newWallet
  })
}

export async function balanceTopUp(amount: number, lougeId: string, customerId: string) {
  const wallet = await db.query.wallets.findFirst({
    where: and(eq(wallets.lounge_id, lougeId),
      eq(wallets.customer_id, customerId))
  })
  if (!wallet) throw Errors.notFound('wallet is ')
  const customer = await findCustomer(customerId)
  const chapaPayment = await initializeChapaPayment({
    amount: amount,
    email: customer!.email,
    first_name: customer!.first_name,
    last_name: customer!.last_name,
    reference: wallet.id,
  })
  // after getting chapaPayment
  await db.insert(wallet_transactions).values({
    wallet_id: wallet.id,
    amount: String(amount),
    transaction_type: 'top_up',
    tx_ref: chapaPayment.tx_ref,
  })
  return chapaPayment;
}

//verify payment 
export async function verifyTopUp(tx_ref: string) {
  // 1. Verify with Chapa
  const chapaData = await verifyChapaPayment(tx_ref)
  if (chapaData.status !== 'success') {
    throw Errors.badRequest('Payment not completed yet')
  }
  // 2. Find wallet by tx_ref — need to figure out how to link tx_ref to wallet
  const walletTransaction = await db.query.wallet_transactions.findFirst({
    where: eq(wallet_transactions.tx_ref, tx_ref)
  })

  if (!walletTransaction) throw Errors.notFound('Transaction not found')

  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.id, walletTransaction.wallet_id)
  })
  if (!wallet) throw Errors.notFound('Wallet ')
  const newBalance = Number(wallet.balance) + Number(walletTransaction.amount)

  const [updatedBalance] = await db.update(wallets).set({
    balance: String(newBalance)
  }).where(eq(wallets.id, walletTransaction.wallet_id)).returning()

  return updatedBalance
}


//get balance 
export async function getWalletBalance(loungeId:string,customerId:string) {
  const wallet=await db.query.wallets.findFirst({
    where:and(eq(wallets.lounge_id,loungeId),
             eq(wallets.customer_id,customerId))
  })
  if(!wallet) throw Errors.notFound('Wallet is ')
    return wallet
  
}
// get transaction histry
export async function getTransactionHistory(loungeId:string,customerId:string) {
  const wallet=await db.query.wallets.findFirst({
    where:and(eq(wallets.lounge_id,loungeId),
             eq(wallets.customer_id,customerId))
  })
  if(!wallet) throw Errors.notFound('Wallet is ')
  const transaction=await  db.query.wallet_transactions.findMany({
where:eq(wallet_transactions.wallet_id,wallet.id)})
return transaction
  
}
export async function createTopUpRequest(data: {
  customer_id: string
  lounge_id: string
  amount: number
  payment_method: 'cash' | 'bank_transfer'
  receipt_image_url?: string
}) {
  const wallet = await db.query.wallets.findFirst({
    where: and(
      eq(wallets.customer_id, data.customer_id),
      eq(wallets.lounge_id, data.lounge_id)
    )
  })
  if (!wallet) throw Errors.notFound('Wallet')

  const [request] = await db.insert(top_up_requests).values({
    customer_id: data.customer_id,
    lounge_id: data.lounge_id,
    amount: String(data.amount),
    payment_method: data.payment_method,
    receipt_image_url: data.receipt_image_url,
    status: 'pending',
  }).returning()

  return request
}

export async function cashierApproveTopUp(requestId: string, cashierId: string) {
  const request = await db.query.top_up_requests.findFirst({
    where: eq(top_up_requests.id, requestId)
  })
  if (!request) throw Errors.notFound('Top up request')
  if (request.status !== 'pending') throw Errors.badRequest('Request is not pending')

  if (request.payment_method === 'cash') {
    // Cash — update wallet immediately
    const wallet = await db.query.wallets.findFirst({
      where: and(
        eq(wallets.customer_id, request.customer_id),
        eq(wallets.lounge_id, request.lounge_id)
      )
    })
    if (!wallet) throw Errors.notFound('Wallet')

    await db.transaction(async (tx) => {
      await tx.update(wallets)
        .set({ balance: String(Number(wallet.balance) + Number(request.amount)), updated_at: new Date() })
        .where(eq(wallets.id, wallet.id))

      await tx.update(top_up_requests)
        .set({ status: 'manager_approved', cashier_id: cashierId, updated_at: new Date() })
        .where(eq(top_up_requests.id, requestId))
    })

    
    return { message: 'Cash top up approved and wallet updated' }

  } else {
    const [updated] = await db.update(top_up_requests)
      .set({ status: 'cashier_approved', cashier_id: cashierId, updated_at: new Date() })
      .where(eq(top_up_requests.id, requestId))
      .returning()

    return updated
  }
}

export async function managerApproveTopUp(requestId: string, managerId: string) {
  const request = await db.query.top_up_requests.findFirst({
    where: eq(top_up_requests.id, requestId)
  })
  if (!request) throw Errors.notFound('Top up request')
  if (request.status !== 'cashier_approved') throw Errors.badRequest('Request must be cashier approved first')

  // Update wallet balance
  const wallet = await db.query.wallets.findFirst({
    where: and(
      eq(wallets.customer_id, request.customer_id),
      eq(wallets.lounge_id, request.lounge_id)
    )
  })
  if (!wallet) throw Errors.notFound('Wallet')

  await db.transaction(async (tx) => {
    await tx.update(wallets)
      .set({ balance: String(Number(wallet.balance) + Number(request.amount)), updated_at: new Date() })
      .where(eq(wallets.id, wallet.id))

    await tx.update(top_up_requests)
      .set({ status: 'manager_approved', manager_id: managerId, updated_at: new Date() })
      .where(eq(top_up_requests.id, requestId))
  })

  return { message: 'Wallet topped up successfully' }
}

export async function rejectTopUpRequest(requestId: string, staffId: string, rejection_reason: string) {
  const request = await db.query.top_up_requests.findFirst({
    where: eq(top_up_requests.id, requestId)
  })
  if (!request) throw Errors.notFound('Top up request')
  if (request.status === 'manager_approved') throw Errors.badRequest('Cannot reject an approved request')

  const [updated] = await db.update(top_up_requests)
    .set({ status: 'rejected', rejection_reason, updated_at: new Date() })
    .where(eq(top_up_requests.id, requestId))
    .returning()

  return updated
}

export async function getTopUpRequests(loungeId: string) {
  return await db.query.top_up_requests.findMany({
    where: eq(top_up_requests.lounge_id, loungeId),
    orderBy: (top_up_requests, { desc }) => [desc(top_up_requests.created_at)],
    with: {
      customer: {
        columns: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        }
      }
    }
  })
}

export async function getCustomerTopUpRequests(customerId: string, loungeId: string) {
  return await db.query.top_up_requests.findMany({
    where: and(
      eq(top_up_requests.customer_id, customerId),
      eq(top_up_requests.lounge_id, loungeId)
    ),
    orderBy: (top_up_requests, { desc }) => [desc(top_up_requests.created_at)],
  })
}