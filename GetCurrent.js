import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalPages = 1;
let allEntries = [];

export async function loadCurrent(page = 1) {
  const container = document.querySelector('#content-current .row');
  const pagination = document.querySelector('#content-current .pagination-controls');

  if (!container || !pagination) return;

  container.innerHTML = '';
  pagination.innerHTML = '';

  try {
    const snapshot = await get(child(ref(database), 'current'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      allEntries = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));

      totalPages = Math.ceil(allEntries.length / ITEMS_PER_PAGE);
      currentPage = Math.max(1, Math.min(page, totalPages));

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageEntries = allEntries.slice(start, end);

      pageEntries.forEach(entry => container.appendChild(createCard(entry)));
      renderPagination(pagination);
    } else {
      showEmpty(container);
    }
  } catch (err) {
    console.error('❌ Error loading current data:', err);
    container.innerHTML = `<p class="text-danger">Failed to load current info.</p>`;
  }
}

function createCard(entry) {
  const div = document.createElement('div');
  div.className = 'col-12 mb-3';

  const guid = entry.id || `current-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const relativeTime = getRelativeTime(entry.date);

  div.innerHTML = `
    <div class="card shadow-sm border-0 rounded-4 bg-light">
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-center">
          <a href="details.html?tabType=current&id=${guid}" 
             class="text-decoration-none text-primary fw-semibold fs-6 d-flex align-items-center flex-grow-1 me-2 title-hover">
            <i class="bi bi-broadcast-pin me-2 text-success"></i>${entry.title}
          </a>
          <button class="btn btn-sm btn-light border-0 show-more-btn p-1"
                  data-bs-toggle="collapse"
                  data-bs-target="#content-${guid}"
                  aria-expanded="false"
                  aria-controls="content-${guid}"
                  title="Toggle content">
            <i class="bi bi-chevron-down small"></i>
          </button>
        </div>

        <div id="content-${guid}" class="collapse mt-2">
          <div class="text-dark mb-1 small">${entry.content}</div>
          <small class="text-muted d-block">
            <i class="bi bi-person-circle me-1"></i> ${entry.author || 'Anonymous'}
            <i class="bi bi-clock-history ms-2 me-1"></i> ${formatDate(entry.date)}
            <span class="badge bg-secondary ms-2">${relativeTime}</span>
          </small>
        </div>
      </div>
    </div>
  `;

  return div;
}

function renderPagination(container) {
  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.className = 'btn btn-sm btn-outline-primary me-2';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => loadCurrent(currentPage - 1);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.className = 'btn btn-sm btn-outline-primary';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => loadCurrent(currentPage + 1);

  const pageInfo = document.createElement('span');
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  pageInfo.className = 'text-muted me-3';

  container.appendChild(prevBtn);
  container.appendChild(pageInfo);
  container.appendChild(nextBtn);
}

function showEmpty(container) {
  container.innerHTML = `<p class="text-muted">No current updates available.</p>`;
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

function getRelativeTime(dateStr) {
  const now = new Date();
  const past = new Date(dateStr);
  const seconds = Math.floor((now - past) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}
