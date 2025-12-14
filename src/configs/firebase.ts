import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtcqjCyvOkG7FAU3daLtHf_7ZRZgh0S98",
  authDomain: "euphoric-axon-480911-m6.firebaseapp.com",
  projectId: "euphoric-axon-480911-m6",
  storageBucket: "euphoric-axon-480911-m6.firebasestorage.app",
  messagingSenderId: "300008030002",
  appId: "1:300008030002:web:b584355ba475bd56e0a12b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;