document.addEventListener("DOMContentLoaded", function () {
  const heroContainer = document.getElementById("hero-section");

  heroContainer.innerHTML = `
    <style>
      /* Outer main container with border */
      .main-container {
        width: 100%;           /* full width of parent */
        margin: 2rem 0;        /* smaller vertical margin */
        padding: 0.5rem 1rem;  /* minimal padding */
        border: 2px solid #d6336c;
        border-radius: 12px;
        background: #fff0f4;
        box-shadow: 0 4px 8px rgba(214, 51, 108, 0.15);
      }

      /* Inner hero-wrapper */
      .hero-wrapper {
        display: flex;
        justify-content: center;
        align-items: stretch;
        gap: 0;
        font-family: 'Poppins', sans-serif;
        user-select: none;
      }

      /* Left & Right sections */
      .hero-section {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;  /* very small padding */
        flex-direction: row;
        gap: 1rem;
        color: #3a3a3a;
      }

      /* Pink vertical divider */
      .divider {
        width: 3px; /* thinner */
        background: linear-gradient(180deg, #d6336c 0%, #e75480 100%);
        border-radius: 2px;
        margin: 0 0;
      }

      /* Icon styles */
      .icon-circle {
        width: 32px;   /* very small */
        height: 32px;
        background: #e75480;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 1.2rem;  /* smaller icon */
        animation: bounce 2.5s ease-in-out infinite;
        flex-shrink: 0;
      }

      /* Bounce animation */
      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-4px);
        }
      }

      /* Text content */
      .content {
        flex-grow: 1;
      }

      .content h4 {
        margin: 0 0 0.15rem;
        font-weight: 700;
        font-size: 1rem;   /* small font */
        color: #d6336c;
      }

      .content p {
        margin: 0 0 0.5rem;
        font-size: 0.8rem; /* small font */
        color: #555;
        line-height: 1.2;
      }

      /* Buttons */
      .btn-custom {
        padding: 0.25rem 0.7rem;  /* very small padding */
        border-radius: 20px;
        border: 2px solid #d6336c;
        background: transparent;
        color: #d6336c;
        font-weight: 600;
        font-size: 0.8rem;
        text-decoration: none;
        transition: all 0.3s ease;
        display: inline-block;
      }
      .btn-custom:hover {
        background: #d6336c;
        color: #fff;
      }

      /* Responsive stack */
      @media (max-width: 720px) {
        .main-container {
          padding: 0.5rem 1rem;
          margin: 1.5rem 0;
        }
        .hero-wrapper {
          flex-direction: column;
          max-width: 90vw;
        }
        .divider {
          width: 100%;
          height: 3px;
          margin: 1rem 0;
          border-radius: 3px;
        }
        .hero-section {
          flex-direction: column;
          text-align: center;
          padding: 0.75rem 0.5rem;
          gap: 0.5rem;
        }
        .icon-circle {
          margin-bottom: 0.3rem;
          animation: none;
        }
        .content h4 {
          font-size: 0.95rem;
        }
        .content p {
          font-size: 0.75rem;
        }
      }
    </style>

    <div class="main-container" role="main" aria-label="Hero Section Container">
      <div class="hero-wrapper" role="region" aria-label="Sports and Movie Reviews">
        <section class="hero-section" aria-labelledby="sports-header">
          <div class="icon-circle" aria-hidden="true">
            <i class="bi bi-trophy-fill"></i>
          </div>
          <div class="content">
            <h4 id="sports-header">Sports Reviews</h4>
            <p>Get expert match analyses, top highlights, and predictions from the world of sports.</p>
            <a href="sportsreview.html" class="btn-custom" role="button" aria-label="View Sports Reviews">Explore Sports</a>
          </div>
        </section>

        <div class="divider" aria-hidden="true"></div>

        <section class="hero-section" aria-labelledby="movie-header">
          <div class="icon-circle" aria-hidden="true">
            <i class="bi bi-film"></i>
          </div>
          <div class="content">
            <h4 id="movie-header">Movie Reviews</h4>
            <p>Dive into fresh ratings, reviews, and recommendations for new movies and timeless classics.</p>
            <a href="moviereview.html" class="btn-custom" role="button" aria-label="View Movie Reviews">Explore Movies</a>
          </div>
        </section>
      </div>
    </div>
  `;
});
