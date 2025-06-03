// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbGI5O3Zvy3uaxLdxdYT62Yq2vJluPgA8",
  authDomain: "pickup-cf.firebaseapp.com",
  projectId: "pickup-cf",
  storageBucket: "pickup-cf.firebasestorage.app",
  messagingSenderId: "2034254116",
  appId: "1:2034254116:web:e4ee74bed6818c4dd8b3b1",
  measurementId: "G-78MW2PD0RT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;
