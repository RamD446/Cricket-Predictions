import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalPages = 1;
let allEntries = [];

export async function loadNews(page = 1) {
  const newsContainer = document.querySelector('#content-news .row');
  const paginationContainer = document.querySelector('#content-news .pagination-controls');

  if (!newsContainer) return;

  newsContainer.innerHTML = ''; // Clear existing content
  paginationContainer.innerHTML = ''; // Clear pagination

  try {
    const snapshot = await get(child(ref(database), 'news'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      allEntries = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));

      totalPages = Math.ceil(allEntries.length / ITEMS_PER_PAGE);
      currentPage = Math.max(1, Math.min(page, totalPages));

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;

      const pageItems = allEntries.slice(start, end);
      pageItems.forEach(entry => {
        const card = createNewsCard(entry);
        newsContainer.appendChild(card);
      });

      renderPagination(paginationContainer);
    } else {
      showNoNews(newsContainer);
    }
  } catch (err) {
    console.error('❌ Error loading news:', err);
    showNoNews(newsContainer);
  }
}

function createNewsCard(entry) {
  const div = document.createElement('div');
  div.className = 'col-12 mb-2';

  const guid = entry.id || `news-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const relativeTime = formatRelativeTime(entry.date);

  div.innerHTML = `
    <div class="card shadow-sm border-0 rounded-3 bg-light">
      <div class="row g-0 align-items-center">

        <!-- 🟥 Very small square block -->
        <div class="col-1 d-flex align-items-center justify-content-center">
          <div style="
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #ff4d4d, #ff9999);
            border-radius: 0.4rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 0.75rem;
            font-weight: 600;
            text-align: center;
            text-transform: uppercase;
          ">
            ${entry.tabType || 'News'}
          </div>
        </div>

        <!-- 📄 Text part -->
        <div class="col-11">
          <div class="card-body py-1 px-2">
            <p class="mb-1 fw-semibold text-truncate" style="font-size: 0.8rem;">
              <a href="details.html?tabType=${entry.tabType}&id=${guid}" class="text-decoration-none text-dark title-hover">
                ${entry.title}
              </a>
            </p>
            <p class="text-muted mb-1 small" style="font-size: 0.7rem;">${entry.content.slice(0, 60)}...</p>
            <small class="text-muted d-block" style="font-size: 0.65rem;">
              <i class="bi bi-person-circle me-1"></i> ${entry.author || 'Anonymous'}<br>
              <i class="bi bi-calendar-event me-1"></i> ${formatDate(entry.date)}
              <span class="badge bg-secondary ms-1">${relativeTime}</span>
            </small>
          </div>
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
  prevBtn.onclick = () => loadNews(currentPage - 1);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.className = 'btn btn-sm btn-outline-primary';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => loadNews(currentPage + 1);

  const pageInfo = document.createElement('span');
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  pageInfo.className = 'text-muted me-3';

  container.appendChild(prevBtn);
  container.appendChild(pageInfo);
  container.appendChild(nextBtn);
}

function showNoNews(container) {
  container.innerHTML = `<p class="text-muted">No news updates at the moment.</p>`;
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
