export type ThemeType = 'classic' | 'modern' | 'minimal';

export class ThemeSwitcher {
  private readonly STORAGE_KEY = 'resume_theme';

  constructor() {
    this.applyTheme(this.getSavedTheme());
  }

  public switchTheme(theme: ThemeType): void {
    this.applyTheme(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  private applyTheme(theme: ThemeType): void {
    document.body.classList.remove('theme-classic', 'theme-modern', 'theme-minimal');
    document.body.classList.add(`theme-${theme}`);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  }

  private getSavedTheme(): ThemeType {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return (saved === 'modern' || saved === 'minimal' || saved === 'classic') ? saved : 'classic';
  }
}
