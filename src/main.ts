import { ResumeData } from './types';
import { renderResume } from './resume-builder';
import { printResume } from './print-utils';
import { fetchGitHubResumeData } from './github-provider';
import { generateDemoProfile } from './demo-profile';
import { translations, Lang, defaultLang } from './translations';
import { ATSService } from './services/ATSService';
import { ATSResult } from './types/ats';

let currentResumeData: ResumeData | null = null;
let currentTextAlign: 'left' | 'center' | 'justify' = 'left';
let currentLang: Lang = defaultLang;
const atsService = new ATSService();

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
  if (!container) return;
  
  // Load saved theme state
  const savedTheme = localStorage.getItem('resume-theme');
  let isDarkTheme = savedTheme === 'dark';
  if (isDarkTheme) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  // Load saved language or default
  const savedLang = localStorage.getItem('resume-lang') as Lang | null;
  if (savedLang && ['en', 'ru', 'ko'].includes(savedLang)) {
    currentLang = savedLang;
  }
  
  // Initial render
  updateUI(defaultData, container);
  updateInterfaceLanguage(currentLang);
  
  // Show editable hint after a short delay
  setTimeout(() => showEditableHint(), 2000);
  
  // Theme Toggle (Light/Dark for UI only) - Floating Button
  const themeToggleFloatingBtn = document.getElementById('theme-toggle-floating');
  themeToggleFloatingBtn?.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggleFloatingBtn.textContent = '☀️';
      localStorage.setItem('resume-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggleFloatingBtn.textContent = '🌙';
      localStorage.setItem('resume-theme', 'light');
    }
  });
  
  // Set initial button icon based on saved theme
  if (themeToggleFloatingBtn) {
    themeToggleFloatingBtn.textContent = isDarkTheme ? '☀️' : '🌙';
  }

  // Language Selector
  const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => {
      const newLang = (e.target as HTMLSelectElement).value as Lang;
      updateInterfaceLanguage(newLang);
    });
  }

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

  // GitHub Import with Loader and Validation
  const importBtn = document.getElementById('import-github');
  const githubInput = document.getElementById('github-url') as HTMLInputElement;

  importBtn?.addEventListener('click', async () => {
    const input = githubInput.value.trim();
    
    // Просто проверяем, что поле не пустое - валидация формата теперь в extractUsername
    if (!input) {
      showNotification(currentLang === 'ru' ? translations.ru.invalidUsername : 
                       currentLang === 'ko' ? translations.ko.invalidUsername : 
                       translations.en.invalidUsername, 'error');
      return;
    }
    
    try {
      if (loader) loader.style.display = 'block';
      if (loadingOverlay) loadingOverlay.classList.remove('hidden');
      importBtn.setAttribute('disabled', 'true');
      
      const data = await fetchGitHubResumeData(input);
      updateUI(data, container);
      showNotification('✅ Profile loaded successfully!', 'success');
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      // Показываем более точное сообщение об ошибке
      if (errorMessage.includes('Invalid username') || errorMessage.includes('User not found')) {
        showNotification(
          currentLang === 'ru' ? '❌ Пользователь не найден или неверный формат' : 
          currentLang === 'ko' ? '❌ 사용자를 찾을 수 없거나 잘못된 형식' : 
          '❌ User not found or invalid format', 
          'error'
        );
      } else {
        showNotification(
          currentLang === 'ru' ? '❌ Пользователь не найден или лимит API' : 
          currentLang === 'ko' ? '❌ 사용자를 찾을 수 없거나 API 제한' : 
          '❌ GitHub User not found or API limit reached', 
          'error'
        );
      }
    } finally {
      if (loader) loader.style.display = 'none';
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
      importBtn.removeAttribute('disabled');
    }
  });

  // JSON Export with notification
  document.getElementById('save-json')?.addEventListener('click', () => {
    if (!currentResumeData) return;
    const blob = new Blob([JSON.stringify(currentResumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${currentResumeData.personal.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(
      currentLang === 'ru' ? translations.ru.jsonSaved : 
      currentLang === 'ko' ? translations.ko.jsonSaved : 
      translations.en.jsonSaved, 
      'success'
    );
  });

  // PDF Export with notification
  document.getElementById('export-pdf')?.addEventListener('click', async () => {
    await printResume();
    showNotification(
      currentLang === 'ru' ? translations.ru.exportSuccess : 
      currentLang === 'ko' ? translations.ko.exportSuccess : 
      translations.en.exportSuccess, 
      'success'
    );
  });

  // ATS Check Button
  document.getElementById('ats-check')?.addEventListener('click', () => {
    if (!currentResumeData) return;
    
    const result = atsService.analyze(currentResumeData);
    showATSModal(result);
  });
});

/**
 * Show a toast notification
 */
function showNotification(message: string, type: 'success' | 'error' = 'success'): void {
  // Remove existing notification if any
  const existing = document.getElementById('toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    font-size: 14px;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Show editable hint notification
 */
function showEditableHint(): void {
  const hintEl = document.getElementById('editable-hint');
  if (!hintEl) return;
  
  const messages: Record<string, string> = {
    en: '💡 Tip: Click any text in the resume to edit it directly!',
    ru: '💡 Совет: Нажмите на любой текст в резюме, чтобы отредактировать его!',
    ko: '💡 팁: 이력서의 텍스트를 클릭하여 직접 편집할 수 있습니다!'
  };
  
  const lang = currentLang || 'en';
  hintEl.textContent = messages[lang] || messages.en;
  hintEl.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 9999;
    font-size: 13px;
    animation: fadeInDown 0.5s ease-out;
    white-space: nowrap;
  `;
  
  // Hide after 5 seconds
  setTimeout(() => {
    hintEl.style.opacity = '0';
    hintEl.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      hintEl.textContent = '';
    }, 500);
  }, 5000);
}
