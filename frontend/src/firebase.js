import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC0G3bv9YbQzqYPLYRGKotVAKzoA1h6Qw4",
    authDomain: "studyflow-ai-ec73d.firebaseapp.com",
    projectId: "studyflow-ai-ec73d",
    storageBucket: "studyflow-ai-ec73d.firebasestorage.app",
    messagingSenderId: "761813701180",
    appId: "1:761813701180:web:eea8c44a9ae5fd473de939",
    measurementId: "G-1E0G5Y6RVD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
