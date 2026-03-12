import nodemailer from 'nodemailer'
import 'dotenv/config'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
})

export async function sendOTPEmail(email: string, otp: string) {
   
  await transporter.sendMail({
    from:    process.env.EMAIL_USER,
    to:      email,
    subject: 'Verify your Lounge account',
    html:    `
      <h2>Welcome to University Lounge!</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 8px">${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `
  })
}