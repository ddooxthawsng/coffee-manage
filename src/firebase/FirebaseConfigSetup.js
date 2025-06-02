// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0nFgKvtzhJJkZkefdeOE8hRFaRgq_1EE",
  authDomain: "coffee-66a14.firebaseapp.com",
  projectId: "coffee-66a14",
  storageBucket: "coffee-66a14.firebasestorage.app",
  messagingSenderId: "753846957748",
  appId: "1:753846957748:web:55774449845c90671309e1",
  measurementId: "G-WRDHPF28Z3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
