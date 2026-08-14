import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';

// This is an ES module script. We need to parse the JSON file manually in Node
const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve('./firebase-admin-key.json'), 'utf8')
);

const app = initializeApp({
  credential: cert(serviceAccount)
});

const messaging = getMessaging(app);

async function testPush() {
  try {
    console.log('Sending test push notification...');
    const response = await messaging.send({
      topic: 'all_technicians',
      notification: {
        title: 'System Test',
        body: 'This is a test notification from the Catla Tech backend!',
      },
      data: {
        complaintId: 'test-1234',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'catla_jobs',
        },
      }
    });
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

testPush();
