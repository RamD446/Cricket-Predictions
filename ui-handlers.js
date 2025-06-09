import { database } from './firebase.js';
import { quill } from './quill-setup.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

export let allPredictions = [];
export let editId = null;

export function loadPredictions(renderFn) {
  const predictionsRef = ref(database, 'predictions');
  onValue(predictionsRef, (snapshot) => {
    allPredictions = [];
    snapshot.forEach(child => {
      allPredictions.push({ id: child.key, ...child.val() });
    });
    allPredictions.reverse();
    renderFn("all");
  });
}

export function renderPredictions(sport) {
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
    const dateStr = new Date(data.timestamp).toLocaleDateString();
    const timeStr = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const collapseId = `collapse-${index}`;

    const item = document.createElement("div");
    item.className = "col-md-12 mb-3";

item.innerHTML = `
  <div class="card border-0 shadow-sm rounded-3 overflow-hidden mb-3" style="font-size: 0.78rem;">
    <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center px-3 py-2">
      <div class="text-danger fw-semibold d-flex align-items-center">
        <i class="bi bi-calendar-event me-2"></i>
        <span>${dateStr} - ${timeStr}</span>
      </div>
      <div class="text-muted small">
        <i class="bi bi-person-circle me-1"></i> ${data.createdBy}
      </div>
    </div>

    <div class="card-body px-3 py-2">
      <h6 class="card-title fw-semibold text-dark mb-2" style="line-height: 1.2;">
        🏏 ${data.title}<br>
        <span class="text-primary">${data.teamA}</span> vs <span class="text-success">${data.teamB}</span> 
        <small class="text-muted">(${data.gameType})</small>
      </h6>

      <p class="mb-2"><strong>Match #:</strong> ${data.matchNumber}</p>

      <div class="mb-2">
        <div class="progress" style="height: 10px;">
          <div class="progress-bar bg-primary" style="width: ${data.teamAChance}%"></div>
          <div class="progress-bar bg-success" style="width: ${data.teamBChance}%"></div>
        </div>
        <div class="d-flex justify-content-between small mt-1 text-muted">
          <span><strong>${data.teamA}:</strong> ${data.teamAChance}%</span>
          <span><strong>${data.teamB}:</strong> ${data.teamBChance}%</span>
        </div>
      </div>

      <div id="${collapseId}" class="collapse mb-2">
        <div class="bg-light p-2 rounded">${data.text}</div>
      </div>

      <div class="d-flex justify-content-end">
        <button class="btn btn-sm btn-outline-primary toggle-collapse-btn px-2 py-1" 
                data-target="#${collapseId}" style="font-size: 0.75rem;">
          🔽 Read More
        </button>
      </div>
    </div>
  </div>
`;

    container.appendChild(item);
  });

  // Collapse toggle functionality
  document.querySelectorAll('.toggle-collapse-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const content = document.querySelector(targetId);
      content.classList.toggle('show');
      btn.innerHTML = content.classList.contains('show') ? "🔼 Show Less" : "🔽 Read More";
    });
  });

  // Edit button event
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const match = allPredictions.find(p => p.id === id);
      if (match) fillFormForEdit(id, match);
    });
  });
}

export function fillFormForEdit(id, data) {
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

export function resetForm() {
  document.getElementById('predictionForm').reset();
  quill.root.innerHTML = '';
  document.getElementById('teamBChance').value = '';
  editId = null;
  loadPredictions(renderPredictions);
}
