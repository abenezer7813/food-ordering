
export async function initializeChapaPayment(data: {
  amount:     number
  email:      string
  first_name: string
  last_name:  string
  reference:   string
}) {
  const tx_ref = `order-${data.reference.slice(-8)}-${Date.now()}`

  const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount:        String(data.amount),
      currency:      'ETB',
      email:         data.email,
      first_name:    data.first_name,
      last_name:     data.last_name,
      tx_ref,
      callback_url:  `${process.env.APP_URL}/payments/webhook`,
      return_url:    `${process.env.APP_URL}/payments/success`,
      customization: {
        title:       'Lounge Order',
        description: 'Order Payment',
      }
    })
  })

  if (!response.ok) {
    const error = await response.json()
  throw new Error(`Chapa error: ${JSON.stringify(error)}`)
  }

  const result = await response.json()
  return {
    payment_url: result.data.checkout_url,
    tx_ref,
  }
}

export async function verifyChapaPayment(tx_ref: string) {
  const response = await fetch(
    `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      }
    }
  )

  if (!response.ok) throw new Error('Chapa verification failed')

  const result = await response.json()
  return result.data
}
