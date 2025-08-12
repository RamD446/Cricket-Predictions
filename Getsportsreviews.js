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
  .section-wrapper {
    border: 1px solid #dee2e6;
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
    justify-content: space-between;
    cursor: pointer;
  }
  /* Sports header color */
  .section-header.sports {
    color: #ffc107;
  }
  .section-header.sports i {
    color: #ffc107;
  }
  /* Movies header color */
  .section-header.movies {
    color: #0dcaf0;
  }
  .section-header.movies i {
    color: #0dcaf0;
  }
  .section-header:hover {
    opacity: 0.85;
  }
  .custom-card {
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid #dee2e6;
    background: #fff;
  }
  .custom-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 14px rgba(0,0,0,0.1);
  }
  .custom-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: filter 0.3s ease;
  }
  .custom-card:hover img {
    filter: brightness(0.9);
  }
  .card-body {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 0.75rem 1rem;
  }
 .review-title {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: #0d6efd;
}

  .review-sub {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 0.4rem;
  }
  .review-preview {
    font-size: 0.78rem;
    color: #555;
    margin-bottom: 0.75rem;
    flex-grow: 1;
  }
  .card-footer {
    font-size: 0.75rem;
    color: #6c757d;
    border-top: 1px solid #dee2e6;
    padding: 0.5rem 0.75rem;
    background: #f8f9fa;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }
  .btn-details {
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 0.75rem;
    transition: background-color 0.2s ease, transform 0.2s ease;
  }
  .btn-details:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
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

function extractTextPreview(html, length = 90) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const text = tempDiv.textContent || tempDiv.innerText || "";
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
    cardBody.innerHTML = `
      <div class="review-title">${data.title || "Untitled"}</div>
      ${data.seriesname ? `<div class="review-sub">${data.seriesname}</div>` : ""}
      <div class="review-preview">${extractTextPreview(data.content)}</div>
    `;
    card.appendChild(cardBody);

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const dateText = document.createElement("span");
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
