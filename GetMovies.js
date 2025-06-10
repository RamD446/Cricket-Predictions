// GetMovies.js
import { database } from './firebase.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

export async function loadMovies() {
  const container = document.querySelector('#content-movie .row');
  if (!container) return;

  container.innerHTML = '';

  try {
    const snapshot = await get(child(ref(database), 'movie'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      const entries = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));
      entries.forEach(entry => container.appendChild(createMovieCard(entry)));
    } else {
      container.innerHTML = '<p class="text-muted">No movie reviews available.</p>';
    }
  } catch (err) {
    console.error('Error loading movie reviews:', err);
    container.innerHTML = '<p class="text-danger">Failed to load movie reviews.</p>';
  }
}

function createMovieCard(entry) {
  const div = document.createElement('div');
  div.className = 'col-12 mb-3';
  const guid = entry.id || `movie-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  div.innerHTML = `
    <div class="card shadow-sm border-0 rounded-4 bg-light">
      <div class="card-body p-3">
        <h5 class="card-title text-primary mb-2 fs-6">
          <i class="bi bi-film me-2 text-primary"></i>${entry.title}
        </h5>

        <div id="content-${guid}" class="collapse">
          <div class="card-text mb-2">${entry.content}</div>
          <small class="text-muted d-block">
            <i class="bi bi-person-circle me-1"></i> Reviewed by: ${entry.author || 'Unknown'}
            <i class="bi bi-clock ms-2 me-1"></i> ${getRelativeTime(entry.date)}
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
