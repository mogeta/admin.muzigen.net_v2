import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

export function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // サービスアカウントキーの設定
  // 環境変数から読み込む（JSON文字列またはBase64エンコードされた文字列）
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccount) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set'
    );
  }

  try {
    // JSON文字列をパース
    const serviceAccountJSON = JSON.parse(serviceAccount);

    adminApp = initializeApp({
      credential: cert(serviceAccountJSON),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

export function getAdminStorage() {
  const app = getAdminApp();
  return getStorage(app);
}
