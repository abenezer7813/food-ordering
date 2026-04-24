import z, { date } from "zod";
import { db } from "../db/index.js";
import { customers, lounges, non_cafe_customers, wallet_transactions, wallets } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { Errors } from "../utils/errors.js";
import { findCustomer, findLounge } from "./common.js";
import { initializeChapaPayment, verifyChapaPayment } from "../utils/chapa.js";


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
