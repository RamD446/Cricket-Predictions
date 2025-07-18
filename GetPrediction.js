import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const ITEMS_PER_PAGE = 20;
let allEntries = [];
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
      allEntries = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));

      totalPages = Math.ceil(allEntries.length / ITEMS_PER_PAGE);
      currentPage = Math.max(1, Math.min(page, totalPages));

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageEntries = allEntries.slice(start, end);

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
  const relativeTime = formatRelativeTime(entry.date);

  const rawContent = entry.content || '';
  const imgMatch = rawContent.match(/<img[^>]+src="([^">]+)"/i);
  const hasImage = !!imgMatch;
  const imageURL = hasImage ? imgMatch[1] : 'https://via.placeholder.com/100x100?text=Prediction';

  const cleanContent = rawContent.replace(/<img[^>]*>/gi, '').replace(/<[^>]+>/g, '').slice(0, 50);

  const imageHTML = hasImage
    ? `<div class="p-2 pt-3 pe-3" style="flex-shrink: 0;">
         <img src="${imageURL}" alt="Image"
              style="width: 80px; height: 80px; object-fit: cover; border-radius: 0.75rem;" />
       </div>`
    : '';

  div.innerHTML = `
    <a href="details.html?tabType=prediction&id=${guid}" class="text-decoration-none text-dark h-100 d-block">
      <div class="card h-100 border border-light-subtle rounded-4 bg-white shadow-sm hover-glow-effect overflow-hidden d-flex flex-row align-items-start">
        ${imageHTML}
        <div class="card-body d-flex flex-column p-3">
          <h6 class="fw-bold mb-2 text-primary" style="font-size: 1rem;">
            <span class="text-danger">✅</span> ${entry.title || 'Untitled Prediction'}
          </h6>
          <p class="text-muted flex-grow-1 mb-2" style="font-size: 0.85rem;">
            ${cleanContent}...
          </p>
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

function formatRelativeTime(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `${diffSec} sec ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
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
