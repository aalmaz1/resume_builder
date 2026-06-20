import { ThemeSwitcher, ThemeType } from './resume-themes';
import { renderResume } from './resume-builder';
import { printResume } from './print-utils';
import { fetchGitHubResumeData } from './github-provider';
import { ResumeData } from './types';

// Default mock data for initial load
const defaultData: ResumeData = {
  personal: {
    name: "John Doe",
    title: "Senior Full Stack Architect",
    email: "john.doe@example.com",
    phone: "+1 (555) 000-0000",
    location: "Seoul, South Korea",
    github: "github.com/johndoe"
  },
  education: [
    {
      institution: "Kongju National University",
      role: "B.S. Computer Science",
      period: "2016 - 2020",
      description: ["GPA: 4.0/4.0", "Focus: Web Programming & Pretext Layouts"]
    }
  ],
  experience: [
    {
      institution: "Tech Solutions Inc.",
      role: "Lead Developer",
      period: "2021 - Present",
      description: ["Modernizing legacy layout engines", "Implementing type-safe rendering pipelines"]
    }
  ],
  skills: ["TypeScript", "Rust", "Modern CSS", "Pretext Layouts", "Vite", "Architecture Design"]
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('resume-container') as HTMLElement;
  const themeSwitcher = new ThemeSwitcher();

  // Initial render
  renderResume(defaultData, container);

  // Wire Theme Switcher
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme') as ThemeType;
      themeSwitcher.switchTheme(theme);
    });
  });

  // Wire GitHub Import
  const importBtn = document.getElementById('import-github');
  const githubInput = document.getElementById('github-url') as HTMLInputElement;
  
  importBtn?.addEventListener('click', async () => {
    const url = githubInput.value.trim();
    if (!url) return alert('Please enter GitHub URL or Username');
    
    try {
      importBtn.textContent = 'Loading...';
      const data = await fetchGitHubResumeData(url);
      renderResume(data, container);
      importBtn.textContent = 'Import from GitHub';
    } catch (e) {
      alert('Failed to fetch data');
      importBtn.textContent = 'Import from GitHub';
    }
  });

  // Wire Export PDF
  const printBtn = document.getElementById('export-pdf');
  printBtn?.addEventListener('click', () => {
    printResume();
  });
});
