// --- firebase-news.js ---
import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Pagination settings
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalPages = 1;
let allEntries = [];
let isTranslated = false; // 🌐 Language toggle

// 🔤 Simple English to Telugu word map (expand as needed)
const teluguDictionary = {
  "Breaking": "తాజా వార్త",
  "Government": "ప్రభుత్వం",
  "Election": "ఎన్నిక",
  "Market": "మార్కెట్",
  "Update": "నవీకరణ",
  "Anonymous": "అజ్ఞాత",
};

// 🔁 Replace matched words using dictionary
function translateText(text) {
  let translated = text;
  for (const [en, te] of Object.entries(teluguDictionary)) {
    const regex = new RegExp(en, 'gi');
    translated = translated.replace(regex, te);
  }
  return translated;
}

// 🌐 Toggle Language
export function setupTranslationToggle() {
  const btn = document.getElementById('translateToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      isTranslated = !isTranslated;
      loadNews(currentPage);
      btn.textContent = isTranslated ? "🌐 Translate to English" : "🌐 Translate to Telugu";
    });
  }
}

// 📰 Load News from Firebase
export async function loadNews(page = 1) {
  const newsContainer = document.querySelector('#news-updates');
  const paginationContainer = document.querySelector('.pagination-controls');

  if (!newsContainer) return;
  newsContainer.innerHTML = '';
  paginationContainer.innerHTML = '';

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

// 🧩 Build each news card
function createNewsCard(entry) {
  const div = document.createElement('div');
  div.className = 'col-md-6 col-sm-6 mb-4';

  const guid = entry.id || `news-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const cleanContent = entry.content.replace(/<[^>]+>/g, '').slice(0, 100);

  const title = isTranslated ? translateText(entry.title) : entry.title;
  const content = isTranslated ? translateText(cleanContent) : cleanContent;
  const author = isTranslated ? translateText(entry.author || 'Anonymous') : (entry.author || 'Anonymous');

  div.innerHTML = `
    <a href="details.html?tabType=${entry.tabType}&id=${guid}" class="text-decoration-none text-dark h-100 d-block">
      <div class="card h-100 border border-light-subtle rounded-4 bg-white shadow-sm hover-glow-effect overflow-hidden">
        <div class="card-body d-flex flex-column">
          <h6 class="fw-bold mb-2 text-primary" style="font-size: 1rem;">
            <span class="text-danger">✅</span> ${title}
          </h6>
          <p class="text-muted flex-grow-1 mb-2" style="font-size: 0.85rem;">
            ${content}...
          </p>
        </div>
        <div class="card-footer bg-transparent border-0 pt-0 pb-3 px-3 d-flex justify-content-between align-items-center text-muted" style="font-size: 0.7rem;">
          <span><i class="bi bi-person-circle me-1"></i>${author}</span>
          <div class="d-flex gap-3 ms-auto">
            <span><i class="bi bi-calendar-event me-1"></i>${formatDate(entry.date)}</span>
            <span class="badge bg-secondary">${formatRelativeTime(entry.date)}</span>
          </div>
        </div>
      </div>
    </a>
  `;

  return div;
}

// 🔢 Pagination Buttons
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
