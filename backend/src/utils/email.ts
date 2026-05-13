import SibApiV3Sdk from 'sib-api-v3-sdk'
import 'dotenv/config'

export async function sendOTPEmail(email: string, otp: string) {
  const client = SibApiV3Sdk.ApiClient.instance
  client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY!

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  sendSmtpEmail.subject = 'Verify your Lounge account'
  sendSmtpEmail.htmlContent = `
    <h2>Welcome to University Lounge!</h2>
    <p>Your verification code is:</p> 
    <h1 style="letter-spacing: 8px">${otp}</h1>
    <p>This code expires in 10 minutes.</p>
  `
  sendSmtpEmail.sender = { name: 'University Lounge', email: process.env.EMAIL_USER }
  sendSmtpEmail.to = [{ email }]

  await apiInstance.sendTransacEmail(sendSmtpEmail)
}