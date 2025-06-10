// GetNews.js
import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Main function to load news
export async function loadNews() {
  const newsContainer = document.querySelector('#content-news .row');
  if (!newsContainer) return;

  newsContainer.innerHTML = ''; // Clear existing content

  try {
    const snapshot = await get(child(ref(database), 'news'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      const entries = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));

      entries.forEach(entry => {
        const card = createNewsCard(entry);
        newsContainer.appendChild(card);
      });
    } else {
      showNoNews(newsContainer);
    }
  } catch (err) {
    console.error('❌ Error loading news:', err);
    showNoNews(newsContainer);
  }
}

// Utility: create a collapsible news card
function createNewsCard(entry) {
  const div = document.createElement('div');
  div.className = 'col-12 mb-3';

  const guid = entry.id || `news-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const relativeTime = formatRelativeTime(entry.date);

  div.innerHTML = `
    <div class="card shadow-sm border border-0 rounded-4 bg-light">
      <div class="card-body p-3">

        <!-- Reduced font size using fs-6 -->
        <h5 class="card-title text-primary mb-2 fs-6 d-flex justify-content-between align-items-center">
          <span><i class="bi bi-megaphone-fill me-2 text-primary"></i>${entry.title}</span>
          <span class="badge bg-secondary text-light ms-2">${relativeTime}</span>
        </h5>

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

// Utility: format date to readable
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
