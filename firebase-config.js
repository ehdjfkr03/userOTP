// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set, child, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyBj3fqWr-Oxy9OFsGht_DdBltrCHTUksJ4",
    authDomain: "door-f6125.firebaseapp.com",
    databaseURL: "https://door-f6125-default-rtdb.firebaseio.com",
    projectId: "door-f6125",
    storageBucket: "door-f6125.firebasestorage.app",
    messagingSenderId: "689437771026",
    appId: "1:689437771026:web:7a4940babc62fd5e231fcb",
    measurementId: "G-J296KSBH27"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, get, set, child, update };
