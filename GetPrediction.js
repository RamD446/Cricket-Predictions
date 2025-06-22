import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const ITEMS_PER_PAGE = 20;
let allPredictions = [];
let currentPage = 1;
let totalPages = 1;

export async function loadPredictions(page = 1) {
  const container = document.querySelector('#content-prediction .row');
  const pagination = document.querySelector('#content-prediction .pagination-controls');

  if (!container || !pagination) return;

  container.innerHTML = '';
  pagination.innerHTML = '';

  try {
    const snapshot = await get(child(ref(database), 'prediction'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      allPredictions = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));

      totalPages = Math.ceil(allPredictions.length / ITEMS_PER_PAGE);
      currentPage = Math.max(1, Math.min(page, totalPages));

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageEntries = allPredictions.slice(start, end);

      pageEntries.forEach(entry => container.appendChild(createPredictionCard(entry)));
      renderPagination(pagination);
    } else {
      showNoPrediction(container);
    }
  } catch (err) {
    console.error('❌ Error loading predictions:', err);
    showNoPrediction(container);
  }
}

function createPredictionCard(entry) {
  const div = document.createElement('div');
  div.className = 'col-md-6 col-sm-6 mb-4';

  const guid = entry.id || `pred-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const relativeTime = getTimeAgo(entry.date);
  const cleanContent = (entry.content || '').replace(/<[^>]+>/g, '').slice(0, 100);

  div.innerHTML = `
    <a href="details.html?tabType=prediction&id=${guid}" class="text-decoration-none text-dark h-100 d-block">
      <div class="card h-100 border border-light-subtle rounded-4 bg-white shadow-sm hover-glow-effect overflow-hidden">
        <div class="card-body d-flex flex-column">
          <h6 class="fw-bold mb-2 text-primary" style="font-size: 1rem;">
            ✅ ${entry.title || 'Untitled Prediction'}
          </h6>
          <p class="text-muted flex-grow-1 mb-2" style="font-size: 0.85rem;">
            ${cleanContent}...
          </p>
        </div>

        <div class="card-footer bg-transparent border-0 pt-0 pb-3 px-3 d-flex justify-content-between align-items-center text-muted" style="font-size: 0.7rem;">
            <span><i class="bi bi-person-circle me-1"></i>${entry.author || 'Anonymous'}</span>
            <div class="d-flex gap-3 ms-auto">
              <span><i class="bi bi-calendar-event me-1"></i>${formatDate(entry.date)}</span>
              <span class="badge bg-secondary">${relativeTime}</span>
            </div>
        </div>
      </div>
    </a>
  `;

  return div;
}


function renderPagination(container) {
  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.className = 'btn btn-sm btn-outline-primary me-2';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => loadPredictions(currentPage - 1);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.className = 'btn btn-sm btn-outline-primary';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => loadPredictions(currentPage + 1);

  const pageInfo = document.createElement('span');
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  pageInfo.className = 'text-muted me-3';

  container.appendChild(prevBtn);
  container.appendChild(pageInfo);
  container.appendChild(nextBtn);
}

function showNoPrediction(container) {
  container.innerHTML = `<p class="text-muted">No predictions available at the moment.</p>`;
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

function getTimeAgo(dateStr) {
  try {
    const now = new Date();
    const past = new Date(dateStr);
    const seconds = Math.floor((now - past) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch {
    return '';
  }
}
