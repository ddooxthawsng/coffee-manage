import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // BỔ SUNG import này

const firebaseConfig = {
    apiKey: "AIzaSyAbGI5O3Zvy3uaxLdxdYT62Yq2vJluPgA8",
    authDomain: "pickup-cf.firebaseapp.com",
    projectId: "pickup-cf",
    storageBucket: "pickup-cf.appspot.com", // SỬA ĐÚNG storageBucket
    messagingSenderId: "2034254116",
    appId: "1:2034254116:web:e4ee74bed6818c4dd8b3b1",
    measurementId: "G-78MW2PD0RT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // BỔ SUNG export Firestore nếu cần
