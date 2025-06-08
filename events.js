// events.js
import { ref, set, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { database } from './firebase.js';
import { quill } from './quill-setup.js';
import { loadPredictions, renderPredictions, resetForm, editId, allPredictions } from './ui-handlers.js';

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

document.getElementById('teamAChance').addEventListener('input', () => {
  const val = parseFloat(document.getElementById('teamAChance').value);
  if (!isNaN(val) && val >= 0 && val <= 100) {
    document.getElementById('teamBChance').value = (100 - val).toFixed(2);
  }
});

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const sport = btn.getAttribute("data-sport");
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPredictions(sport);
  });
});

window.addEventListener('DOMContentLoaded', () => {
  loadPredictions(renderPredictions);
});
