import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDh--KGnevo6j3gYsp2sCswGuk6oRs6Xqg",
    authDomain: "recipe-search-6fdd6.firebaseapp.com",
    projectId: "recipe-search-6fdd6",
    storageBucket: "recipe-search-6fdd6.firebasestorage.app",
    messagingSenderId: "1020755817751",
    appId: "1:1020755817751:web:11e1a0b38a87c121cf7352"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };