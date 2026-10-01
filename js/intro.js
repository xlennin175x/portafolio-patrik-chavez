"use strict";

const CONFIG = {
    particles: {
        desktop: 80,
        mobile: 35,
        connectionDistance: 150,
        mouseDistance: 180,
        speed: 0.35,
        maxPixelRatio: 2
    },
    terminal: {
        typingSpeed: 40,
        lineDelay: 180
    },
    transition: {
        duration: 500
    }
};

const TERMINAL_LINES = [
    { type: "normal", text: window.t("intro.system") },
    { type: "name", name: "PATRIK LENNIN CHAVEZ BALVINO" },
    { type: "role", text: window.t("intro.role") },
    { type: "value", text: window.t("intro.tagline") },
    { type: "status", text: window.t("intro.status") }
];

const state = {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    terminalComplete: false,
    terminalTyping: false,
    navigationStarted: false
};

document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    initTerminal();
    initTransition();
});

function initParticles() {
    const canvas = document.getElementById("particles-canvas");

    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
        return;
    }

    //if (state.reducedMotion) {
    //    return;
    //}

    let width = 0;
    let height = 0;
    let animationFrame = null;
    let particles = [];

    const mouse = {
        x: null,
        y: null,
        active: false
    };

    function getParticleCount() {
        return window.innerWidth <= 600 ? CONFIG.particles.mobile : CONFIG.particles.desktop;
    }

    function resizeCanvas() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, CONFIG.particles.maxPixelRatio);

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        createParticles();
    }

    function createParticles() {
        const count = getParticleCount();
        particles = [];

        for (let index = 0; index < count; index += 1) {
            const isRed = Math.random() < 0.32;

            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * CONFIG.particles.speed,
                vy: (Math.random() - 0.5) * CONFIG.particles.speed,
                radius: Math.random() * 1.6 + 1.2,
                color: isRed ? "red" : "cyan"
            });
        }
    }

    function updateParticles() {
        particles.forEach((particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x <= 0 || particle.x >= width) {
                particle.vx *= -1;
            }

            if (particle.y <= 0 || particle.y >= height) {
                particle.vy *= -1;
            }

            if (mouse.active && mouse.x !== null && mouse.y !== null) {
                const dx = particle.x - mouse.x;
                const dy = particle.y - mouse.y;
                const distanceSquared = dx * dx + dy * dy;
                const maxDistance = CONFIG.particles.mouseDistance;

                if (distanceSquared < maxDistance * maxDistance) {
                    const distance = Math.sqrt(distanceSquared) || 1;
                    const force = (maxDistance - distance) / maxDistance;
                    particle.x += (dx / distance) * force * 0.9;
                    particle.y += (dy / distance) * force * 0.9;
                }
            }
        });
    }

    function drawParticles() {
        context.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i += 1) {
            const particleA = particles[i];

            for (let j = i + 1; j < particles.length; j += 1) {
                const particleB = particles[j];
                const dx = particleA.x - particleB.x;
                const dy = particleA.y - particleB.y;
                const distanceSquared = dx * dx + dy * dy;
                const maxDistance = CONFIG.particles.connectionDistance;

                if (distanceSquared < maxDistance * maxDistance) {
                    const distance = Math.sqrt(distanceSquared) || 1;
                    const opacity = (1 - distance / maxDistance) * 0.7;
                    const isRedConnection = particleA.color === "red" || particleB.color === "red";
                    const rgb = isRedConnection ? "255, 31, 61" : "0, 229, 255";

                    context.beginPath();
                    context.moveTo(particleA.x, particleA.y);
                    context.lineTo(particleB.x, particleB.y);
                    context.strokeStyle = `rgba(${rgb}, ${opacity})`;
                    context.lineWidth = 0.8;
                    context.stroke();
                }
            }
        }

        if (mouse.active && mouse.x !== null && mouse.y !== null) {
            particles.forEach((particle) => {
                const dx = particle.x - mouse.x;
                const dy = particle.y - mouse.y;
                const distanceSquared = dx * dx + dy * dy;
                const maxDistance = CONFIG.particles.mouseDistance;

                if (distanceSquared < maxDistance * maxDistance) {
                    const distance = Math.sqrt(distanceSquared) || 1;
                    const opacity = (1 - distance / maxDistance) * 0.9;

                    context.beginPath();
                    context.moveTo(mouse.x, mouse.y);
                    context.lineTo(particle.x, particle.y);
                    context.strokeStyle = `rgba(255, 31, 61, ${opacity})`;
                    context.lineWidth = 1.1;
                    context.stroke();
                }
            });
        }

        particles.forEach((particle) => {
            const fill = particle.color === "red" ? "255, 31, 61" : "0, 229, 255";
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(${fill}, 0.9)`;
            context.shadowColor = fill === "255, 31, 61" ? "rgba(255, 31, 61, 0.5)" : "rgba(0, 229, 255, 0.55)";
            context.shadowBlur = 10;
            context.fill();
            context.shadowBlur = 0;
        });
    }

    function animate() {
        updateParticles();
        drawParticles();
        animationFrame = requestAnimationFrame(animate);
    }

    function handleMouseMove(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.active = true;
    }

    function handleMouseLeave() {
        mouse.active = false;
        mouse.x = null;
        mouse.y = null;
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("resize", resizeCanvas, { passive: true });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (animationFrame !== null) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            return;
        }

        if (animationFrame === null) {
            animate();
        }
    });

    resizeCanvas();
    animate();
}

function initTerminal() {
    const terminal = document.getElementById("terminal");
    const output = document.getElementById("terminal-output");
    const action = document.getElementById("terminal-action");

    if (!terminal || !output || !action) {
        return;
    }

    let typingCancelled = false;

    function createLineElement(line) {
        const lineEl = document.createElement("div");
        lineEl.className = "terminal__line";

        const prompt = document.createElement("span");
        prompt.className = "terminal__prompt";
        prompt.textContent = ">";
        lineEl.appendChild(prompt);

        if (line.type === "name") {
            const prefix = document.createElement("span");
            prefix.className = "terminal__text";
            prefix.textContent = `${window.t("intro.loadingProfile")} `;
            lineEl.appendChild(prefix);

            const name = document.createElement("span");
            name.className = "terminal__name";
            name.textContent = line.name;
            lineEl.appendChild(name);
            return lineEl;
        }

        if (line.type === "role") {
            const prefix = document.createElement("span");
            prefix.className = "terminal__text";
            prefix.textContent = `${window.t("intro.roleLabel")} `;
            lineEl.appendChild(prefix);

            const role = document.createElement("span");
            role.className = "terminal__role";
            role.textContent = line.text;
            lineEl.appendChild(role);
            return lineEl;
        }

        if (line.type === "status") {
            const prefix = document.createElement("span");
            prefix.className = "terminal__text";
            prefix.textContent = `${window.t("intro.statusLabel")} `;
            lineEl.appendChild(prefix);

            const status = document.createElement("span");
            status.className = "terminal__status";
            status.textContent = line.text;
            lineEl.appendChild(status);
            return lineEl;
        }

        const text = document.createElement("span");
        text.className = line.type === "value" ? "terminal__text terminal__text--dim" : "terminal__text";
        text.textContent = line.text;
        lineEl.appendChild(text);
        return lineEl;
    }

    async function typeText(element, text) {
        for (let index = 0; index <= text.length; index += 1) {
            if (typingCancelled) {
                return;
            }

            element.textContent = text.slice(0, index);
            await new Promise((resolve) => setTimeout(resolve, CONFIG.terminal.typingSpeed));
        }
    }

    async function typeLine(line, lineEl) {
        if (typingCancelled) {
            return;
        }

        if (line.type === "name") {
            const target = lineEl.querySelector(".terminal__name");
            await typeText(target, line.name);
            return;
        }

        if (line.type === "role") {
            const target = lineEl.querySelector(".terminal__role");
            await typeText(target, line.text);
            return;
        }

        if (line.type === "status") {
            const target = lineEl.querySelector(".terminal__status");
            await typeText(target, line.text);

            if (!typingCancelled && !lineEl.querySelector(".terminal__cursor")) {
                const cursor = document.createElement("span");
                cursor.className = "terminal__cursor";
                lineEl.appendChild(cursor);
            }
            return;
        }

        const target = lineEl.querySelector(".terminal__text");
        await typeText(target, line.text);
    }

    function showAction() {
        action.classList.add("terminal__action--visible");
    }

    function renderCompleteTerminal() {
        output.innerHTML = "";
        TERMINAL_LINES.forEach((line) => {
            output.appendChild(createLineElement(line));
        });

        const statusLine = output.querySelector(".terminal__status")?.parentElement;
        if (statusLine && !statusLine.querySelector(".terminal__cursor")) {
            const cursor = document.createElement("span");
            cursor.className = "terminal__cursor";
            statusLine.appendChild(cursor);
        }

        state.terminalComplete = true;
        state.terminalTyping = false;
        showAction();
    }

    async function typingLoop() {
        //if (state.reducedMotion) {
        //    renderCompleteTerminal();
        //    return;
        //}

        output.innerHTML = "";

        for (let index = 0; index < TERMINAL_LINES.length; index += 1) {
            if (typingCancelled) {
                return;
            }

            const line = TERMINAL_LINES[index];
            const lineEl = createLineElement(line);
            output.appendChild(lineEl);

            await typeLine(line, lineEl);

            if (typingCancelled) {
                return;
            }

            if (index < TERMINAL_LINES.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, CONFIG.terminal.lineDelay));
            }
        }

        if (!typingCancelled) {
            state.terminalComplete = true;
            state.terminalTyping = false;
            showAction();
        }
    }

    function completeTyping() {
        typingCancelled = true;
        renderCompleteTerminal();
    }

    function handleTerminalInteraction(event) {
        if (state.terminalComplete || event.target.closest("a")) {
            return;
        }

        completeTyping();
    }

    function handleKeyDown(event) {
        if (state.terminalComplete) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            completeTyping();
        }
    }

    terminal.addEventListener("click", handleTerminalInteraction);
    terminal.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", (event) => {
        if (!state.terminalComplete && !state.terminalTyping) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            completeTyping();
        }
    });

    state.terminalTyping = true;
    typingLoop();
}

function initTransition() {
    const navigationLinks = document.querySelectorAll("[data-navigation]");

    if (!navigationLinks.length) {
        return;
    }

    const transition = document.createElement("div");
    transition.className = "intro__transition";
    document.body.appendChild(transition);

    navigationLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const destination = link.getAttribute("href");

            if (!destination || state.navigationStarted) {
                return;
            }

            if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) {
                return;
            }

            event.preventDefault();
            initTransitionNavigation(destination, transition);
        });
    });
}

function initTransitionNavigation(destination, transition) {
    if (state.navigationStarted) {
        return;
    }

    state.navigationStarted = true;
    transition.classList.add("intro__transition--active");

    window.setTimeout(() => {
        window.location.href = destination;
    }, CONFIG.transition.duration);
}