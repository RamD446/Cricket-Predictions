// --- Firebase Setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase config
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
const database = getDatabase(app);

// --- Quill Setup ---
const quill = new Quill('#editor-container', {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['image'],
      ['clean']
    ]
  },
  theme: 'snow'
});

// --- Global Variables ---
let allPredictions = [];
let editId = null;

// --- Load Predictions ---
function loadPredictions() {
  const predictionsRef = ref(database, 'predictions');
  onValue(predictionsRef, (snapshot) => {
    allPredictions = [];
    snapshot.forEach(child => {
      allPredictions.push({ id: child.key, ...child.val() });
    });
    allPredictions.reverse();
    renderPredictions("all");
  });
}

// --- Render Predictions ---
function renderPredictions(sport) {
  const container = document.getElementById("matchAccordion");
  container.innerHTML = "";

  const filtered = allPredictions.filter(p =>
    sport === "all" || (p.gameType && p.gameType.toLowerCase() === sport.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-center text-muted">No predictions found for ${sport}.</div>`;
    return;
  }

  filtered.forEach((data, index) => {
    const matchId = `match-${sport}-${index}`;
    const date = new Date(data.timestamp).toLocaleString();

    const item = document.createElement("div");
    item.className = "accordion-item mb-3";
    item.innerHTML = `
      <h2 class="accordion-header" id="heading${index}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${matchId}">
          ${data.title} - ${data.teamA} vs ${data.teamB} (${data.gameType})
        </button>
      </h2>
      <div id="${matchId}" class="accordion-collapse collapse" data-bs-parent="#matchAccordion">
        <div class="accordion-body">
          <p><strong>Match #:</strong> ${data.matchNumber}</p>
          <div class="progress mb-2" style="height: 10px;">
            <div class="progress-bar bg-primary" style="width: ${data.teamAChance}%;"></div>
            <div class="progress-bar bg-warning" style="width: ${data.teamBChance}%;"></div>
          </div>
          <p>${data.teamA}: ${data.teamAChance}%</p>
          <p>${data.teamB}: ${data.teamBChance}%</p>
          <div>${data.text}</div>
          <p class="text-muted mt-2 mb-1">By: ${data.createdBy}<br><small>${date}</small></p>
          <button class="btn btn-sm btn-outline-secondary edit-btn" data-id="${data.id}">✏️ Edit</button>
        </div>
      </div>
    `;
    container.appendChild(item);
  });

  // Attach edit handlers
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const match = allPredictions.find(p => p.id === id);
      if (match) fillFormForEdit(id, match);
    });
  });
}

// --- Fill Form to Edit ---
function fillFormForEdit(id, data) {
  document.getElementById('titleInput').value = data.title;
  document.getElementById('matchInput').value = data.matchNumber;
  document.getElementById('teamA').value = data.teamA;
  document.getElementById('teamB').value = data.teamB;
  document.getElementById('teamAChance').value = data.teamAChance;
  document.getElementById('teamBChance').value = data.teamBChance;
  document.getElementById('gameType').value = data.gameType;
  document.getElementById('authorName').value = data.createdBy;
  quill.root.innerHTML = data.text;
  editId = id;
  document.getElementById('status').textContent = "📝 Edit mode enabled — make changes and click Save.";
}

// --- Save or Update Prediction ---
document.getElementById('saveBtn').addEventListener('click', () => {
  const title = document.getElementById('titleInput').value.trim();
  const matchNumber = document.getElementById('matchInput').value.trim();
  const teamA = document.getElementById('teamA').value.trim();
  const teamB = document.getElementById('teamB').value.trim();
  const teamAChance = parseFloat(document.getElementById('teamAChance').value.trim());
  const teamBChance = parseFloat(document.getElementById('teamBChance').value.trim());
  const gameType = document.getElementById('gameType').value;
  const author = document.getElementById('authorName').value.trim();
  const content = quill.root.innerHTML.trim();

  if (!title || !matchNumber || !teamA || !teamB || isNaN(teamAChance) || isNaN(teamBChance) || !gameType || !author || !content) {
    alert("❌ Please fill all fields.");
    return;
  }

  const data = {
    title,
    matchNumber,
    teamA,
    teamB,
    teamAChance,
    teamBChance,
    gameType,
    createdBy: author,
    text: content,
    timestamp: new Date().toISOString()
  };

  const predictionsRef = ref(database, 'predictions');

  if (editId) {
    const editRef = ref(database, `predictions/${editId}`);
    set(editRef, data).then(() => {
      resetForm();
      document.getElementById('status').textContent = "✅ Updated successfully.";
    }).catch(error => {
      document.getElementById('status').textContent = "❌ Update failed: " + error.message;
    });
  } else {
    push(predictionsRef, data).then(() => {
      resetForm();
      document.getElementById('status').textContent = "✅ Saved successfully.";
    }).catch(error => {
      document.getElementById('status').textContent = "❌ Save failed: " + error.message;
    });
  }
});

// --- Reset Form ---
function resetForm() {
  document.getElementById('predictionForm').reset();
  quill.root.innerHTML = '';
  document.getElementById('teamBChance').value = '';
  editId = null;
  loadPredictions(); // refresh list
}

// --- TeamB Auto Update ---
document.getElementById('teamAChance').addEventListener('input', () => {
  const val = parseFloat(document.getElementById('teamAChance').value);
  if (!isNaN(val) && val >= 0 && val <= 100) {
    document.getElementById('teamBChance').value = (100 - val).toFixed(2);
  }
});

// --- Tab Filter Click ---
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const sport = btn.getAttribute("data-sport");
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPredictions(sport);
  });
});

// --- Initial Load ---
loadPredictions();
