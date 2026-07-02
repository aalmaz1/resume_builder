/**
 * Theme Service - manages UI theme state (light/dark)
 */

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'resume-theme';

export class ThemeService {
  private currentTheme: Theme = 'light';

  constructor() {
    this.currentTheme = this.loadSavedTheme();
  }

  public getTheme(): Theme {
    return this.currentTheme;
  }

  public toggleTheme(): Theme {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    return this.currentTheme;
  }

  public setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  private loadSavedTheme(): Theme {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  }
}
