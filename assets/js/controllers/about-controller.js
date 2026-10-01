/* ==========================================================================
   NEXUS VR — controllers/about-controller.js   [PHỤ TRÁCH: Trường Vũ]
   TẦNG 3 - CONTROLLERS: VỀ THƯƠNG HIỆU & HÀNH TRÌNH
   Contract: docs/pages/about.md
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initAboutPage);
  if (document.readyState === "interactive" || document.readyState === "complete") {
    initAboutPage();
  }

  function initAboutPage() {
    if (window.__nexusAboutInitialized) return;
    window.__nexusAboutInitialized = true;

    initScrollAnimations();
    initMilestoneInteractions();
  }

  /**
   * Hiệu ứng mượt mà xuất hiện khi cuộn tới các thẻ
   */
  function initScrollAnimations() {
    const animElements = document.querySelectorAll(".timeline-milestone, .principle-card, .team-member-card");
    if (!animElements.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animElements.forEach(el => el.style.opacity = "1");
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    animElements.forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      observer.observe(el);
    });
  }

  /**
   * Tương tác nhẹ nhàng trên các mốc thời gian
   */
  function initMilestoneInteractions() {
    const milestones = document.querySelectorAll(".timeline-milestone");
    milestones.forEach(item => {
      item.addEventListener("mouseenter", () => {
        const dot = item.querySelector(".timeline-milestone__dot");
        if (dot) dot.style.borderColor = "var(--accent-hover, #8B6239)";
      });
      item.addEventListener("mouseleave", () => {
        const dot = item.querySelector(".timeline-milestone__dot");
        if (dot) dot.style.borderColor = "var(--accent, #A67C52)";
      });
    });
  }
})();
