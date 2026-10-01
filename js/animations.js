"use strict";

/* =========================================================
   PORTFOLIO - ANIMATIONS
   GSAP + ScrollTrigger
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initPortfolioAnimations();
});

function initPortfolioAnimations() {
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
        // reducedMotion ||
        typeof gsap === "undefined" ||
        typeof ScrollTrigger === "undefined"
    ) {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    initHeroAnimation();
    initSectionReveal();
    initProjectStagger();
    initSubtleTitleEffect();
}

/* =========================================================
   HERO
   ========================================================= */

function initHeroAnimation() {
    const elements = document.querySelectorAll(
        ".hero__kicker, .hero__title, .hero__role, .hero__value, .hero__actions"
    );

    if (!elements.length) {
        return;
    }

    gsap.set(elements, {
        opacity: 1,
        y: 0
    });

    gsap.from(elements, {
        opacity: 0,
        y: 24,
        duration: 0.75,
        stagger: 0.1,
        ease: "power2.out",
        //clearProps: "transform"
    });
}

/* =========================================================
   SECCIONES
   ========================================================= */

function initSectionReveal() {
    const sections = document.querySelectorAll(
        ".section-heading, .about__layout, .contact-terminal"
    );

    sections.forEach((element) => {
        gsap.from(element, {
            opacity: 0,
            y: 35,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top 82%",
                once: true
            }
        });
    });
}

/* =========================================================
   PROYECTOS - STAGGER
   ========================================================= */

function initProjectStagger() {
    const cards = document.querySelectorAll(".project-card");

    if (!cards.length) {
        return;
    }

    gsap.from(cards, {
        opacity: 0,
        y: 35,
        duration: 0.65,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".projects-grid",
            start: "top 78%",
            once: true
        }
    });
}

/* =========================================================
   EFECTO SUTIL DEL TÍTULO
   ========================================================= */

function initSubtleTitleEffect() {
    const title = document.querySelector(".hero__role");

    if (!title) {
        return;
    }

    gsap.to(title, {
        textShadow:
            "0 0 20px rgba(255, 31, 61, 0.45), 0 0 35px rgba(255, 31, 61, 0.18)",
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
}