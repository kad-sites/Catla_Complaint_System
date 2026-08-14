import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import path from 'path';
import fs from 'fs';

let app: App | undefined;

if (!getApps().length) {
    try {
        let credential;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = cert(serviceAccount);
        } else {
            // Fallback for local development
            const serviceAccountPath = path.resolve(process.cwd(), 'firebase-admin-key.json');
            if (fs.existsSync(serviceAccountPath)) {
                credential = cert(serviceAccountPath);
            }
        }

        if (credential) {
            app = initializeApp({ credential });
            console.log('Firebase Admin initialized successfully.');
        } else {
            console.warn('Firebase Admin credentials missing. Push notifications will not work.');
        }
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
} else {
    app = getApps()[0];
}

export const messaging = app ? getMessaging(app) : null;
