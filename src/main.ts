import { ResumeData } from './types';
import { renderResume } from './resume-builder';
import { printResume } from './print-utils';
import { fetchGitHubResumeData } from './github-provider';
import { generateDemoProfile } from './demo-profile';
import { translations, Lang, defaultLang } from './translations';

let currentResumeData: ResumeData | null = null;
let currentTextAlign: 'left' | 'center' | 'justify' = 'left';
let currentLang: Lang = defaultLang;

const defaultData: ResumeData = generateDemoProfile();

/**
 * Update all UI text based on current language
 */
function updateInterfaceLanguage(lang: Lang): void {
  currentLang = lang;
  const t = translations[lang];
  
  // Update elements by ID
  const updateText = (id: string, text: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  
  updateText('app-title', t.appTitle);
  updateText('lang-label', t.languageLabel);
  updateText('export-pdf', t.exportBtn);
  updateText('save-json', t.saveJsonBtn);
  
  // Update placeholder specifically
  const githubInput = document.getElementById('github-url') as HTMLInputElement;
  if (githubInput) githubInput.placeholder = t.githubPlaceholder;
  
  // Update labels with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && t[key as keyof typeof t]) {
      el.textContent = t[key as keyof typeof t] as string;
    }
  });
  
  // Update theme toggle button
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggleBtn.textContent = isDark ? t.themeDark : t.themeLight;
  }
  
  // Save to localStorage
  localStorage.setItem('resume-lang', lang);
}

/**
 * Centralized UI update function
 */
function updateUI(data: ResumeData, container: HTMLElement): void {
  currentResumeData = data;
  renderResume(data, container);
  applyTextAlign(container, currentTextAlign);
}

/**
 * Apply text alignment to resume content
 */
function applyTextAlign(container: HTMLElement, align: 'left' | 'center' | 'justify'): void {
  currentTextAlign = align;
  
  // Header stays centered always
  const header = container.querySelector('.resume-header');
  if (header) {
    (header as HTMLElement).style.textAlign = 'center';
  }
  
  // Apply alignment to all other blocks
  container.querySelectorAll('.section-block').forEach(el => {
    const element = el as HTMLElement;
    element.style.textAlign = align;
    
    // Special handling for entity headers with flex layout
    const headerLine = element.querySelector('.layout-line');
    if (headerLine) {
      const hl = headerLine as HTMLElement;
      if (align === 'center') {
        hl.style.justifyContent = 'center';
      } else if (align === 'left') {
        hl.style.justifyContent = 'space-between';
      } else if (align === 'justify') {
        hl.style.justifyContent = 'space-between';
      }
    }
    
    // Управление маркерами списка: точки только при выравнивании по левому краю
    const lists = element.querySelectorAll('ul');
    lists.forEach(ul => {
      if (align === 'left') {
        ul.style.listStyleType = 'disc'; // Возвращаем точки
        ul.style.paddingLeft = '20px';
      } else {
        ul.style.listStyleType = 'none'; // Убираем точки
        ul.style.paddingLeft = '0';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('resume-container');
  const loader = document.getElementById('loader');
  const loadingOverlay = document.getElementById('loading-overlay');
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!container) return;
  
  // Load saved language or default
  const savedLang = localStorage.getItem('resume-lang') as Lang | null;
  if (savedLang && ['en', 'ru', 'ko'].includes(savedLang)) {
    currentLang = savedLang;
  }
  
  // Initial render
  updateUI(defaultData, container);
  updateInterfaceLanguage(currentLang);
  
  // Language Selector
  const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => {
      const newLang = (e.target as HTMLSelectElement).value as Lang;
      updateInterfaceLanguage(newLang);
    });
  }

  // Theme Toggle (Light/Dark for UI only)
  let isDarkTheme = false;
  themeToggleBtn?.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    // Update button text based on current language
    const t = translations[currentLang];
    if (themeToggleBtn) {
      themeToggleBtn.textContent = isDarkTheme ? t.themeDark : t.themeLight;
    }
  });

  // Design Buttons (Classic, Modern, Minimal)
  document.querySelectorAll('.design-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const design = btn.getAttribute('data-design');
      if (design) {
        // Remove all theme classes
        document.body.classList.remove('theme-classic', 'theme-modern', 'theme-minimal');
        // Add selected theme class
        document.body.classList.add(`theme-${design}`);
        
        // Update active button state
        document.querySelectorAll('.design-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Text Alignment Buttons
  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const align = btn.getAttribute('data-align') as 'left' | 'center' | 'justify';
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
  const githubInput = document.getElementById('github-url') as HTMLInputElement;

  importBtn?.addEventListener('click', async () => {
    const input = githubInput.value.trim();
    if (!input) {
      alert('Please enter a username');
      return;
    }
    
    try {
      if (loader) loader.style.display = 'block';
      if (loadingOverlay) loadingOverlay.classList.remove('hidden');
      importBtn.setAttribute('disabled', 'true');
      
      const data = await fetchGitHubResumeData(input);
      updateUI(data, container);
      
    } catch (e) {
      alert('GitHub User not found or API limit reached');
    } finally {
      if (loader) loader.style.display = 'none';
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
      importBtn.removeAttribute('disabled');
    }
  });

  // JSON Export
  document.getElementById('save-json')?.addEventListener('click', () => {
    if (!currentResumeData) return;
    const blob = new Blob([JSON.stringify(currentResumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${currentResumeData.personal.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // PDF Export
  document.getElementById('export-pdf')?.addEventListener('click', printResume);
});
