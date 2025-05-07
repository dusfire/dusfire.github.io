// DOM Elements
const menuBtn = document.querySelector(".menu-btn");
const navbar = document.querySelector(".navbar");
const themeToggle = document.getElementById("theme-toggle");
const portfolioGrid = document.querySelector(".portfolio-grid");
const loadMoreBtn = document.querySelector(".load-more-btn");
const portfolioLoading = document.querySelector(".portfolio-loading");
const portfolioError = document.querySelector(".portfolio-error");
const contactForm = document.getElementById("contact-form");
const formSuccess = document.querySelector(".form-success");

// Global variables
let projectsData = [];
let visibleProjects = 16;
let isDarkTheme = true;
let isMenuOpen = false;

// Initialize the website
document.addEventListener("DOMContentLoaded", () => {
  // Add animation classes to elements
  animateOnScroll();

  // Fetch projects
  fetchProjects();

  // Setup event listeners
  setupEventListeners();
});

// Animate elements when they come into view
function animateOnScroll() {
  const sections = document.querySelectorAll("section");

  // Add initial animations to the hero section
  const heroText = document.querySelector(".hero-text");
  const heroImage = document.querySelector(".hero-image");

  if (heroText) heroText.classList.add("fade-in");
  if (heroImage) heroImage.classList.add("slide-in-right");

  // Create intersection observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const elements = entry.target.querySelectorAll(
            ".service-card, .skill-icon, .portfolio-card, .section-title"
          );
          elements.forEach((el) => {
            el.classList.add("fade-in");
          });

          // Add specific animations to elements inside the visible section
          if (entry.target.id === "services") {
            const cards = entry.target.querySelectorAll(".service-card");
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add("slide-up");
              }, index * 200);
            });
          }

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  // Observe all sections except hero (which is already animated on load)
  sections.forEach((section) => {
    if (section.className !== "hero") {
      observer.observe(section);
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Mobile menu toggle - Fix for hamburger menu
  if (menuBtn) {
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent event bubbling
      toggleMenu();
    });
  }

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Load more projects
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreProjects);
  }

  // Contact form submission
  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit);
  }

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      isMenuOpen &&
      navbar &&
      !navbar.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      toggleMenu();
    }
  });

  // Close menu when clicking on menu items
  const navLinks = document.querySelectorAll(".navbar a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (isMenuOpen && window.innerWidth <= 768) {
        toggleMenu();
      }
    });
  });

  // Header scroll effect
  window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (header) {
      if (window.scrollY > 50) {
        header.style.padding = "15px 0";
        header.style.boxShadow = "0 5px 20px rgba(0, 0, 0, 0.2)";
      } else {
        header.style.padding = "20px 0";
        header.style.boxShadow = "none";
      }
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      // Close mobile menu if open
      if (isMenuOpen && window.innerWidth <= 768) {
        toggleMenu();
      }

      const targetId = this.getAttribute("href");
      if (targetId !== "#") {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }
    });
  });
}

// Toggle mobile menu - Fixed function
function toggleMenu() {
  if (!navbar || !menuBtn) return;

  isMenuOpen = !isMenuOpen;

  if (isMenuOpen) {
    navbar.classList.add("active");
    menuBtn.innerHTML = '<i class="bx bx-x"></i>';
  } else {
    navbar.classList.remove("active");
    menuBtn.innerHTML = '<i class="bx bx-menu"></i>';
  }
}

// Toggle light/dark theme
function toggleTheme() {
  const root = document.documentElement;

  if (isDarkTheme) {
    // Switch to light theme
    root.style.setProperty("--bg-dark", "#f5f5f7");
    root.style.setProperty("--bg-darker", "#e0e0e5");
    root.style.setProperty("--text-color", "#0a0a16");
    root.style.setProperty("--text-secondary", "#555");
    root.style.setProperty("--card-bg", "rgba(240, 240, 250, 0.7)");
    root.style.setProperty("--card-border", "rgba(200, 200, 220, 0.3)");
    root.style.setProperty("--card-hover", "rgba(230, 230, 240, 0.9)");
    root.style.setProperty("--header-bg", "rgba(255, 255, 255, 0.65)");

    if (themeToggle) themeToggle.innerHTML = '<i class="bx bx-sun"></i>';
  } else {
    // Switch back to dark theme
    root.style.setProperty("--bg-dark", "#0a0a16");
    root.style.setProperty("--bg-darker", "#06061a");
    root.style.setProperty("--text-color", "#ffffff");
    root.style.setProperty("--text-secondary", "#b3b3b3");
    root.style.setProperty("--card-bg", "rgba(31, 31, 51, 0.7)");
    root.style.setProperty("--card-border", "rgba(61, 61, 102, 0.3)");
    root.style.setProperty("--card-hover", "rgba(41, 41, 71, 0.9)");
    root.style.setProperty("--header-bg", "rgba(10, 10, 22, 0.9)");
    if (themeToggle) themeToggle.innerHTML = '<i class="bx bx-moon"></i>';
  }

  isDarkTheme = !isDarkTheme;
}

// Fetch projects from JSON file
async function fetchProjects() {
  if (!portfolioGrid || !portfolioLoading || !portfolioError) return;

  try {
    portfolioLoading.style.display = "block";
    portfolioGrid.style.display = "none";

    const response = await fetch(
      "https://raw.githubusercontent.com/dusfire/my-image/refs/heads/main/myproject.json"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }

    const data = await response.json();

    // Sort projects by ID in descending order (newest first)
    projectsData = data.sort((a, b) => b.id - a.id);

    // Display projects
    displayProjects();

    // Hide loading, show portfolio grid and "Load More" button if there are more projects
    portfolioLoading.style.display = "none";
    portfolioGrid.style.display = "grid";

    if (loadMoreBtn) {
      if (projectsData.length > visibleProjects) {
        loadMoreBtn.style.display = "inline-block";
      } else {
        loadMoreBtn.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    portfolioLoading.style.display = "none";
    portfolioError.style.display = "block";
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
  }
}

// Display projects in the portfolio grid
function displayProjects() {
  if (!portfolioGrid) return;

  // Clear existing content
  portfolioGrid.innerHTML = "";

  // Get projects to display
  const projectsToShow = projectsData.slice(0, visibleProjects);

  // Create project cards
  projectsToShow.forEach((project) => {
    const projectCard = document.createElement("div");
    projectCard.className = "portfolio-card";

    // Use the provided image or a placeholder
    const imageUrl =
      project.cover ||
      `/api/placeholder/400/300?text=${encodeURIComponent(project.title)}`;

    projectCard.innerHTML = `
            <img src="${imageUrl}" alt="${project.title}" loading="lazy">
            <div class="portfolio-content">
                <h3>${project.title}</h3>
                <p>${project.Language}</p>
                <div class="portfolio-links">
                    <a href="${project.url}" target="_blank" rel="noopener noreferrer">
                        View Project <i class="bx bx-link-external"></i>
                    </a>
                </div>
            </div>
        `;

    portfolioGrid.appendChild(projectCard);
  });

  // Add animation to new cards
  const newCards = portfolioGrid.querySelectorAll(".portfolio-card");
  newCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("fade-in");
    }, index * 100);
  });
}

// Load more projects when clicking the "Load More" button
function loadMoreProjects() {
  // Increase the number of visible projects
  visibleProjects += 4;

  // Re-display projects
  displayProjects();

  // Hide "Load More" button if all projects are displayed
  if (loadMoreBtn && visibleProjects >= projectsData.length) {
    loadMoreBtn.style.display = "none";
  }
}

// Handle contact form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!contactForm || !formSuccess) return;

  // Get form data
  const formData = new FormData(contactForm);

  try {
    // Submit form to Web3Forms
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      // Show success message
      formSuccess.style.display = "block";
      contactForm.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        formSuccess.style.display = "none";
      }, 5000);
    } else {
      throw new Error("Form submission failed");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("There was an error submitting the form. Please try again later.");
  }
}
