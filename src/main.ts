import { ThemeSwitcher, ThemeType } from './resume-themes';
import { renderResume } from './resume-builder';
import { printResume } from './print-utils';
import { fetchGitHubResumeData } from './github-provider';
import { ResumeData } from './types';

let currentResumeData: ResumeData | null = null;
let currentTextAlign: 'left' | 'center' | 'right' | 'justify' = 'left';

const defaultData: ResumeData = {
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
function updateUI(data: ResumeData, container: HTMLElement): void {
  currentResumeData = data;
  renderResume(data, container);
  applyTextAlign(container, currentTextAlign);
}

/**
 * Apply text alignment to resume content
 */
function applyTextAlign(container: HTMLElement, align: 'left' | 'center' | 'right' | 'justify'): void {
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
      } else if (align === 'right') {
        hl.style.justifyContent = 'flex-end';
      } else if (align === 'left') {
        hl.style.justifyContent = 'space-between';
      } else if (align === 'justify') {
        hl.style.justifyContent = 'space-between';
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('resume-container');
  const loader = document.getElementById('loader');
  const loadingOverlay = document.getElementById('loading-overlay');
  if (!container) return;

  const themeSwitcher = new ThemeSwitcher();
  
  // Initial render
  updateUI(defaultData, container);

  // Theme Switching
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme') as ThemeType;
      if (theme) {
        themeSwitcher.switchTheme(theme);
        // Update active button state
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Text Alignment Buttons
  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const align = btn.getAttribute('data-align') as 'left' | 'center' | 'right' | 'justify';
      if (align && container) {
        applyTextAlign(container, align);
        // Update active button state
        document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Set initial alignment button state
  const initialAlignBtn = document.querySelector('.align-btn[data-align="left"]');
  if (initialAlignBtn) {
    initialAlignBtn.classList.add('active');
  }

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
