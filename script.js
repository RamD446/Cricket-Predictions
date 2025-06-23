// Import Firebase functions
import { database } from './firebase.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Loaders
import { loadNews } from './GetNews.js';
import { loadPredictions } from './GetPrediction.js';
import { loadJobs } from './GetJobs.js';
import { loadMovies } from './GetMovies.js';

// Initial Load
loadNews();
loadPredictions();
loadJobs();
loadMovies();

let quill; // Global instance

// Initialize Quill when modal is shown
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

    // 🖼️ Resize images pasted into the editor
    quill.root.addEventListener('paste', () => {
      setTimeout(() => {
        const images = quill.root.querySelectorAll('img');
        images.forEach(img => {
          img.style.maxWidth = '100%';
          img.style.maxHeight = '300px';
          img.style.objectFit = 'contain';
        });
      }, 50);
    });
  }
});

// 🔁 Reset Quill content and form when modal is closed
document.getElementById('createModal').addEventListener('hidden.bs.modal', () => {
  if (quill) quill.setContents([]);
  document.getElementById('createForm').reset();
});

// ✨ Helper: Generate unique ID
function generateGuidFromTitle(title) {
  const base = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  const unique = Date.now().toString(36);
  return `${base}-${unique}`;
}

// 📝 Form submission
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

    // Refresh tab
    switch (tabType) {
      case 'news': loadNews(); break;
      case 'prediction': loadPredictions(); break;
      case 'dreamteam': loadDreamTeam(); break;
      case 'current': loadCurrent(); break;
      case 'jobs': loadJobs(); break;
      case 'movie': loadMovies(); break;
      default: console.warn('❗ Unknown tabType:', tabType);
    }

  } catch (err) {
    console.error('❌ Submission failed:', err);
    alert('❌ Failed to submit data.');
  }
});
