import Constants from 'expo-constants';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth/react-native';
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

// On native, use RN persistence; on web, default browser persistence
let auth = getAuth(app);
try {
  // initializeAuth throws if already initialized; wrap in try
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  // For web compatibility, ensure browser fallback
  // @ts-ignore
  auth.setPersistence?.(browserLocalPersistence).catch(() => {});
} catch {
  // ignore
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

