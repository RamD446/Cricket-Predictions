import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Firebase config — replace with your real data
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://rdmdb-76959-default-rtdb.firebaseio.com",
  projectId: "rdmdb-76959",
  storageBucket: "rdmdb-76959.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("predictionForm");
const list = document.getElementById("predictionList");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const team1 = document.getElementById("team1").value;
  const team2 = document.getElementById("team2").value;
  const prediction = document.getElementById("prediction").value;

  push(ref(db, "predictions"), {
    team1,
    team2,
    prediction,
    timestamp: Date.now()
  });

  form.reset();
});

// Display predictions
onValue(ref(db, "predictions"), (snapshot) => {
  list.innerHTML = "";
  const data = snapshot.val();
  if (data) {
    Object.values(data).forEach(pred => {
      const li = document.createElement("li");
      li.textContent = `${pred.team1} vs ${pred.team2}: ${pred.prediction}`;
      list.appendChild(li);
    });
  }
});
