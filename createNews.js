import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const db = getDatabase();

// Quill setup
const newsQuill = new Quill('#Newseditor', { theme: 'snow' });

// Pagination setup
let currentPage = 1;
const itemsPerPage = 15;
let fullNewsList = [];

// Submit handler
document.getElementById('createNewsForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('newsTitle').value.trim();
  const author = document.getElementById('createdBy').value.trim();
  const content = newsQuill.root.innerHTML.trim();
  const timestamp = new Date().toISOString();

  if (!title || !author || !content || content === '<p><br></p>') {
    alert('❌ Please fill out all fields.');
    return;
  }

  const newsData = { title, author, content, timestamp };

  push(ref(db, 'news'), newsData)
    .then(() => {
      bootstrap.Modal.getInstance(document.getElementById('createNewsModal')).hide();
      document.getElementById('createNewsForm').reset();
      newsQuill.root.innerHTML = '';
    })
    .catch((err) => {
      console.error("❌ Error saving news:", err);
      alert("❌ Failed to save news.");
    });
});

// Time ago utility
function timeAgo(timestamp) {
  const now = new Date();
  const posted = new Date(timestamp);
  const seconds = Math.floor((now - posted) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

// Load data
function loadNewsCards() {
  const newsRef = ref(db, 'news');

  onValue(newsRef, (snapshot) => {
    fullNewsList = [];
    snapshot.forEach(child => {
      fullNewsList.push({ id: child.key, ...child.val() });
    });

    fullNewsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    currentPage = 1;
    renderPage();
  });
}

// Render news
function renderPage() {
  const container = document.getElementById('newsContainer');
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');

  container.innerHTML = '';

  const totalItems = fullNewsList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = fullNewsList.slice(start, end);

  pageItems.forEach(news => {
    const snippet = news.content.replace(/<[^>]+>/g, '').slice(0, 100);
    const postedAgo = timeAgo(news.timestamp);
    const rotateAngle = (news.id % 2 === 0) ? '-0.4deg' : '0.4deg';

    const card = document.createElement('div');
    card.className = 'col-12 mb-4';

  card.innerHTML = `
  <div class="card h-100 shadow-sm rounded-3 border-0" style="transform: rotate(${rotateAngle});">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="text-primary fw-bold" style="font-size: 0.8rem; line-height: 1;">
          ✅ ${news.title} <span class="text-muted">🕒 ${postedAgo}</span>
        </div>
        <a href="#" class="btn btn-sm btn-outline-primary toggle-btn" data-id="${news.id}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">
          <i class="bi bi-box-arrow-in-right me-1"></i> See More
        </a>
      </div>

      <p class="card-text" id="snippet-${news.id}">${snippet}...</p>
      <div class="card-text d-none" id="full-${news.id}">${news.content}</div>
      <div class="mt-2 text-muted small d-none" id="meta-${news.id}">
        Created by: ${news.author} | ${new Date(news.timestamp).toLocaleDateString()} @ ${new Date(news.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  </div>
`;

container.appendChild(card);
  });

  // Toggle Read More / Show Less
  container.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      const snippetEl = document.getElementById(`snippet-${id}`);
      const fullEl = document.getElementById(`full-${id}`);
      const metaEl = document.getElementById(`meta-${id}`);
      const isCollapsed = fullEl.classList.contains('d-none');

      if (isCollapsed) {
        snippetEl.classList.add('d-none');
        fullEl.classList.remove('d-none');
        metaEl.classList.remove('d-none');
        btn.innerHTML = `<i class="bi bi-box-arrow-left me-1"></i> Show Less`;
      } else {
        snippetEl.classList.remove('d-none');
        fullEl.classList.add('d-none');
        metaEl.classList.add('d-none');
        btn.innerHTML = `<i class="bi bi-box-arrow-in-right me-1"></i> Read More`;
      }
    });
  });

  // Pagination controls
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Pagination events
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  const totalPages = Math.ceil(fullNewsList.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
});

// Initial call
loadNewsCards();
