document.addEventListener("DOMContentLoaded", function () {
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) {
    console.error("Header container not found!");
    return;
  }

  headerContainer.innerHTML = `
    <style>
      /* 🔴 Common Red Button Style (applies to all menu buttons including admin) */
      .custom-red-btn {
        background: linear-gradient(135deg, #ff4d4d, #b30000);
        color: #fff !important;
        border: none;
        font-weight: 600;
        padding: 6px 14px;
        font-size: 0.85rem;
        border-radius: 6px;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      }
      .custom-red-btn:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #ff1a1a, #990000);
      }

      /* Brand Special Button (slightly bigger) */
      .custom-rdm-btn {
        background: linear-gradient(135deg, #ff4d4d, #b30000);
        color: #fff !important;
        border: none;
        font-weight: bold;
        font-family: 'Orbitron', sans-serif;
        letter-spacing: 1px;
        padding: 5px 14px;
        font-size: 0.95rem;
        border-radius: 8px;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
        transition: all 0.2s ease-in-out;
      }
      .custom-rdm-btn:hover {
        transform: scale(1.05);
        background: linear-gradient(135deg, #ff1a1a, #990000);
      }

      /* Header Background */
      header.top-header {
        background: linear-gradient(to right, #b30000, #ff1a1a);
        color: #fff;
        backdrop-filter: blur(4px);
      }

      header.top-header .container-fluid {
        padding-top: 0.55rem !important;
        padding-bottom: 0.55rem !important;
      }

      /* Offcanvas Styles */
      .offcanvas-header {
        padding: 0.6rem 1rem;
        background: #b30000;
        color: #fff;
      }
      .offcanvas-header h1 {
        font-size: 1.2rem;
        margin: 0;
      }
      .offcanvas-body {
        padding: 1rem;
      }
      .offcanvas .btn {
        font-size: 0.85rem !important;
        padding: 0.45rem 0.75rem !important;
        border-radius: 6px;
      }

      .offcanvas-footer {
        font-size: 0.75rem;
        color: #aaa;
        padding: 0.75rem 1rem;
        border-top: 1px solid #555;
        text-align: center;
      }
    </style>

    <!-- Header -->
    <header class="top-header position-fixed top-0 start-0 end-0 shadow-sm" style="z-index:1030;">
      <div class="container-fluid d-flex justify-content-between align-items-center px-3">
        
        <!-- Brand -->
        <div class="brand-title fw-bold">
          <button type="button" class="btn custom-rdm-btn" onclick="location.href='index.html'">
            𝓡𝓭𝓶11.𝓬𝓸𝓶
          </button>
        </div>

        <!-- Mobile toggle -->
        <button class="btn btn-outline-light d-md-none" type="button" data-bs-toggle="offcanvas"
          data-bs-target="#mobileMenu" aria-controls="mobileMenu"
          style="padding: 0.2rem 0.4rem; font-size: 0.8rem;">
          <i class="bi bi-list"></i>
        </button>

        <!-- Desktop Menu -->
        <div class="d-none d-md-flex gap-2">
          <button class="btn custom-red-btn" onclick="location.href='index.html'">
            <i class="bi bi-house-door-fill me-1"></i> All
          </button>
          <button class="btn custom-red-btn" onclick="location.href='moviereview.html'">
            <i class="bi bi-film me-1"></i> Movie Reviews
          </button>
          <button class="btn custom-red-btn" onclick="location.href='sportsreview.html'">
            <i class="bi bi-trophy-fill me-1"></i> Sports Reviews
          </button>
          <button class="btn custom-red-btn" onclick="location.href='admin.html'">
            <i class="bi bi-lock-fill me-1"></i> Login Admin
          </button>
        </div>
      </div>
    </header>

    <!-- Offcanvas Mobile Menu -->
    <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="mobileMenu"
      style="width: 55%; max-width: 960px;">
      <div class="offcanvas-header border-bottom border-secondary">
        <h1>𝓡𝓭𝓶11.𝓬𝓸𝓶</h1>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body d-flex flex-column">
        <div class="d-grid gap-2 mb-3">
          <button class="btn btn-sm custom-red-btn text-start w-100" onclick="location.href='index.html'">
            <i class="bi bi-house-door-fill me-2"></i> All Reviews
          </button>
          <button class="btn btn-sm custom-red-btn text-start w-100" onclick="location.href='moviereview.html'">
            <i class="bi bi-film me-2"></i> Movie Reviews
          </button>
          <button class="btn btn-sm custom-red-btn text-start w-100" onclick="location.href='sportsreview.html'">
            <i class="bi bi-trophy-fill me-2"></i> Sports Reviews
          </button>
          <button class="btn btn-sm custom-red-btn text-start w-100" onclick="location.href='admin.html'">
            <i class="bi bi-lock-fill me-2"></i> Login Admin
          </button>
        </div>
      </div>
      <!-- Footer -->
      <div class="offcanvas-footer">
        🛠️ Developed by <br><strong class="text-warning">Yalla Ramana</strong>
      </div>
    </div>
  `;
});
