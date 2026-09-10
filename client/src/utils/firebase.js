import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "webmate-ai.firebaseapp.com",
  projectId: "webmate-ai",
  storageBucket: "webmate-ai.firebasestorage.app",
  messagingSenderId: "332650661686",
  appId: "1:332650661686:web:058b1fc3e941a511291597"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth, provider}