/* ==========================================================================
   LifeSync landing — behaviour
   Motion: GSAP + ScrollTrigger (transform/opacity only, no scroll listeners).
   Everything degrades to a static, readable page under prefers-reduced-motion
   or if GSAP fails to load.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Configure your download links here.
   Leave a value as "" to keep its button in the "not ready yet" state.
   -------------------------------------------------------------------------- */
const LINKS = {
  // Published by the app repo's release workflow into the public LifeSyncPage
  // release assets (LifeSync/.github/workflows/release.yml), so the app source
  // stays private while this download link stays public.
  apk: "https://github.com/FARIDHAQI00/LifeSyncPage/releases/latest/download/LifeSync.apk",
  // TODO: Play Store listing URL
  play: "",
  // TODO: TestFlight public link
  testflight: "",
};

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof window.gsap !== "undefined";

/* --------------------------------------------------------------------------
   1. Download links
   -------------------------------------------------------------------------- */
function applyLinks() {
  const apkButtons = document.querySelectorAll('[data-link="apk"]');
  const hasApk = LINKS.apk.trim().length > 0;

  apkButtons.forEach((el) => {
    if (hasApk) {
      el.setAttribute("href", LINKS.apk);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      el.removeAttribute("data-pending");
    } else {
      el.setAttribute("href", "#unduh");
      el.setAttribute("data-pending", "true");
    }
  });

  const note = document.querySelector("[data-download-note]");
  if (note) note.hidden = hasApk;

  document.querySelectorAll("[data-todo]").forEach((el) => {
    const url = (LINKS[el.getAttribute("data-todo")] || "").trim();
    if (url) {
      el.setAttribute("href", url);
      el.removeAttribute("data-todo");
    }
  });
}

/* --------------------------------------------------------------------------
   2. Footer year
   -------------------------------------------------------------------------- */
function setYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

/* --------------------------------------------------------------------------
   3. Sticky header state
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;left:0;height:1px;width:1px;";
  document.body.prepend(sentinel);

  new IntersectionObserver(
    ([entry]) => header.classList.toggle("is-stuck", !entry.isIntersecting),
    { rootMargin: "-8px 0px 0px 0px", threshold: 0 }
  ).observe(sentinel);
}

/* --------------------------------------------------------------------------
   4. Mobile menu
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const panel = document.getElementById("navMobile");
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    toggle.innerHTML = open
      ? '<i class="ph-x" aria-hidden="true"></i>'
      : '<i class="ph-list-dashes" aria-hidden="true"></i>';
    panel.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () =>
    setOpen(toggle.getAttribute("aria-expanded") !== "true")
  );
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

/* --------------------------------------------------------------------------
   5. Carousel (visible cards depend on viewport, advance one card at a time)
   -------------------------------------------------------------------------- */
function initCarousel() {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-carousel-track]");
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  const dotsWrap = root.querySelector("[data-carousel-dots]");
  if (!track || !prev || !next) return;

  const cards = Array.from(track.children);
  let index = 0;
  let visible = 1;
  let maxIndex = 0;

  const visibleCount = () => {
    const w = window.innerWidth;
    if (w > 1024) return 3;
    if (w > 640) return 2;
    return 1;
  };

  const buildDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement("span");
      dot.className = "carousel__dot";
      dot.setAttribute("aria-current", i === index ? "true" : "false");
      dotsWrap.appendChild(dot);
    }
  };

  const render = (animate) => {
    const stride = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    if (!animate || reduceMotion) track.style.transition = "none";
    else track.style.transition = "";
    track.style.transform = `translate3d(${-index * stride}px, 0, 0)`;
    prev.disabled = index <= 0;
    next.disabled = index >= maxIndex;
    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach((dot, i) =>
        dot.setAttribute("aria-current", i === index ? "true" : "false")
      );
    }
  };

  const measure = () => {
    visible = visibleCount();
    maxIndex = Math.max(0, cards.length - visible);
    index = Math.min(index, maxIndex);
    buildDots();
    render(false);
  };

  prev.addEventListener("click", () => {
    index = Math.max(0, index - 1);
    render(true);
  });
  next.addEventListener("click", () => {
    index = Math.min(maxIndex, index + 1);
    render(true);
  });

  let raf = null;
  window.addEventListener(
    "resize",
    () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    },
    { passive: true }
  );

  measure();
}

/* --------------------------------------------------------------------------
   6. Motion: hero + scroll reveals + device gauges
   -------------------------------------------------------------------------- */
function initMotion() {
  const staticFallback = () => {
    document.documentElement.classList.add("is-static");
    document.querySelectorAll("[data-sla-ring]").forEach((c) => {
      c.style.strokeDashoffset = String(163.4 * (1 - 0.75));
    });
    document.querySelectorAll("[data-dial-ring]").forEach((c) => {
      c.style.strokeDashoffset = String(439.8 * (1 - 0.55));
    });
  };

  if (!hasGsap || reduceMotion) {
    staticFallback();
    return;
  }

  const { gsap } = window;
  gsap.registerPlugin(window.ScrollTrigger);

  // Hero — copy enters first, then the device trio.
  const heroCopy = document.querySelectorAll(".hero__inner .reveal");
  gsap.set(heroCopy, { autoAlpha: 0, y: 22 });
  gsap.to(heroCopy, {
    autoAlpha: 1,
    y: 0,
    duration: 0.85,
    ease: "power3.out",
    stagger: 0.08,
    delay: 0.08,
  });

  const stagePhones = gsap.utils.toArray(".hero__stage .phone");
  const stageChips = gsap.utils.toArray(".hero__stage .stage-chip");
  gsap.from(stagePhones, {
    autoAlpha: 0,
    y: 54,
    scale: 0.95,
    duration: 1.1,
    ease: "power3.out",
    stagger: 0.1,
    delay: 0.3,
  });
  gsap.from(stageChips, {
    autoAlpha: 0,
    scale: 0.86,
    duration: 0.7,
    ease: "back.out(1.7)",
    stagger: 0.14,
    delay: 0.9,
  });

  // Generic scroll reveals (cards inside grids get batched below).
  gsap.utils.toArray(".reveal").forEach((el) => {
    if (el.closest(".hero")) return;
    if (el.classList.contains("fcard") || el.classList.contains("qa__card")) return;
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 22 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      }
    );
  });

  const batch = (selector, trigger, stagger) => {
    const items = gsap.utils.toArray(selector);
    if (!items.length) return;
    gsap.set(items, { autoAlpha: 0, y: 26 });
    gsap.to(items, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger,
      scrollTrigger: { trigger, start: "top 84%", once: true },
    });
  };

  batch(".bento .fcard", ".bento", 0.06);
  batch(".qa__card", ".qa", 0.05);

  // Device gauges draw themselves.
  document.querySelectorAll("[data-sla-ring]").forEach((circle) => {
    gsap.to(circle, {
      strokeDashoffset: 163.4 * (1 - 0.75),
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: { trigger: circle, start: "top 94%", once: true },
    });
  });
  document.querySelectorAll("[data-dial-ring]").forEach((circle) => {
    gsap.to(circle, {
      strokeDashoffset: 439.8 * (1 - 0.55),
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: { trigger: circle, start: "top 92%", once: true },
    });
  });

  // Scan beam sweep.
  const beam = document.querySelector("[data-scan-beam]");
  if (beam) {
    gsap.fromTo(
      beam,
      { top: "8%" },
      { top: "88%", duration: 1.9, ease: "sine.inOut", repeat: -1, yoyo: true }
    );
  }

  window.addEventListener("load", () => window.ScrollTrigger.refresh());

  // Safety net: if the ticker never advances (stalled rAF, heavy throttling),
  // the hero must not stay hidden.
  window.setTimeout(() => {
    document
      .querySelectorAll(".hero__inner .reveal, .hero__stage .phone, .hero__stage .stage-chip")
      .forEach((el) => {
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.opacity === "0") {
          el.style.visibility = "visible";
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
  }, 3000);
}

/* --------------------------------------------------------------------------
   7. Toast for links that are not published yet
   -------------------------------------------------------------------------- */
function initToast() {
  let toast = null;
  let timer = null;

  const show = (message) => {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  };

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-todo]");
    if (!el) return;
    e.preventDefault();
    show("Halaman ini belum dipublikasikan.");
  });
}

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */
applyLinks();
setYear();
initHeader();
initMobileNav();
initCarousel();
initMotion();
initToast();
