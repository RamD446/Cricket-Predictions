// Import Firebase functions
import { database } from './firebase.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Loaders
import { loadNews } from './GetNews.js';
import { loadPredictions } from './GetPrediction.js';
import { loadJobs } from './GetJobs.js';
import { loadMovies } from './GetMovies.js';

let quill; // Global Quill editor instance

// ✅ Spinner Control
const loader = document.getElementById("globalLoader");
function showLoader() {
  loader.style.display = "flex";
}
function hideLoader() {
  loader.style.display = "none";
}

// Show loader before data loading begins
showLoader();

// Load all data and hide loader when done
Promise.all([
  loadMovies(),
  loadPredictions(),
  loadNews(),
  loadJobs(),
])
  .catch(err => {
    console.error("❌ One or more loaders failed:", err);
  })
  .finally(() => {
    hideLoader(); // Always hide loader after everything (success or error)
  });

// 🖊️ Initialize Quill Editor on modal open
document.getElementById('createModal').addEventListener('shown.bs.modal', () => {
  if (!quill) {
    quill = new Quill('#quillEditor', {
      theme: 'snow',
      placeholder: 'Write your content here...',
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{ color: [] }, { background: [] }],
          ['link', 'image'],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean']
        ]
      }
    });

    // 🧠 Resize images inside editor
    quill.root.addEventListener('paste', () => setTimeout(enforceImageSizing, 50));
    quill.on('text-change', () => setTimeout(enforceImageSizing, 50));
  }
});

// 🔧 Ensure images in Quill are styled nicely
function enforceImageSizing() {
  const images = quill?.root?.querySelectorAll('img') || [];
  images.forEach(img => {
    img.style.maxWidth = '100%';
    img.style.maxHeight = '200px';
    img.style.height = 'auto';
    img.style.width = 'auto';
    img.style.objectFit = 'contain';
    img.style.display = 'block';
    img.style.margin = '10px auto';
  });
}

// 🧼 Clear editor and form when modal closed
document.getElementById('createModal').addEventListener('hidden.bs.modal', () => {
  if (quill) quill.setContents([]);
  document.getElementById('createForm').reset();
});

// 🔧 Generate unique ID from title
function generateGuidFromTitle(title) {
  const base = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  const unique = Date.now().toString(36);
  return `${base}-${unique}`;
}

// ✅ Handle form submission
document.getElementById('createForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('titleInput').value.trim();
  const tabType = document.getElementById('tabType').value;
  const content = quill?.root.innerHTML.trim();
  const plainText = quill?.getText().trim();
  const date = new Date().toISOString();
  const author = 'Yalla Ramana';

  if (!title || !plainText || plainText === '') {
    alert('❗ Please enter a valid title and content.');
    return;
  }

  const guid = generateGuidFromTitle(title);

  const newData = {
    id: guid,
    title,
    tabType,
    content,
    date,
    author
  };

  try {
    await set(ref(database, `${tabType}/${guid}`), newData);
    alert('✅ Entry submitted successfully.');
    bootstrap.Modal.getInstance(document.getElementById('createModal')).hide();

    // Reload tab data
    switch (tabType) {
      case 'news': loadNews(); break;
      case 'prediction': loadPredictions(); break;
      case 'dreamteam': loadDreamTeam?.(); break;
      case 'current': loadCurrent?.(); break;
      case 'jobs': loadJobs(); break;
      case 'movie': loadMovies(); break;
      default: console.warn('❗ Unknown tabType:', tabType);
    }

  } catch (err) {
    console.error('❌ Submission failed:', err);
    alert('❌ Failed to submit data.');
  }
});
