import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Firebase config
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

// ✅ Styles
const style = document.createElement("style");
style.textContent = `
  /* ===== Titles ===== */
  .review-title.sports { 
    color: #dc3545; 
    font-weight: 700; 
    font-size: 1rem; 
    margin-bottom: 0.25rem; 
  }
  .review-title.movies { 
    color: #198754; 
    font-weight: 700; 
    font-size: 1rem; 
    margin-bottom: 0.25rem; 
  }

  /* ===== Preview Text ===== */
  .review-preview.sports { 
    font-size: 0.9rem; 
    margin-bottom: 0.75rem; 
    flex-grow: 1; 
    color: #000000;       /* black text */
    font-weight: 700;     /* bold */
  }
  .review-preview.movies { 
    font-size: 0.9rem; 
    margin-bottom: 0.75rem; 
    flex-grow: 1; 
    color: #0d47a1;       /* blue text */
    font-weight: 400; 
  }

  /* ===== Time Ago ===== */
  .time-ago.sports { 
    color: #e65100; 
    font-weight: 500; 
  }
  .time-ago.movies { 
    color: #6f42c1; 
    font-weight: 500; 
  }

  /* ===== Cards ===== */
  .custom-card { 
    border-radius: 12px; 
    overflow: hidden; 
    box-shadow: 0 3px 8px rgba(0,0,0,0.15); 
    transition: transform 0.2s ease-in-out; 
  }
  .custom-card:hover { 
    transform: translateY(-3px); 
    box-shadow: 0 6px 14px rgba(0,0,0,0.25); 
  }

  .custom-card img { 
    height: 200px; 
    object-fit: cover; 
    border-bottom: 2px solid #eee; 
  }

  .card-body { 
    padding: 0.9rem; 
  }

  .card-footer { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding: 0.6rem 0.9rem; 
    background: #f8f9fa; 
  }

  /* ===== Section Header ===== */
  .section-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding: 0.5rem 0.8rem; 
    font-size: 1rem; 
    font-weight: 700; 
    margin-bottom: 0.7rem; 
    border-radius: 8px; 
    cursor: pointer; 
    transition: background 0.2s; 
  }
  .section-header.sports { 
    background: #ffebee; 
    color: #c62828; 
  }
  .section-header.movies { 
    background: #e3f2fd; 
    color: #1565c0; 
  }
  .section-header:hover { 
    opacity: 0.9; 
  }

  .more-icon { 
    font-size: 1.1rem; 
  }
`;
document.head.appendChild(style);

// ✅ Helpers
function extractFirstImage(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const img = tempDiv.querySelector("img");
  return img ? img.src : null;
}

function extractTextPreview(text, length = 200) {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + " min" + (interval > 1 ? "s" : "") + " ago";
  return "Just now";
}

// ✅ Card creator
function createCardsGrid(snapshot, type) {
  const row = document.createElement("div");
  row.className = "row g-3";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    let imgSrc = extractFirstImage(data.content);
    if (!imgSrc || imgSrc.trim() === "") imgSrc = "images/image1.jpeg";

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 d-flex";

    const card = document.createElement("div");
    card.className = "card custom-card flex-fill";

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = `${type} Image`;
    card.appendChild(img);

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // ✅ Sports = bold black (seriesname)
    // ✅ Movies = blue normal (content)
    const previewText = type.includes("Sports")
      ? `<strong>${extractTextPreview(data.seriesname, 200)}</strong>`
      : extractTextPreview(data.content, 200);

    cardBody.innerHTML = `
      <div class="review-title ${type.includes("Sports") ? "sports" : "movies"}">
        ${data.title || "Untitled"}
      </div>
      <div class="review-preview ${type.includes("Sports") ? "sports" : "movies"}">
        ${previewText}
      </div>
    `;
    card.appendChild(cardBody);

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const dateText = document.createElement("span");
    dateText.className = `time-ago ${type.includes("Sports") ? "sports" : "movies"}`;
    dateText.textContent = data.createddate?.toDate
      ? timeAgo(data.createddate.toDate())
      : "Unknown date";

    const btn = document.createElement("button");
    btn.className = `btn ${type === 'Sports Review' ? 'btn-primary' : 'btn-success'} btn-details`;
    btn.textContent = "Preview";
    btn.addEventListener("click", () => {
      const id = docSnap.id;
      window.location.href = `detailspage.html?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;
    });

    footer.appendChild(dateText);
    footer.appendChild(btn);
    card.appendChild(footer);

    col.appendChild(card);
    row.appendChild(col);
  });

  return row;
}

// ✅ Section creator
function createSection(text, type, link, snapshot) {
  const wrapper = document.createElement("div");
  wrapper.className = "section-wrapper";

  const header = document.createElement("div");
  header.className = `section-header ${type}`;
  header.innerHTML = `
    <span>${type === "sports" ? `<i class="bi bi-trophy-fill"></i>` : `<i class="bi bi-film"></i>`} ${text}</span>
    <i class="bi bi-arrow-right-circle more-icon"></i>
  `;
  header.addEventListener("click", () => {
    window.location.href = link;
  });

  wrapper.appendChild(header);
  wrapper.appendChild(createCardsGrid(snapshot, type === "sports" ? "Sports Review" : "Movie Review"));
  return wrapper;
}

// ✅ Main loader
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
      limit(50)
    );
    const moviesQuery = query(
      collection(db, "Predictions"),
      where("type", "==", "Movie Review"),
      orderBy("createddate", "desc"),
      limit(50)
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
