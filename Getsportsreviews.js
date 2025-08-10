import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_4rFTGZn-I7xYwS9SQIhI4KM7P0I2msE",
  authDomain: "rdm11-34fb1.firebaseapp.com",
  projectId: "rdm11-34fb1",
  storageBucket: "rdm11-34fb1.firebasestorage.app",
  messagingSenderId: "46810528643",
  appId: "1:46810528643:web:406a9ebee9c8a5762954b6",
  measurementId: "G-MP86EYWQE0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Small spinner HTML
const smallSpinner = `
  <div class="d-flex flex-column justify-content-center align-items-center" style="min-height:150px;">
    <div class="spinner-border spinner-border-sm text-primary" role="status" style="width:1.5rem;height:1.5rem;">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="mt-2 text-muted small">Loading, please wait...</p>
  </div>
`;

// --- Custom CSS for better UI ---
const style = document.createElement('style');
style.textContent = `
  /* --- SPORTS REVIEWS HORIZONTAL ROW --- */
  .cards-row {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding: 0.75rem 1rem;
    margin: 1rem auto 2rem auto;
    max-width: 1090px;
    white-space: nowrap;
    scroll-behavior: smooth;
  }
  .cards-row::-webkit-scrollbar {
    height: 8px;
  }
  .cards-row::-webkit-scrollbar-thumb {
    background: #007bffaa;
    border-radius: 4px;
  }
  .cards-row .card {
    min-width: 180px;
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    border-radius: 0.5rem;
  }
  .cards-row .card:hover {
    transform: scale(1.07);
    box-shadow: 0 0.75rem 1.5rem rgba(0, 123, 255, 0.3);
  }
  .cards-row .card-body {
    padding: 1.25rem 1rem;
  }
  .cards-row .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #004085;
    margin-bottom: 0.25rem;
  }
  .cards-row .card-subtitle {
    font-size: 0.85rem;
    color: #6c757d;
    margin-bottom: 1rem;
  }
  .cards-row .btn {
    font-size: 0.85rem;
    padding: 0.35rem 0.8rem;
  }

  /* --- MOVIE REVIEWS GRID --- */
  .movie-card-img {
    width: 150px;
    height: 100%;
    object-fit: cover;
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }
  .movie-card-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem 1.25rem;
  }
  .movie-card-details .card-title {
    font-weight: 700;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #155724;
  }
  .movie-card-details .text-muted {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  .movie-card-details .btn {
    align-self: flex-start;
    font-weight: 600;
  }

  /* --- SECTION HEADERS --- */
  h3.section-header {
    font-weight: 700;
    margin-top: 2.5rem;
    margin-bottom: 1.5rem;
    letter-spacing: 1px;
  }
  h3.section-header.sports {
    color: #0056b3;
  }
  h3.section-header.movies {
    color: #218838;
  }

  /* --- RESPONSIVE ADJUSTMENTS --- */
  @media (max-width: 767.98px) {
    .cards-row {
      padding: 0.5rem;
      max-width: 100%;
      gap: 0.8rem;
    }
    .cards-row .card {
      min-width: 140px;
    }
    .movie-card-img {
      width: 120px;
    }
    .movie-card-details .card-title {
      font-size: 1.1rem;
    }
  }
`;
document.head.appendChild(style);

// --- Create horizontal cards row for sports reviews ---
async function createCardsRow(snapshot, isSports) {
  const cardsRow = document.createElement("div");
  cardsRow.className = "cards-row";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const title = isSports
      ? `${data.teamA || "Team A"} vs ${data.teamB || "Team B"}`
      : data.movieTitle || "Untitled Movie";

    let createdDateStr = "";
    if (data.createddate && data.createddate.toDate) {
      const dateObj = data.createddate.toDate();
      createdDateStr = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();
    }

    const card = document.createElement("div");
    card.className = "card shadow-sm";

    card.innerHTML = `
      <div class="card-body text-center">
        <h6 class="card-title">${title}</h6>
        <p class="card-subtitle">${createdDateStr}</p>
        <button class="btn btn-sm btn-primary preview-btn" data-id="${docSnap.id}">Preview</button>
      </div>
    `;

    cardsRow.appendChild(card);
  });

  cardsRow.querySelectorAll(".preview-btn").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const type = "Sports Review";
      window.location.href = `detailspage.html?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;
    });
  });

  return cardsRow;
}

// --- Create movie cards grid ---
async function createMovieCardsGrid(snapshot) {
  const row = document.createElement("div");
  row.className = "row g-4 mt-4 justify-content-center";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const col = document.createElement("div");
    col.className = "col-12 col-md-6";

    const card = document.createElement("div");
    card.className = "card shadow-sm d-flex flex-row";

    const imgSrc = (data.imageURL && data.imageURL.trim() !== "") ? data.imageURL : "images/image1.jpeg";

    const imgDiv = document.createElement("div");
    imgDiv.className = "flex-shrink-0";
    imgDiv.style.maxWidth = "150px";
    imgDiv.innerHTML = `<img src="${imgSrc}" alt="Movie Image" class="movie-card-img">`;

    const detailsDiv = document.createElement("div");
    detailsDiv.className = "movie-card-details";

    const title = data.title || "Untitled Movie";
    const createdBy = data.createdBy || "Unknown";

    detailsDiv.innerHTML = `
      <h5 class="card-title">${title}</h5>
      <p class="text-muted">Created by: ${createdBy}</p>
    `;

    const btn = document.createElement("button");
    btn.className = "btn btn-success btn-sm";
    btn.textContent = "Full Details";
    btn.addEventListener("click", () => {
      const id = docSnap.id;
      const type = "Movie Review";
      window.location.href = `detailspage.html?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;
    });

    detailsDiv.appendChild(btn);

    card.appendChild(imgDiv);
    card.appendChild(detailsDiv);
    col.appendChild(card);
    row.appendChild(col);
  });

  return row;
}

// --- Section header creation ---
function createSectionHeader(text, type) {
  const header = document.createElement("h3");
  header.textContent = text;
  header.className = `section-header ${type}`;
  return header;
}

// --- Load Sports Reviews ---
export async function loadSportsReviews(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = smallSpinner;

  try {
    const q = query(
      collection(db, "Predictions"),
      where("type", "==", "Sports Review"),
      orderBy("createddate", "desc"),
      limit(30)
    );
    const snapshot = await getDocs(q);

    container.innerHTML = "";
    const sportsHeader = createSectionHeader("Latest Sports Reviews", "sports");
    container.appendChild(sportsHeader);

    if (snapshot.empty) {
      container.innerHTML += "<p>No sports reviews found.</p>";
      return;
    }

    const cardsRow = await createCardsRow(snapshot, true);
    container.appendChild(cardsRow);

  } catch (error) {
    console.error("Failed to load sports reviews:", error);
  }
}

// --- Load Movie Reviews ---
export async function loadMovieReviews(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = smallSpinner;

  try {
    const q = query(
      collection(db, "Predictions"),
      where("type", "==", "Movie Review"),
      orderBy("createddate", "desc"),
      limit(30)
    );
    const snapshot = await getDocs(q);

    container.innerHTML = "";
    const movieHeader = createSectionHeader("Latest Movie Reviews", "movies");
    container.appendChild(movieHeader);

    if (snapshot.empty) {
      container.innerHTML += "<p>No movie reviews found.</p>";
      return;
    }

    const movieGrid = await createMovieCardsGrid(snapshot);
    container.appendChild(movieGrid);

  } catch (error) {
    console.error("Failed to load movie reviews:", error);
  }
}
