// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCK_3CTysqCxTWLhMHZ_mtsa-5f1E3w1Js",
  authDomain: "rdmdb-76959.firebaseapp.com",
  databaseURL: "https://rdmdb-76959-default-rtdb.firebaseio.com",
  projectId: "rdmdb-76959",
  storageBucket: "rdmdb-76959.appspot.com",
  messagingSenderId: "415793355835",
  appId: "1:415793355835:web:daf2911118c0c38611d01e",
  measurementId: "G-2ZXYPG8WZT"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
