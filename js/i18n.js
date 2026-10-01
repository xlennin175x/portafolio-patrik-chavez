"use strict";

(function () {
    const storageKey = "portfolio-language";
    let currentLanguage = "es";
    let initialized = false;

    function getTranslation(key) {
        const language = window.portfolioTranslations?.[currentLanguage];
        return language?.[key] ?? window.portfolioTranslations?.es?.[key] ?? key;
    }

    function updateElement(element) {
        const value = getTranslation(element.dataset.i18n);
        const attribute = element.dataset.i18nAttr;

        if (attribute) {
            element.setAttribute(attribute, value);
            return;
        }

        const textNode = Array.from(element.childNodes).find(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
        );

        if (textNode) {
            const leadingSpace = /^\s*/.exec(textNode.textContent)?.[0] ?? "";
            const trailingSpace = /\s*$/.exec(textNode.textContent)?.[0] ?? "";
            textNode.textContent = `${leadingSpace}${value}${trailingSpace}`;
        } else {
            element.textContent = value;
        }
    }

    function updateLanguageControls() {
        document.querySelectorAll("[data-language]").forEach((button) => {
            const isActive = button.dataset.language === currentLanguage;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function setLanguage(language, persist = true) {
        if (!window.portfolioTranslations?.[language]) {
            language = "es";
        }

        currentLanguage = language;
        document.documentElement.lang = language;
        document.querySelectorAll("[data-i18n]").forEach(updateElement);
        updateLanguageControls();

        if (persist) {
            try {
                localStorage.setItem(storageKey, language);
            } catch (error) {
                // Language switching remains available when storage is blocked.
            }
        }

        window.dispatchEvent(new CustomEvent("languagechange", {
            detail: { language }
        }));
    }

    function initI18n() {
        if (initialized) {
            return;
        }

        initialized = true;

        let savedLanguage = "es";
        try {
            savedLanguage = localStorage.getItem(storageKey) || "es";
        } catch (error) {
            savedLanguage = "es";
        }

        setLanguage(savedLanguage, false);

        document.querySelectorAll("[data-language]").forEach((button) => {
            button.addEventListener("click", () => {
                setLanguage(button.dataset.language);
            });
        });
    }

    window.t = getTranslation;
    window.setPortfolioLanguage = setLanguage;
    window.initI18n = initI18n;
    initI18n();
})();