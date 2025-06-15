import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalPages = 1;
let allEntries = [];

export async function loadMovies(page = 1) {
  const movieContainer = document.querySelector('#content-movie .row');
  const paginationContainer = document.querySelector('#content-movie .pagination-controls');

  if (!movieContainer) return;

  movieContainer.innerHTML = '';
  paginationContainer.innerHTML = '';

  try {
    const snapshot = await get(child(ref(database), 'movie'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      allEntries = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));

      totalPages = Math.ceil(allEntries.length / ITEMS_PER_PAGE);
      currentPage = Math.max(1, Math.min(page, totalPages));

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;

      const pageItems = allEntries.slice(start, end);
      pageItems.forEach(entry => {
        const card = createMovieCard(entry);
        movieContainer.appendChild(card);
      });

      renderPagination(paginationContainer);
    } else {
      showNoMovies(movieContainer);
    }
  } catch (err) {
    console.error('❌ Error loading movies:', err);
    showNoMovies(movieContainer);
  }
}

function createMovieCard(entry) {
  const div = document.createElement('div');
  div.className = 'col-12 mb-2';

  const guid = entry.id || `movie-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const relativeTime = formatRelativeTime(entry.date);

  div.innerHTML = `
    <div class="card shadow-sm border-0 rounded-4 bg-light mb-1">
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-center">
          <a href="details.html?tabType=movie&id=${guid}" 
             class="text-decoration-none text-primary fw-semibold fs-6 d-flex align-items-center flex-grow-1 me-2 title-hover">
            ${entry.title}
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
            <i class="bi bi-calendar-event ms-2 me-1"></i> ${formatDate(entry.date)}
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
  prevBtn.onclick = () => loadMovies(currentPage - 1);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.className = 'btn btn-sm btn-outline-primary';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => loadMovies(currentPage + 1);

  const pageInfo = document.createElement('span');
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  pageInfo.className = 'text-muted me-3';

  container.appendChild(prevBtn);
  container.appendChild(pageInfo);
  container.appendChild(nextBtn);
}

function showNoMovies(container) {
  container.innerHTML = `<p class="text-muted">No movie reviews at the moment.</p>`;
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
