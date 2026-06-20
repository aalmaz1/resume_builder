/**
 * Stateful Design Token Engine (`resume-themes.ts`)
 */
export type ThemeType = 'classic' | 'modern' | 'minimal';

export class ThemeSwitcher {
  private readonly STORAGE_KEY = 'resume_theme_preference';
  private currentTheme: ThemeType = 'classic';

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeType | null;
      if (savedTheme && ['classic', 'modern', 'minimal'].includes(savedTheme)) {
        this.applyTheme(savedTheme);
      } else {
        this.applyTheme('classic');
      }
    } catch (error) {
      console.warn('Failed to access localStorage, falling back to classic theme.', error);
      this.applyTheme('classic');
    }
  }

  public switchTheme(theme: ThemeType): void {
    this.applyTheme(theme);
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage', error);
    }
  }

  private applyTheme(theme: ThemeType): void {
    const body = document.body;
    // Remove existing theme classes
    body.classList.remove('theme-classic', 'theme-modern', 'theme-minimal');
    // Add new theme class
    body.classList.add(`theme-${theme}`);
    this.currentTheme = theme;

    // Broadcasting: Dispatch a custom browser event whenever a mutation occurs
    const event = new CustomEvent('themeChanged', { detail: { theme } });
    window.dispatchEvent(event);
  }

  public getCurrentTheme(): ThemeType {
    return this.currentTheme;
  }
}
