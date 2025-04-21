// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9KoZa0nFU6xQpsuxtsmqz9HydH1J5PEg",
  authDomain: "hotel-app-final.firebaseapp.com",
  projectId: "hotel-app-final",
  storageBucket: "hotel-app-final.firebasestorage.app",
  messagingSenderId: "957592348172",
  appId: "1:957592348172:web:caec0f5ec503634577b029",
  measurementId: "G-VNMP2Z74DE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app); 