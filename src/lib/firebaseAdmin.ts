import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

if (!admin.apps.length) {
    try {
        let credential;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(serviceAccount);
        } else {
            // Fallback for local development
            const serviceAccountPath = path.resolve(process.cwd(), 'firebase-admin-key.json');
            if (fs.existsSync(serviceAccountPath)) {
                credential = admin.credential.cert(serviceAccountPath);
            }
        }

        if (credential) {
            admin.initializeApp({ credential });
            console.log('Firebase Admin initialized successfully.');
        } else {
            console.warn('Firebase Admin credentials missing. Push notifications will not work.');
        }
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export const messaging = admin.apps.length ? admin.messaging() : null;
