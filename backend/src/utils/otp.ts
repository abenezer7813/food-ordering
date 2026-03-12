interface OTPEntry {
  otp:       string
  expiresAt: Date
}

const otpStore = new Map<string, OTPEntry>()

export function storeOTP(email: string, otp: string) {
  otpStore.set(email, {
    otp,
    expiresAt: new Date(Date.now() + 100* 60 * 1000) // 10 min
  })
}

export function verifyOTP(email: string, otp: string): boolean {
  const entry = otpStore.get(email)
  console.log(entry?.otp)
  if (!entry) return false
  if (new Date() > entry.expiresAt) {
    otpStore.delete(email)
    return false
  }
  if (entry.otp !== otp) return false
  otpStore.delete(email) // ← delete after successful verification
  return true
}