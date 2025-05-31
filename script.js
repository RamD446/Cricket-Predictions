import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCK_3CTysqCxTWLhMHZ_mtsa-5f1E3w1Js",
  authDomain: "rdmdb-76959.firebaseapp.com",
  databaseURL: "https://rdmdb-76959-default-rtdb.firebaseio.com",
  projectId: "rdmdb-76959",
  storageBucket: "rdmdb-76959.appspot.com",
  messagingSenderId: "415793355835",
  appId: "1:415793355835:web:daf2911118c0c38611d01e",
  measurementId: "G-2ZXYPG8WZT"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const toolbarOptions = [
  ['bold', 'italic', 'underline'],
  [{ color: [] }, { background: [] }],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['image'],
  ['clean']
];

const quill = new Quill('#editor-container', {
  modules: { toolbar: toolbarOptions },
  theme: 'snow'
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const title = document.getElementById('titleInput').value.trim();
  const matchNumber = document.getElementById('matchInput').value.trim();
  const content = quill.root.innerHTML;

  if (!title || !matchNumber || !content.trim()) {
    alert("Please fill out Title, Match Number, and Content.");
    return;
  }

  const predictionsRef = ref(database, 'predictions');

  push(predictionsRef, {
    title,
    matchNumber,
    text: content,
    createdBy: "Yalla Ramana",
    timestamp: new Date().toISOString()
  }).then(() => {
    document.getElementById('status').textContent = "Saved successfully!";
    quill.root.innerHTML = '';
    document.getElementById('titleInput').value = '';
    document.getElementById('matchInput').value = '';
  }).catch(error => {
    document.getElementById('status').textContent = "Error: " + error.message;
  });
});

function getPredictions() {
  const predictionsRef = ref(database, 'predictions');
  const cardsContainer = document.getElementById('cards-container');

  onValue(predictionsRef, (snapshot) => {
    const allData = [];

    snapshot.forEach(childSnapshot => {
      const data = childSnapshot.val();
      allData.push(data);
    });

    allData.reverse();
    cardsContainer.innerHTML = '';

    allData.forEach((data, index) => {
      const col = document.createElement('div');
      col.className = 'col-12';

      const date = new Date(data.timestamp).toLocaleString();
      const cardId = `card-${index}`;

      col.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${data.title}</h5>
            <button 
              class="btn btn-link p-0 toggle-btn"
              data-bs-toggle="collapse"
              data-bs-target="#${cardId}"
              aria-expanded="false"
              aria-controls="${cardId}">
              See More
            </button>
            <div id="${cardId}" class="collapse mt-3">
              <p><strong>Match #:</strong> ${data.matchNumber}</p>
              <div>${data.text}</div>
              <p class="text-muted mt-3 mb-0">
                Created by: ${data.createdBy}<br>
                <small>${date}</small>
              </p>
            </div>
          </div>
        </div>
      `;

      cardsContainer.appendChild(col);
    });

    // Attach collapse event handlers
    document.querySelectorAll('.toggle-btn').forEach(button => {
      const targetId = button.getAttribute('data-bs-target');
      const target = document.querySelector(targetId);

      target.addEventListener('shown.bs.collapse', () => {
        button.textContent = "Hide";
      });

      target.addEventListener('hidden.bs.collapse', () => {
        button.textContent = "See More";
      });
    });
  });
}

getPredictions();
