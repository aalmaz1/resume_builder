"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeSwitcher = void 0;
class ThemeSwitcher {
    constructor() {
        this.STORAGE_KEY = 'resume_theme';
        this.applyTheme(this.getSavedTheme());
    }
    switchTheme(theme) {
        this.applyTheme(theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
    }
    applyTheme(theme) {
        document.body.classList.remove('theme-classic', 'theme-modern', 'theme-minimal');
        document.body.classList.add(`theme-${theme}`);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
    }
    getSavedTheme() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return (saved === 'modern' || saved === 'minimal' || saved === 'classic') ? saved : 'classic';
    }
}
exports.ThemeSwitcher = ThemeSwitcher;
