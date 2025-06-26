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
  div.className = 'col-md-6 col-sm-12 mb-4';

  const guid = entry.id || `movie-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const relativeTime = formatRelativeTime(entry.date);

  const rawContent = entry.content || '';
  const imgTagMatch = rawContent.match(/<img[^>]+src="([^">]+)"/i);
  const imageURL = imgTagMatch ? imgTagMatch[1] : 'https://via.placeholder.com/400x225?text=No+Image';

  const textOnlyContent = rawContent.replace(/<img[^>]*>/gi, '').replace(/<[^>]+>/g, '');
  const previewText = textOnlyContent.slice(0, 120);
  const tabType = entry.tabType || 'General';

  div.innerHTML = `
    <a href="details.html?tabType=movie&id=${guid}" class="text-decoration-none text-dark d-block h-100">
      <div class="card h-100 border-0 rounded-4 shadow-sm d-flex flex-row overflow-hidden align-items-start hover-glow transition-all bg-light" style="min-height: 160px;">
        
        <!-- Thumbnail Image -->
        <div class="p-2">
          <img src="${imageURL}" alt="Image" style="width: 100px; height: 100px; object-fit: cover; border-radius: 0.75rem;" />
        </div>

        <!-- Content -->
        <div class="card-body d-flex flex-column justify-content-between ps-2 pe-2">
          <div>
            <span class="badge bg-gradient bg-info text-dark mb-1 text-uppercase" style="font-size: 0.6rem;">${tabType}</span>
            <h6 class="fw-bold mb-1 text-primary d-flex align-items-center" style="font-size: 1rem;">
              <i class="bi bi-play-circle-fill me-1 text-danger"></i> ${entry.title}
            </h6>
            <p class="text-muted mb-2" style="font-size: 0.8rem;">
              ${previewText}...
            </p>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted" style="font-size: 0.65rem;">${formatDate(entry.date)} · ${relativeTime}</small>
            <span class="btn btn-sm btn-outline-primary px-2 py-0" style="font-size: 0.65rem;">Read More</span>
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
