"use strict";

/* =========================================================
   PORTFOLIO - MAIN
   Lenis + Header + Mobile Menu + Partículas + Anclas
   ========================================================= */

const PORTFOLIO_CONFIG = {
    particles: {
        desktop: 80,
        mobile: 35,
        connectionDistance: 120,
        mouseDistance: 180,
        speed: 0.35,
        maxPixelRatio: 2
    },
    header: {
        scrollThreshold: 40
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initI18n();
    initLenis();
    initHeader();
    initMobileMenu();
    initParticles();
    initAnchorNavigation();
    initProjectModal();
});

/* =========================================================
   LENIS
   ========================================================= */

function initLenis() {
    if (typeof Lenis === "undefined") {
        console.warn("Lenis no está disponible.");
        return;
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
        return;
    }

    const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false
    });

    window.portfolioLenis = lenis;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}

/* =========================================================
   HEADER
   ========================================================= */

function initHeader() {
    const header = document.getElementById("site-header");

    if (!header) {
        return;
    }

    const updateHeader = () => {
        header.classList.toggle(
            "is-scrolled",
            window.scrollY > PORTFOLIO_CONFIG.header.scrollThreshold
        );
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, {
        passive: true
    });
}

/* =========================================================
   MENÚ MÓVIL
   ========================================================= */

function initMobileMenu() {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-navigation");

    if (!toggle || !menu) {
        return;
    }

    const links = menu.querySelectorAll("a");

    const setMenuState = (isOpen) => {
        toggle.classList.toggle("is-open", isOpen);
        menu.classList.toggle("is-open", isOpen);

        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute(
            "aria-label",
            isOpen ? window.t("header.menuClose") : window.t("header.menuOpen")
        );

        document.body.classList.toggle("menu-open", isOpen);
    };

    toggle.addEventListener("click", () => {
        const isOpen = !menu.classList.contains("is-open");
        setMenuState(isOpen);
    });

    links.forEach((link) => {
        link.addEventListener("click", () => {
            setMenuState(false);
        });
    });

    window.addEventListener("languagechange", () => {
        const isOpen = menu.classList.contains("is-open");
        toggle.setAttribute(
            "aria-label",
            isOpen ? window.t("header.menuClose") : window.t("header.menuOpen")
        );
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuState(false);
        }
    });
}

/* =========================================================
   SMOOTH SCROLL / ANCLAS
   ========================================================= */

function initAnchorNavigation() {
    const links = document.querySelectorAll("[data-scroll-to]");

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.dataset.scrollTo;
            const target = document.getElementById(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            if (
                window.portfolioLenis &&
                typeof window.portfolioLenis.scrollTo === "function"
            ) {
                window.portfolioLenis.scrollTo(target, {
                    offset: -16,
                    duration: 1.1
                });
            } else {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            history.replaceState(null, "", `#${targetId}`);
        });
    });
}

/* =========================================================
   PARTÍCULAS
   Adaptación de la lógica de la intro.
   ========================================================= */

function initParticles() {
    const canvas = document.getElementById("particles-canvas");

    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d", {
        alpha: true
    });

    if (!context) {
        return;
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    //if (reducedMotion) {
    //    return;
    //}

    let animationFrame = null;
    let particles = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const mouse = {
        x: null,
        y: null,
        active: false
    };

    const getParticleCount = () => {
        return window.innerWidth <= 600
            ? PORTFOLIO_CONFIG.particles.mobile
            : PORTFOLIO_CONFIG.particles.desktop;
    };

    const resizeCanvas = () => {
        pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            PORTFOLIO_CONFIG.particles.maxPixelRatio
        );

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        createParticles();
    };

    const createParticles = () => {
        const count = getParticleCount();

        particles = Array.from(
            { length: count },
            () => {
                const isRed = Math.random() < 0.3;

                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) *
                        PORTFOLIO_CONFIG.particles.speed,
                    vy: (Math.random() - 0.5) *
                        PORTFOLIO_CONFIG.particles.speed,
                    radius: 1.2 + Math.random() * 1.6,
                    color: isRed ? "red" : "cyan"
                };
            }
        );
    };

    const updateParticles = () => {
        particles.forEach((particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < -20) {
                particle.x = width + 20;
            } else if (particle.x > width + 20) {
                particle.x = -20;
            }

            if (particle.y < -20) {
                particle.y = height + 20;
            } else if (particle.y > height + 20) {
                particle.y = -20;
            }

            if (!mouse.active) {
                return;
            }

            const dx = particle.x - mouse.x;
            const dy = particle.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (
                distance > 0 &&
                distance < PORTFOLIO_CONFIG.particles.mouseDistance
            ) {
                const force =
                    (PORTFOLIO_CONFIG.particles.mouseDistance - distance) /
                    PORTFOLIO_CONFIG.particles.mouseDistance;

                particle.x += (dx / distance) * force * 0.8;
                particle.y += (dy / distance) * force * 0.8;
            }
        });
    };

    const drawConnections = () => {
        const connectionDistance =
            PORTFOLIO_CONFIG.particles.connectionDistance;

        for (let index = 0; index < particles.length; index += 1) {
            const current = particles[index];

            for (
                let otherIndex = index + 1;
                otherIndex < particles.length;
                otherIndex += 1
            ) {
                const other = particles[otherIndex];

                const dx = current.x - other.x;
                const dy = current.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance >= connectionDistance) {
                    continue;
                }

                const opacity =
                    (1 - distance / connectionDistance) * 0.62;

                const color =
                    current.color === "red" ||
                        other.color === "red"
                        ? `rgba(255, 31, 61, ${opacity})`
                        : `rgba(0, 229, 255, ${opacity})`;

                context.beginPath();
                context.moveTo(current.x, current.y);
                context.lineTo(other.x, other.y);
                context.strokeStyle = color;
                context.lineWidth = 0.7;
                context.stroke();
            }
        }
    };

    const drawMouseConnections = () => {
        if (!mouse.active) {
            return;
        }

        const distanceLimit =
            PORTFOLIO_CONFIG.particles.mouseDistance;

        particles.forEach((particle) => {
            const dx = particle.x - mouse.x;
            const dy = particle.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance >= distanceLimit) {
                return;
            }

            const opacity =
                (1 - distance / distanceLimit) * 0.72;

            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(mouse.x, mouse.y);
            context.strokeStyle =
                `rgba(255, 31, 61, ${opacity})`;
            context.lineWidth = 0.9;
            context.stroke();
        });
    };

    const drawParticles = () => {
        particles.forEach((particle) => {
            const fill =
                particle.color === "red"
                    ? "rgba(255, 31, 61, 0.9)"
                    : "rgba(0, 229, 255, 0.9)";

            context.beginPath();
            context.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );

            context.fillStyle = fill;
            context.shadowBlur = 9;
            context.shadowColor =
                particle.color === "red"
                    ? "rgba(255, 31, 61, 0.45)"
                    : "rgba(0, 229, 255, 0.4)";

            context.fill();
        });

        context.shadowBlur = 0;
    };

    const render = () => {
        context.clearRect(0, 0, width, height);

        updateParticles();
        drawConnections();
        drawMouseConnections();
        drawParticles();

        animationFrame = requestAnimationFrame(render);
    };

    canvas.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.active = true;
    });

    canvas.addEventListener("mouseleave", () => {
        mouse.active = false;
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener("resize", resizeCanvas);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (animationFrame !== null) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
        } else if (animationFrame === null) {
            render();
        }
    });

    resizeCanvas();
    render();
}

/* =========================================================
   PROJECT MODAL / LIGHTBOX
   ========================================================= */

function initProjectModal() {
    const cards = document.querySelectorAll(".project-card");

    if (!cards.length) {
        return;
    }

    const modal = createProjectModal();

    const projects = [
        {
            title: { es: "SPORT MEDICAL", en: "SPORT MEDICAL" },
            file: "proyecto-01.sh",
            description: {
                es: "*Sport Medical* es un ecosistema digital desarrollado en *Flutter* diseñado para modernizar y optimizar la gestión operativa y clínica de centros de terapia física. El sistema reemplaza el registro manual en fichas de papel por una solución segura, escalable y accesible en la nube a través de **Firebase Hosting**, garantizando un control riguroso de tratamientos, firmas digitales de conformidad y un canal transparente de consulta para el paciente.",
                en: "*Sport Medical* is a digital ecosystem built with *Flutter* to modernize and optimize the operational and clinical management of physical therapy centers. It replaces paper-based records with a secure, scalable cloud solution using **Firebase Hosting**, ensuring careful treatment tracking, digital consent signatures, and a transparent information channel for patients."
            },
            badges: { es: ["Flutter", "Firebase"], en: ["Flutter", "Firebase"] },

            website: {
                text: {
                    es: "  ✔ VIDEO EXPLICATIVO​",
                    en: "  ✔ EXPLANATORY VIDEO"
                },
                url: "https://youtube.com/shorts/owXXgbDPa1U?si=gVqCwG6eUV0CNFbd"
            },

            gallery: [
                {
                    type: "image",
                    src: "assets/img/projects/proyecto1/1.webp",
                    alt: "splash screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto1/2.webp",
                    alt: "login screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto1/3.webp",
                    alt: "login_personal screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto1/4.webp",
                    alt: "login_personal screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto1/5.webp",
                    alt: "login_personal screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto1/6.webp",
                    alt: "login_personal screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto1/7.webp",
                    alt: "login_personal screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto1/8.webp",
                    alt: "login_personal screen"
                }
            ]
        },
        {
            title: { es: "WILUX TV", en: "WILUX TV" },
            file: "proyecto-02.sh",
            description: {
                es: "*Wilux TV* es una aplicación multiplataforma desarrollada en *Flutter* que permite a los usuarios acceder a contenido de televisión en vivo y bajo demanda, con funciones de búsqueda, filtrado y control parental. La aplicación se integra con servicios API de proveedor con licencias legitimas brindada al ISP wilux y utiliza *Firebase* para la gestión de usuarios y almacenamiento de datos.",
                en: "*Wilux TV* is a cross-platform application built with *Flutter* that gives users access to live and on-demand TV, with search, filtering, and parental controls. It connects to licensed provider APIs for Wilux ISP and uses *Firebase* for user management and data storage."
            },
            badges: {
                es: ["Flutter", "API", "Firebase", "Kotlin"],
                en: ["Flutter", "API", "Firebase", "Kotlin"]
            },
            gallery: [
                {
                    type: "image",
                    src: "assets/img/projects/proyecto2/1.webp",
                    alt: "splash screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto2/2.webp",
                    alt: "login screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto2/3.webp",
                    alt: "canales screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto2/4.webp",
                    alt: "reproduccion screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto2/5.webp",
                    alt: "buscador"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto2/6.webp",
                    alt: "filtro"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto2/7.webp",
                    alt: "control parental"
                }
            ]
        },
        {
            title: { es: "TUPSICO", en: "TUPSICO" },
            file: "proyecto-03.sh",
            description: {
                es: "*Tupsico* es una aplicación multiplataforma desarrollada en *Flutter* que permite a los psicólogos gestionar pacientes, evaluaciones y resultados de manera eficiente. La aplicación se integra con *Firebase* para la autenticación de usuarios, almacenamiento de datos y notificaciones push, brindando una experiencia segura y confiable para profesionales de la salud mental.",
                en: "*Tupsico* is a cross-platform application built with *Flutter* that helps psychologists efficiently manage patients, assessments, and results. It integrates with *Firebase* for authentication, data storage, and push notifications, providing a secure and reliable experience for mental health professionals."
            },
            badges: { es: ["Flutter", "Firebase"], en: ["Flutter", "Firebase"] },
            gallery: [
                {
                    type: "image",
                    src: "assets/img/projects/proyecto3/1.webp",
                    alt: "splash screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto3/2.webp",
                    alt: "login_psicologo screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto3/3.webp",
                    alt: "administracion screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto3/4.webp",
                    alt: "gestionar pacientes screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto3/5.webp",
                    alt: "gestionar pacientes screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto3/6.webp",
                    alt: "gestionar pacientes screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto3/7.webp",
                    alt: "panel de evaluaciones screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto3/8.webp",
                    alt: "login_paciente screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto3/9.webp",
                    alt: "panel de evaluaciones screen"
                }
            ]
        },
        {
            title: { es: "WILUX", en: "WILUX" },
            file: "proyecto-04.sh",
            description: {
                es: "*Wilux* es una aplicación multiplataforma desarrollada en *Flutter* que permite a los técnicos de campo gestionar órdenes de trabajo ademas de poder ubicarse con mapa interactivo y ubicar cajas NAP para instalaciones. Ademas permite realizar encuestas de manera eficiente para los volanteros y vendedores de campo. La aplicación se integra con *Firebase* para la autenticación de usuarios, almacenamiento de datos y notificaciones push, brindando una experiencia segura y confiable para los profesionales de servicios técnicos, area de ventas y trabajadores de campo.",
                en: "*Wilux* is a cross-platform application built with *Flutter* that helps field technicians manage work orders, navigate an interactive map, and locate NAP boxes for installations. It also supports efficient surveys for field promoters and sales teams. The application integrates with *Firebase* for authentication, data storage, and push notifications, serving technical support, sales, and field teams."
            },
            badges: {
                es: ["Flutter", "REST API", "Firebase"],
                en: ["Flutter", "REST API", "Firebase"]
            },
            gallery: [
                {
                    type: "image",
                    src: "assets/img/projects/proyecto4/1.webp",
                    alt: "splash screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto4/1_1.webp",
                    alt: "login screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto4/2.webp",
                    alt: "ordenes screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto4/3.webp",
                    alt: "clientes screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto4/4.webp",
                    alt: "naps screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto4/5.webp",
                    alt: "naps screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto4/6.webp",
                    alt: "naps screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto4/7.webp",
                    alt: "encuestas screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto4/8.webp",
                    alt: "dashboard screen"
                }
            ]
        },
        {
            title: { es: "FISIO LIBRE", en: "FISIO LIBRE" },
            file: "proyecto-05.sh",
            description: {
                es: "*Fisio Libre* es un sitio web desarrollada con *HTML*, *CSS* y *JavaScript* que permite a los usuarios acceder a información sobre fisioterapia, incluyendo artículos, libros y recursos educativos. La web ofrece una interfaz intuitiva y responsiva, brindando una experiencia de usuario agradable y accesible desde cualquier dispositivo.",
                en: "*Fisio Libre* is a website built with *HTML*, *CSS*, and *JavaScript* that provides access to physiotherapy information, including articles, books, and educational resources. Its intuitive, responsive interface offers an accessible experience on any device."
            },
            badges: {
                es: ["HTML", "CSS", "JavaScript"],
                en: ["HTML", "CSS", "JavaScript"]
            },
            gallery: [
                {
                    type: "image",
                    src: "assets/img/projects/proyecto5/1.webp",
                    alt: "home screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto5/2.webp",
                    alt: "home screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto5/3.webp",
                    alt: "home screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto5/4.webp",
                    alt: "home screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto5/5.webp",
                    alt: "contact screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto5/6.webp",
                    alt: "help screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto5/7.webp",
                    alt: "ley screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto5/8.webp",
                    alt: "books screen"
                },
                {
                    type: "image",
                    src: "assets/img/projects/proyecto5/9.webp",
                    alt: "pdf screen"
                }
            ]
        }
    ];

    let currentProject = null;
    let currentSlide = 0;
    let touchStartX = 0;
    let savedScrollY = 0;

    const gallery = modal.querySelector(".project-modal__gallery");
    const counter = modal.querySelector(".project-modal__counter");
    const title = modal.querySelector(".project-modal__title");
    const description = modal.querySelector(".project-modal__description");
    const badges = modal.querySelector(".project-modal__badges");
    const links = modal.querySelector(".project-modal__links");
    const terminalTitle = modal.querySelector(".project-modal__terminal-title");

    const closeButton = modal.querySelector(".project-modal__close");
    const previousButton = modal.querySelector(".project-modal__previous");
    const nextButton = modal.querySelector(".project-modal__next");

    function localized(value) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            return value[document.documentElement.lang] || value.es;
        }

        return value;
    }

    function updateProjectText() {
        title.textContent = localized(currentProject.title);
        description.textContent = localized(currentProject.description);
        badges.innerHTML = localized(currentProject.badges)
            .map((badge) => `<span>${badge}</span>`)
            .join("");

        const websiteLink = links.querySelector("[data-project-website]");
        if (websiteLink && currentProject.website) {
            websiteLink.textContent = localized(currentProject.website.text);
        }
    }

    window.addEventListener("languagechange", () => {
        if (!currentProject) {
            return;
        }

        updateProjectText();
    });

    cards.forEach((card, index) => {
        card.addEventListener("click", (event) => {
            const externalLink = event.target.closest(".project-card__links a");

            if (externalLink) {
                return;
            }

            event.preventDefault();

            openProject(index);
        });
    });

    function openProject(index) {
        currentProject = projects[index];

        if (!currentProject) {
            return;
        }

        currentSlide = 0;

        updateProjectText();
        terminalTitle.textContent = currentProject.file;

        const sourceCard = cards[index];
        const projectLinks = sourceCard.querySelectorAll(
            ".project-card__links a"
        );

        links.innerHTML = "";

        projectLinks.forEach((link) => {
            const clone = link.cloneNode(true);

            clone.addEventListener("click", (event) => {
                event.stopPropagation();
            });

            links.appendChild(clone);
        });

        if (currentProject.website) {
            const websiteLink = document.createElement("a");

            websiteLink.href = currentProject.website.url;
            websiteLink.textContent = localized(currentProject.website.text);
            websiteLink.dataset.projectWebsite = "true";
            websiteLink.target = "_blank";
            websiteLink.rel = "noopener noreferrer";

            websiteLink.addEventListener("click", (event) => {
                event.stopPropagation();
            });

            links.appendChild(websiteLink);
        }

        renderSlide();

        savedScrollY = window.scrollY;

        document.body.style.position = "fixed";
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";

        if (
            window.portfolioLenis &&
            typeof window.portfolioLenis.stop === "function"
        ) {
            window.portfolioLenis.stop();
        }

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        closeButton.focus();
    }

    function closeProject() {
        pauseCurrentVideo();

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";

        window.scrollTo(0, savedScrollY);

        if (
            window.portfolioLenis &&
            typeof window.portfolioLenis.start === "function"
        ) {
            window.portfolioLenis.start();
        }
    }

    function renderSlide() {
        if (!currentProject) {
            return;
        }

        pauseCurrentVideo();

        const slides = currentProject.gallery;

        gallery.innerHTML = "";

        const slide = slides[currentSlide];

        if (!slide) {
            return;
        }

        if (slide.type === "video") {
            const video = document.createElement("video");

            video.src = slide.src;
            video.controls = true;
            video.playsInline = true;
            video.preload = "metadata";
            video.className = "project-modal__media";

            if (slide.poster) {
                video.poster = slide.poster;
            }

            gallery.appendChild(video);
        } else {
            const image = document.createElement("img");

            image.loading = "eager";
            image.decoding = "async";
            image.src = slide.src;
            image.alt = slide.alt || localized(currentProject.title);
            image.className = "project-modal__media";

            gallery.appendChild(image);
        }

        counter.textContent = `${currentSlide + 1} / ${slides.length}`;

        previousButton.disabled = slides.length <= 1;
        nextButton.disabled = slides.length <= 1;
    }

    function pauseCurrentVideo() {
        const video = gallery.querySelector("video");

        if (video) {
            video.pause();
        }
    }

    function nextSlide() {
        if (!currentProject || currentProject.gallery.length <= 1) {
            return;
        }

        currentSlide =
            (currentSlide + 1) % currentProject.gallery.length;

        renderSlide();
    }

    function previousSlide() {
        if (!currentProject || currentProject.gallery.length <= 1) {
            return;
        }

        currentSlide =
            (currentSlide - 1 + currentProject.gallery.length) %
            currentProject.gallery.length;

        renderSlide();
    }

    closeButton.addEventListener("click", closeProject);

    previousButton.addEventListener("click", previousSlide);

    nextButton.addEventListener("click", nextSlide);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeProject();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!modal.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            closeProject();
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            previousSlide();
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            nextSlide();
        }
    });

    gallery.addEventListener(
        "touchstart",
        (event) => {
            touchStartX = event.changedTouches[0].screenX;
        },
        { passive: true }
    );

    gallery.addEventListener(
        "touchend",
        (event) => {
            const touchEndX = event.changedTouches[0].screenX;
            const difference = touchStartX - touchEndX;

            if (Math.abs(difference) < 50) {
                return;
            }

            if (difference > 0) {
                nextSlide();
            } else {
                previousSlide();
            }
        },
        { passive: true }
    );
}

function createProjectModal() {
    const modal = document.createElement("div");

    modal.className = "project-modal";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
        <div
            class="project-modal__window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
        >
            <header class="terminal-header project-modal__header">
                <div class="terminal-header__dots" aria-hidden="true">
                    <span class="terminal-header__dot terminal-header__dot--red"></span>
                    <span class="terminal-header__dot terminal-header__dot--amber"></span>
                    <span class="terminal-header__dot terminal-header__dot--cyan"></span>
                </div>

                <span class="project-modal__terminal-title">
                    <span data-i18n="modal.terminalTitle">${window.t("modal.terminalTitle")}</span>
                </span>

                <button
                    class="project-modal__close"
                    type="button"
                    aria-label="${window.t("modal.close") }"
                    data-i18n="modal.close"
                    data-i18n-attr="aria-label"
                >
                    ×
                </button>
            </header>

            <div class="project-modal__body">

                <div class="project-modal__viewer">

                    <button
                        class="project-modal__arrow project-modal__previous"
                        type="button"
                        aria-label="${window.t("modal.previous") }"
                        data-i18n="modal.previous"
                        data-i18n-attr="aria-label"
                    >
                        ‹
                    </button>

                    <div class="project-modal__gallery"></div>

                    <button
                        class="project-modal__arrow project-modal__next"
                        type="button"
                        aria-label="${window.t("modal.next") }"
                        data-i18n="modal.next"
                        data-i18n-attr="aria-label"
                    >
                        ›
                    </button>

                    <span class="project-modal__counter">
                        1 / 1
                    </span>

                </div>

                <div class="project-modal__info">

                    <h2
                        id="project-modal-title"
                        class="project-modal__title"
                    ></h2>

                    <p class="project-modal__description"></p>

                    <div class="project-modal__badges"></div>

                    <div class="project-modal__links"></div>

                </div>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    return modal;
}