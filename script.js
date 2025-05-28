// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCK_3CTysqCxTWLhMHZ_mtsa-5f1E3w1Js",
  authDomain: "rdmdb-76959.firebaseapp.com",
  databaseURL: "https://rdmdb-76959-default-rtdb.firebaseio.com",
  projectId: "rdmdb-76959",
  storageBucket: "rdmdb-76959.firebasestorage.app",
  messagingSenderId: "415793355835",
  appId: "1:415793355835:web:daf2911118c0c38611d01e",
  measurementId: "G-2ZXYPG8WZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


function saveFeedback(name, email, message) {
  const feedbackRef = ref(db, 'feedbacks/');
  push(feedbackRef, {
    name,
    email,
    message,
    timestamp: Date.now()
  });
}

const feedbackForm = document.getElementById("feedbackForm");

if (feedbackForm) {
  feedbackForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    saveFeedback(name, email, message);

    alert("✅ Feedback submitted successfully!");
    feedbackForm.reset();
  });
}
