import { initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCJVpJ2ldicmaU8xt0VPfkFIMxrJD5UfHo",
  authDomain: "cinema-next-app.firebaseapp.com",
  projectId: "cinema-next-app",
  storageBucket: "cinema-next-app.appspot.com",
  messagingSenderId: "267481498225",
  appId: "1:267481498225:web:0155db09f210a663dc91d0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
