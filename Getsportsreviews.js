import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
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

// --- Styles ---
const style = document.createElement('style');
style.textContent = `
  .section-wrapper {
    border: 2px solid #dee2e6;
    border-radius: 12px;
    padding: 1rem;
    margin-top: 2rem;
    background: #fff;
  }
  .section-header {
    font-weight: 700;
    font-size: 1.25rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .section-header.sports { color: #0069d9; }
  .section-header.movies { color: #28a745; }
  .custom-card {
    border: 1px solid #dee2e6;
    border-radius: 10px;
    background: #ffffff;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .custom-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  }
  .custom-card img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  .review-title {
    font-size: 1.1rem;
    font-weight: 700;
  }
  .review-sub {
    font-size: 0.85rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
  }
  .btn-details {
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 0.75rem;
  }
`;
document.head.appendChild(style);

// --- Extract first image from HTML ---
function extractFirstImage(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const img = tempDiv.querySelector("img");
  return img ? img.src : null;
}

// --- Create cards grid ---
function createCardsGrid(snapshot, type) {
  const row = document.createElement("div");
  row.className = "row g-3";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    let imgSrc = extractFirstImage(data.content);
    if (!imgSrc || imgSrc.trim() === "") imgSrc = "images/image1.jpeg";

    const col = document.createElement("div");
    col.className = "col-12 col-md-6";

    const card = document.createElement("div");
    card.className = "card custom-card";

    const innerRow = document.createElement("div");
    innerRow.className = "row g-0";

    const imgCol = document.createElement("div");
    imgCol.className = "col-4";
    imgCol.innerHTML = `<img src="${imgSrc}" alt="${type} Image">`;

    const textCol = document.createElement("div");
    textCol.className = "col-8 d-flex flex-column justify-content-between p-3";

    // Always use title now
    const title = data.title || "Untitled";
    const seriesName = data.seriesname || "";

    textCol.innerHTML = `
      <div>
        <div class="review-title">${title}</div>
        ${seriesName ? `<div class="review-sub">${seriesName}</div>` : ""}
      </div>
    `;

    const btn = document.createElement("button");
    btn.className = `btn ${type === 'Sports Review' ? 'btn-primary' : 'btn-success'} btn-details align-self-start`;
    btn.textContent = "Full Details";
    btn.addEventListener("click", () => {
      const id = docSnap.id;
      window.location.href = `detailspage.html?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;
    });

    textCol.appendChild(btn);

    innerRow.appendChild(imgCol);
    innerRow.appendChild(textCol);
    card.appendChild(innerRow);
    col.appendChild(card);
    row.appendChild(col);
  });

  return row;
}

// --- Section wrapper ---
function createSection(text, type, link, snapshot) {
  const wrapper = document.createElement("div");
  wrapper.className = "section-wrapper";

  const header = document.createElement("div");
  header.className = `section-header ${type}`;
  header.innerHTML = type === "sports"
    ? `<i class="bi bi-trophy-fill"></i> ${text}`
    : `<i class="bi bi-film"></i> ${text}`;
  header.addEventListener("click", () => {
    window.location.href = link;
  });

  wrapper.appendChild(header);
  wrapper.appendChild(createCardsGrid(snapshot, type === "sports" ? "Sports Review" : "Movie Review"));
  return wrapper;
}

// --- Load reviews ---
export async function loadAllReviews(sportsContainerId, moviesContainerId, spinnerId) {
  const sportsContainer = document.getElementById(sportsContainerId);
  const moviesContainer = document.getElementById(moviesContainerId);
  const spinner = document.getElementById(spinnerId);
  if (!sportsContainer || !moviesContainer || !spinner) return;

  sportsContainer.innerHTML = "";
  moviesContainer.innerHTML = "";

  try {
    const sportsQuery = query(
      collection(db, "Predictions"),
      where("type", "==", "Sports Review"),
      orderBy("createddate", "desc"),
      limit(30)
    );
    const moviesQuery = query(
      collection(db, "Predictions"),
      where("type", "==", "Movie Review"),
      orderBy("createddate", "desc"),
      limit(30)
    );

    const [sportsSnap, moviesSnap] = await Promise.all([
      getDocs(sportsQuery),
      getDocs(moviesQuery)
    ]);

    spinner.style.display = "none";

    if (!sportsSnap.empty) {
      sportsContainer.appendChild(createSection("Latest Sports Reviews", "sports", "sportsreview.html", sportsSnap));
    } else {
      sportsContainer.innerHTML = `<p class="text-muted">No sports reviews found.</p>`;
    }

    if (!moviesSnap.empty) {
      moviesContainer.appendChild(createSection("Latest Movie Reviews", "movies", "moviereview.html", moviesSnap));
    } else {
      moviesContainer.innerHTML = `<p class="text-muted">No movie reviews found.</p>`;
    }

  } catch (error) {
    console.error("Error loading reviews:", error);
    spinner.style.display = "none";
    sportsContainer.innerHTML = `<p class="text-danger">Failed to load sports reviews.</p>`;
    moviesContainer.innerHTML = `<p class="text-danger">Failed to load movie reviews.</p>`;
  }
}
