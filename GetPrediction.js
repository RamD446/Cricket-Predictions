import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Main function to load predictions
export async function loadPredictions() {
  const predictionContainer = document.querySelector('#content-prediction .row');
  if (!predictionContainer) return;

  predictionContainer.innerHTML = ''; // Clear existing content

  try {
    const snapshot = await get(child(ref(database), 'prediction'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      const entries = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));

      entries.forEach(entry => {
        const card = createPredictionCard(entry);
        predictionContainer.appendChild(card);
      });
    } else {
      showNoPrediction(predictionContainer);
    }
  } catch (err) {
    console.error('❌ Error loading predictions:', err);
    showNoPrediction(predictionContainer);
  }
}

// Utility: create a prediction card element
function createPredictionCard(entry) {
  const div = document.createElement('div');
  div.className = 'col-12 mb-3';

  const guid = entry.id || `pred-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const timeAgo = getTimeAgo(entry.date);

  div.innerHTML = `
    <div class="card shadow-sm border border-0 rounded-4 bg-light">
      <div class="card-body p-3">

        <!-- Reduced font size for title -->
        <h5 class="card-title text-primary mb-2 fs-6">
          <i class="bi bi-graph-up-arrow me-2 text-success"></i>${entry.title}
        </h5>

        <small class="text-muted d-block mb-2">
          <i class="bi bi-clock me-1"></i> ${timeAgo}
        </small>

        <div id="content-${guid}" class="collapse">
          <div class="card-text mb-2">${entry.content}</div>
          <small class="text-muted d-block">
            <i class="bi bi-person-circle me-1"></i> Created by: ${entry.author || 'Anonymous'} 
            <i class="bi bi-calendar-event ms-2 me-1"></i> ${formatDate(entry.date)}
          </small>
        </div>

        <button class="btn btn-sm btn-outline-dark px-3 rounded-pill show-more-btn mt-2"
                data-bs-toggle="collapse"
                data-bs-target="#content-${guid}"
                aria-expanded="false"
                aria-controls="content-${guid}">
          Read More
        </button>
      </div>
    </div>
  `;

  setTimeout(() => {
    const button = div.querySelector('.show-more-btn');
    const content = div.querySelector(`#content-${guid}`);
    button.addEventListener('click', () => {
      setTimeout(() => {
        const isExpanded = content.classList.contains('show');
        button.textContent = isExpanded ? 'Read Less' : 'Read More';
      }, 200);
    });
  }, 0);

  return div;
}

// Utility: show fallback message
function showNoPrediction(container) {
  container.innerHTML = `<p class="text-muted">No predictions available at the moment.</p>`;
}

// Utility: format full date
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString();
  } catch {
    return dateStr;
  }
}

// Utility: time ago formatter
function getTimeAgo(dateStr) {
  try {
    const now = new Date();
    const past = new Date(dateStr);
    const diff = Math.floor((now - past) / 1000); // in seconds

    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} day(s) ago`;
  } catch {
    return '';
  }
}
