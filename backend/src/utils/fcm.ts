import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import 'dotenv/config'

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH!, 'utf8')
  )

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

export async function sendPushNotification(data: {
  device_token: string
  title:        string
  body:         string
  order_id?:    string
}) {
  if (!data.device_token) return  // skip if no token

  await admin.messaging().send({
    token: data.device_token,
    notification: {
      title: data.title,
      body:  data.body,
    },
    data: {
      order_id: data.order_id ?? '',
    },
    android: {
      priority: 'high',
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        }
      }
    }
  })
}