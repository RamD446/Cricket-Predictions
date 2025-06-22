import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalPages = 1;
let allJobs = [];

export async function loadJobs(page = 1) {
  const container = document.querySelector('#content-jobs .row');
  const pagination = document.querySelector('#content-jobs .pagination-controls');

  if (!container || !pagination) return;

  container.innerHTML = '';
  pagination.innerHTML = '';

  try {
    const snapshot = await get(child(ref(database), 'jobs'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      allJobs = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));

      totalPages = Math.ceil(allJobs.length / ITEMS_PER_PAGE);
      currentPage = Math.max(1, Math.min(page, totalPages));

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageEntries = allJobs.slice(start, end);

      pageEntries.forEach(entry => {
        const card = createJobCard(entry);
        container.appendChild(card);
      });

      renderPagination(pagination);
    } else {
      showNoJobs(container);
    }
  } catch (err) {
    console.error('❌ Error loading jobs:', err);
    showNoJobs(container);
  }
}

function createJobCard(entry) {
  const div = document.createElement('div');
  div.className = 'col-md-6 col-12 mb-4';

  const guid = entry.id || `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const relativeTime = getRelativeTime(entry.date);
  const contentPreview = (entry.content || 'No description provided').replace(/<[^>]+>/g, '').slice(0, 120);

  div.innerHTML = `
    <a href="details.html?tabType=jobs&id=${guid}" class="text-decoration-none text-dark d-block h-100">
      <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden card-hover-effect bg-light">
        <div class="card-body d-flex flex-column">
          <h6 class="fw-bold mb-2 text-primary" style="font-size: 1rem;">
            🧑‍💼 ${entry.title || 'Untitled Job'}
          </h6>
          <p class="text-muted flex-grow-1 mb-2" style="font-size: 0.85rem;">
            ${contentPreview}...
          </p>
        </div>
        <div class="card-footer bg-transparent border-0 pt-0 pb-3 px-3 d-flex justify-content-between align-items-center text-muted" style="font-size: 0.7rem;">
          <span><i class="bi bi-person-circle me-1"></i>${entry.author || 'Admin'}</span>
          <span><i class="bi bi-calendar-event me-1"></i>${formatDate(entry.date)}</span>
          <span class="badge bg-secondary">${relativeTime}</span>
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
  prevBtn.onclick = () => loadJobs(currentPage - 1);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.className = 'btn btn-sm btn-outline-primary';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => loadJobs(currentPage + 1);

  const pageInfo = document.createElement('span');
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  pageInfo.className = 'text-muted me-3';

  container.appendChild(prevBtn);
  container.appendChild(pageInfo);
  container.appendChild(nextBtn);
}

function showNoJobs(container) {
  container.innerHTML = `<p class="text-muted">No job notifications available at the moment.</p>`;
}

function getRelativeTime(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffSec = Math.floor((now - then) / 1000);
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
