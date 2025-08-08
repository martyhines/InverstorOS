import Constants from 'expo-constants';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const extra = (Constants.expoConfig as any)?.extra || {};

const firebaseConfig = {
  apiKey: extra.firebase?.apiKey,
  authDomain: extra.firebase?.authDomain,
  projectId: extra.firebase?.projectId,
  storageBucket: extra.firebase?.storageBucket,
  messagingSenderId: extra.firebase?.messagingSenderId,
  appId: extra.firebase?.appId,
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

// Simplified: use default auth across platforms to avoid native-only imports during web bundling
const auth = getAuth(app);

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

