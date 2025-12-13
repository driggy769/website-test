/* =================================================
   CONFIG — YOUTUBE API
================================================= */
const API_KEY = "AIzaSyDRXu9kE4sVit3W6opZdasW83GnwM7ciiI";
const CHANNEL_ID = "UC3VLKH3P1dCoy9FNnkQVy0A";
const MAX_RESULTS = 6;

/* =================================================
   NAVBAR HAMBURGER TOGGLE
================================================= */
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
  });
}

/* =========================
   SCROLL REVEAL (SAFE)
========================= */
const revealSections = document.querySelectorAll(".reveal-section");

if (revealSections.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // reveal once
        }
      });
    },
    { threshold: 0.2 }
  );

  revealSections.forEach((section) => {
    revealObserver.observe(section);
  });
}

/* =================================================
   APPLY STAGGER TO VIDEO CARDS
================================================= */
function applyVideoStagger() {
  const videoCards = document.querySelectorAll(".video-card");
  videoCards.forEach((card, index) => {
    card.style.setProperty("--delay", `${index * 0.1}s`);
  });
}

/* =================================================
   LOAD LATEST YOUTUBE VIDEOS
================================================= */
async function loadLatestVideos() {
  const videoGrid = document.getElementById("videoGrid");
  if (!videoGrid) return;

  const apiUrl =
    `https://www.googleapis.com/youtube/v3/search?` +
    `key=${API_KEY}` +
    `&channelId=${CHANNEL_ID}` +
    `&part=snippet` +
    `&order=date` +
    `&maxResults=${MAX_RESULTS}` +
    `&type=video`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.items) return;

    videoGrid.innerHTML = "";

    data.items.forEach((item) => {
      const videoId = item.id.videoId;

      const card = document.createElement("div");
      card.className = "video-card";

      card.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${videoId}"
          title="${item.snippet.title}"
          loading="lazy"
          allowfullscreen
        ></iframe>
      `;

      videoGrid.appendChild(card);
    });

    // Apply stagger AFTER videos are injected
    applyVideoStagger();

    // Ensure reveal observer sees newly injected content
    if (revealObserver) {
      const videoSection = document.querySelector(".video-section");
      if (videoSection) {
        revealObserver.observe(videoSection);
      }
    }
  } catch (error) {
    console.error("YouTube API error:", error);
  }
}

/* =================================================
   INIT ON PAGE LOAD
================================================= */
window.addEventListener("load", () => {
  loadLatestVideos();
});

const widgetContainer = document.querySelector(".insta-section");

if (widgetContainer) {
  const observer = new MutationObserver(() => {
    widgetContainer
      .querySelectorAll('a[title="Free Instagram Feed Widget"]')
      .forEach((link) => {
        link.style.display = "none";
        observer.disconnect();
      });
  });

  observer.observe(widgetContainer, {
    childList: true,
    subtree: true,
  });
}

const hero = document.getElementById("hero");
const leftTitle = document.querySelector(".title.left");
const rightTitle = document.querySelector(".title.right");

const CENTER = 0.5;
const isMobile = window.matchMedia("(max-width: 768px)").matches;

// device-aware image margin
const EDGE_MARGIN_PX = isMobile ? 140 : 220;

/* STATE */
let pointerX01 = CENTER; // last known pointer position (0–1)
let reveal = -0.2; // start offscreen for intro
let velocity = 0;
let introPlaying = true;

/* MOTION TUNING */
const FOLLOW = 0.1;
const SPRING = 0.07;
const FRICTION = 0.9;

/* HELPERS */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const clamp01 = (v) => clamp(v, 0, 1);

/* FADE IN HERO */
window.addEventListener("load", () => {
  hero.classList.add("is-visible");
});

/* POINTER TRACKING (DESKTOP ONLY) */
if (!isMobile) {
  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    pointerX01 = clamp01(x);
    introPlaying = false;
  });
}

/*
  IMPORTANT:
  We intentionally do NOTHING on pointerleave.
  This prevents snapping back to center on multi-monitor setups.
*/

/* ANIMATION LOOP */
function animate() {
  const rect = hero.getBoundingClientRect();

  // image clamp range
  const min = EDGE_MARGIN_PX / rect.width;
  const max = 1 - min;

  // target logic
  const target = isMobile ? CENTER : introPlaying ? CENTER : pointerX01;

  // smooth intent
  const intent = reveal + (target - reveal) * FOLLOW;

  // spring physics
  const force = (intent - reveal) * SPRING;
  velocity = velocity * FRICTION + force;
  reveal += velocity;

  // derive synced outputs
  const imageReveal = clamp(reveal, min, max); // composed image range
  const colorReveal = clamp01(reveal); // full-width color range

  // update CSS vars
  hero.style.setProperty("--reveal", `${imageReveal * 100}%`);
  hero.style.setProperty("--color-reveal", `${colorReveal * 100}%`);

  // title emphasis (desktop only)
  if (!isMobile) {
    if (imageReveal < CENTER) {
      leftTitle.style.opacity = "1";
      rightTitle.style.opacity = "0.35";
    } else {
      leftTitle.style.opacity = "0.35";
      rightTitle.style.opacity = "1";
    }
  }

  requestAnimationFrame(animate);
}

animate();
