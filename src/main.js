"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const resume_builder_1 = require("./resume-builder");
const print_utils_1 = require("./print-utils");
const github_provider_1 = require("./github-provider");
let currentResumeData = null;
let currentTextAlign = 'left';
const defaultData = {
    personal: {
        name: "Almaz Developer",
        title: "Full Stack Software Engineer",
        email: "almaz@knu.ac.kr",
        phone: "+82 10-1234-5678",
        location: "Gongju, South Korea",
        github: "github.com/almaz"
    },
    education: [
        {
            institution: "Kongju National University",
            role: "B.S. Computer Science",
            period: "2020 - 2024",
            description: ["GPA: 4.2/4.5", "Focus on Web Architecture and UI/UX Design"]
        }
    ],
    experience: [
        {
            institution: "Web Engineering Lab",
            role: "Research Intern",
            period: "2023 - Present",
            description: ["Implementing Pretext-based layout algorithms", "Optimizing GitHub API data processing"]
        }
    ],
    skills: [
        "TypeScript", "React", "Node.js",
        { category: "Frameworks", items: ["Vite", "Tailwind", "Express"] }
    ]
};
/**
 * Centralized UI update function
 */
function updateUI(data, container) {
    currentResumeData = data;
    (0, resume_builder_1.renderResume)(data, container);
    applyTextAlign(container, currentTextAlign);
}
/**
 * Apply text alignment to resume content
 */
function applyTextAlign(container, align) {
    currentTextAlign = align;
    // Header stays centered always
    const header = container.querySelector('.resume-header');
    if (header) {
        header.style.textAlign = 'center';
    }
    // Apply alignment to all other blocks
    container.querySelectorAll('.section-block').forEach(el => {
        const element = el;
        element.style.textAlign = align;
        // Special handling for entity headers with flex layout
        const headerLine = element.querySelector('.layout-line');
        if (headerLine) {
            const hl = headerLine;
            if (align === 'center') {
                hl.style.justifyContent = 'center';
            }
            else if (align === 'left') {
                hl.style.justifyContent = 'space-between';
            }
            else if (align === 'justify') {
                hl.style.justifyContent = 'space-between';
            }
        }
        // Управление маркерами списка: точки только при выравнивании по левому краю
        const lists = element.querySelectorAll('ul');
        lists.forEach(ul => {
            if (align === 'left') {
                ul.style.listStyleType = 'disc'; // Возвращаем точки
                ul.style.paddingLeft = '20px';
            }
            else {
                ul.style.listStyleType = 'none'; // Убираем точки
                ul.style.paddingLeft = '0';
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    var _a, _b;
    const container = document.getElementById('resume-container');
    const loader = document.getElementById('loader');
    const loadingOverlay = document.getElementById('loading-overlay');
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!container)
        return;
    // Initial render
    updateUI(defaultData, container);
    // Theme Toggle (Light/Dark)
    let isDarkTheme = false;
    themeToggleBtn === null || themeToggleBtn === void 0 ? void 0 : themeToggleBtn.addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('theme-dark', isDarkTheme);
        document.body.classList.toggle('theme-classic', !isDarkTheme);
        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDarkTheme ? '☀️ Светлая' : '🌙 Темная';
        }
    });
    // Text Alignment Buttons
    document.querySelectorAll('.align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const align = btn.getAttribute('data-align');
            if (align && container) {
                applyTextAlign(container, align);
                // Update active button state
                document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });
    // GitHub Import with Loader
    const importBtn = document.getElementById('import-github');
    const githubInput = document.getElementById('github-url');
    importBtn === null || importBtn === void 0 ? void 0 : importBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        const input = githubInput.value.trim();
        if (!input) {
            alert('Please enter a username');
            return;
        }
        try {
            if (loader)
                loader.style.display = 'block';
            if (loadingOverlay)
                loadingOverlay.classList.remove('hidden');
            importBtn.setAttribute('disabled', 'true');
            const data = yield (0, github_provider_1.fetchGitHubResumeData)(input);
            updateUI(data, container);
        }
        catch (e) {
            alert('GitHub User not found or API limit reached');
        }
        finally {
            if (loader)
                loader.style.display = 'none';
            if (loadingOverlay)
                loadingOverlay.classList.add('hidden');
            importBtn.removeAttribute('disabled');
        }
    }));
    // JSON Export
    (_a = document.getElementById('save-json')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        if (!currentResumeData)
            return;
        const blob = new Blob([JSON.stringify(currentResumeData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-${currentResumeData.personal.name.replace(/\s+/g, '-').toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
    // PDF Export
    (_b = document.getElementById('export-pdf')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', print_utils_1.printResume);
});
