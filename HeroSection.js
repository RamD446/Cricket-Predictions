
document.addEventListener("DOMContentLoaded", function () {
  const heroContainer = document.getElementById("hero-section");

  heroContainer.innerHTML = `
    <style>
      /* ===== Outer Container ===== */
      .main-container {
        width: 100%;
        margin: 0.25rem auto;
        padding: 0.6rem 1rem;
        border: 2px solid #d6336c;
        border-radius: 14px;
        background: #fff0f4;
        box-shadow: 0 4px 10px rgba(214, 51, 108, 0.18);
      }

      /* ===== Wrapper ===== */
      .hero-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
        gap: 0.5rem;
        font-family: 'Poppins', sans-serif;
        user-select: none;
      }

      /* ===== Section Styles ===== */
      .hero-section {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 0.6rem 0.8rem;
        gap: 0.8rem;
        color: #3a3a3a;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        transition: transform 0.2s ease-in-out;
      }
      .hero-section:hover {
        transform: translateY(-3px);
      }

      /* ===== Divider ===== */
      .divider {
        width: 2px;
        background: linear-gradient(180deg, #d6336c 0%, #e75480 100%);
        border-radius: 2px;
      }

      /* ===== Icon Circle ===== */
      .icon-circle {
        width: 28px;
        height: 28px;
        background: #e75480;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 1rem;
        animation: bounce 2.5s ease-in-out infinite;
        flex-shrink: 0;
      }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }

      /* ===== Text ===== */
      .content h4 {
        margin: 0 0 0.15rem;
        font-weight: 700;
        font-size: 0.95rem;
        color: #d6336c;
      }
      .content p {
        margin: 0 0 0.4rem;
        font-size: 0.75rem;
        color: #444;
        line-height: 1.2;
      }

      /* ===== Button ===== */
      .btn-custom {
        padding: 0.2rem 0.6rem;
        border-radius: 14px;
        border: 1.5px solid #d6336c;
        background: transparent;
        color: #d6336c;
        font-weight: 600;
        font-size: 0.7rem;
        text-decoration: none;
        transition: all 0.3s ease;
        display: inline-block;
      }
      .btn-custom:hover {
        background: #d6336c;
        color: #fff;
      }

      /* ===== Mobile ===== */
      @media (max-width: 720px) {
        .main-container {
          padding: 0.5rem;
        }
        .hero-wrapper {
          flex-direction: row;   /* ✅ keep side-by-side */
          gap: 0.5rem;
        }
        .divider {
          display: none; /* hide divider on small screens */
        }
        .hero-section {
          flex: 1;
          flex-direction: column;
          text-align: center;
          gap: 0.4rem;
          padding: 0.5rem;
        }
        .icon-circle {
          margin-bottom: 0.3rem;
          animation: none;
        }
        .content h4 {
          font-size: 0.85rem;
        }
        .content p {
          font-size: 0.7rem;
        }
        .btn-custom {
          font-size: 0.65rem;
          padding: 0.2rem 0.5rem;
        }
      }
    </style>

    <div class="main-container" role="main" aria-label="Hero Section Container">
      <div class="hero-wrapper" role="region" aria-label="Sports and Movie Reviews">
        
        <!-- Sports Section -->
        <section class="hero-section" aria-labelledby="sports-header">
          <div class="icon-circle" aria-hidden="true">
            <i class="bi bi-trophy-fill"></i>
          </div>
          <div class="content">
            <h4 id="sports-header">Sports Reviews</h4>
            <p>Get expert match analyses, top highlights, and predictions.</p>
            <a href="sportsreview.html" class="btn-custom">Explore Sports</a>
          </div>
        </section>

        <div class="divider" aria-hidden="true"></div>

        <!-- Movies Section -->
        <section class="hero-section" aria-labelledby="movie-header">
          <div class="icon-circle" aria-hidden="true">
            <i class="bi bi-film"></i>
          </div>
          <div class="content">
            <h4 id="movie-header">Movie Reviews</h4>
            <p>Fresh ratings, reviews, and recommendations for new releases.</p>
            <a href="moviereview.html" class="btn-custom">Explore Movies</a>
          </div>
        </section>
      </div>
    </div>
  `;
});

