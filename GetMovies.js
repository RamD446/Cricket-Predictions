import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalPages = 1;
let allEntries = [];

/** Load movie data and render paginated cards */
export async function loadMovies(page = 1) {
  const movieContainer = document.querySelector('#content-movie .row');
  const paginationContainer = document.querySelector('#content-movie .pagination-controls');

  if (!movieContainer || !paginationContainer) return;

  movieContainer.innerHTML = '';
  paginationContainer.innerHTML = '';

  try {
    const snapshot = await get(child(ref(database), 'movie'));
    if (!snapshot.exists()) {
      return showNoMovies(movieContainer);
    }

    const data = snapshot.val();
    allEntries = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));

    totalPages = Math.ceil(allEntries.length / ITEMS_PER_PAGE);
    currentPage = Math.min(Math.max(1, page), totalPages);

    const pageItems = allEntries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    pageItems.forEach(entry => movieContainer.appendChild(createMovieCard(entry)));

    renderPagination(paginationContainer);
  } catch (error) {
    console.error('❌ Error loading movies:', error);
    showNoMovies(movieContainer);
  }
}

/** Create a Bootstrap-styled movie card from a single entry */
function createMovieCard(entry) {
  const div = document.createElement('div');
  div.className = 'col-6 mb-2';

  const guid = entry.id || `movie-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tabType = entry.tabType || 'General';
  const badgeColor = getBadgeColor(tabType);

  const rawContent = entry.content || '';
  const imgMatch = rawContent.match(/<img[^>]+src="([^">]+)"/i);
  const hasImage = !!imgMatch;
  const imageURL = hasImage ? imgMatch[1] : '';
  const previewText = rawContent
    .replace(/<img[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .slice(0, 80);

  const imageHTML = hasImage
    ? `<div class="p-1 ps-2">
         <img src="${imageURL}" alt="Image" style="width: 70px; height: 70px; object-fit: cover; border-radius: 0.5rem;" />
       </div>`
    : '';

  div.innerHTML = `
    <a href="details.html?tabType=${tabType}&id=${guid}" class="text-decoration-none text-dark d-block">
      <div class="card border-0 shadow-sm d-flex flex-row align-items-start rounded-3 bg-light" style="min-height: 100px;">
        ${imageHTML}
        <div class="card-body p-2 pt-1 pb-1">
          <span class="badge bg-${badgeColor} text-uppercase mb-1" style="font-size: 0.55rem;">${tabType}</span>
          <h6 class="fw-semibold text-primary mb-1" style="font-size: 0.85rem; line-height: 1.1;">
            <i class="bi bi-play-btn-fill me-1 text-${badgeColor}"></i> ${entry.title}
          </h6>
          <p class="mb-1 text-muted" style="font-size: 0.65rem;">${previewText}...</p>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted" style="font-size: 0.55rem;">${formatDate(entry.date)}</small>
          </div>
        </div>
      </div>
    </a>
  `;

  return div;
}

/** Display a pagination control under the section */
function renderPagination(container) {
  if (totalPages <= 1) return;

  const prevBtn = createButton('Previous', 'outline-primary', () => loadMovies(currentPage - 1), currentPage === 1);
  const nextBtn = createButton('Next', 'outline-primary', () => loadMovies(currentPage + 1), currentPage === totalPages);

  const pageInfo = document.createElement('span');
  pageInfo.className = 'text-muted me-3';
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  container.append(prevBtn, pageInfo, nextBtn);
}

/** Create a simple Bootstrap button */
function createButton(label, style, onClick, disabled = false) {
  const btn = document.createElement('button');
  btn.className = `btn btn-sm btn-${style} me-2`;
  btn.textContent = label;
  btn.disabled = disabled;
  btn.onclick = onClick;
  return btn;
}

/** Fallback if no movie data exists */
function showNoMovies(container) {
  container.innerHTML = `<p class="text-muted">No movie reviews at the moment.</p>`;
}

/** Get readable "x time ago" from timestamp */
function formatRelativeTime(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = (now - then) / 1000;

  if (diff < 60) return `${Math.floor(diff)} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
}

/** Format full date string */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/** Get Bootstrap badge color class */
function getBadgeColor(tabType) {
  const map = {
    movie: 'primary',
    sports: 'success',
    news: 'danger',
    general: 'secondary'
  };
  return map[tabType.toLowerCase()] || 'secondary';
}
