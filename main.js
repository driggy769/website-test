document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal");

  // quick sanity check:
  console.log("Reveal elements found:", reveals.length);

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  reveals.forEach((el) => observer.observe(el));
});

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
