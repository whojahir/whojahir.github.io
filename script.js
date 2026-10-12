document.documentElement.classList.add("js");

const navButton = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navButton && navLinks) {
  navButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navButton.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
      navLinks.classList.remove("open");
      navButton.setAttribute("aria-expanded", "false");
      navButton.focus();
    }
  });
}

const primaryNavLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const linkedSections = primaryNavLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (primaryNavLinks.length && linkedSections.length && "IntersectionObserver" in window) {
  const setActiveNavLink = (sectionId) => {
    primaryNavLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("is-current", isCurrent);

      if (isCurrent) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const navigationObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (visibleSection) {
        setActiveNavLink(visibleSection.target.id);
      }
    },
    {
      rootMargin: "-38% 0px -52% 0px",
      threshold: [0, 0.2, 0.5, 0.8, 1]
    }
  );

  linkedSections.forEach((section) => navigationObserver.observe(section));
}

const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".hero-text, .hero-visual, .section, .site-footer, .card");
const hasIntersectionObserver = "IntersectionObserver" in window;

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  /*
   * Add the hidden state first, then wait for it to be painted before
   * observing. Without the extra frame, elements already in the viewport can
   * receive both classes before the browser paints, making the transition
   * impossible to see.
   */
  const allCards = [...document.querySelectorAll(".card")];

  revealItems.forEach((item) => {
    item.classList.add("reveal");
    if (item.classList.contains("card")) {
      const cardIndex = allCards.indexOf(item);
      item.style.setProperty("--reveal-delay", `${Math.max(cardIndex, 0) * 70}ms`);
    }
  });

  const showVisibleItems = () => {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  };

  if (hasIntersectionObserver) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealItems.forEach((item) => revealObserver.observe(item));
      });
    });
  } else {
    requestAnimationFrame(showVisibleItems);
  }
}

const supportsFineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const cards = document.querySelectorAll(".card");

if (!prefersReducedMotion && supportsFineHover) {
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const tiltX = (0.5 - y) * 5;
      const tiltY = (x - 0.5) * 5;

      card.style.setProperty("--tilt-x", `${tiltX}deg`);
      card.style.setProperty("--tilt-y", `${tiltY}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });
}
