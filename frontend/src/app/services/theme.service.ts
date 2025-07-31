import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme: 'light' | 'dark' = 'light';

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') this.theme = 'dark';
      this.applyTheme();
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      this.applyTheme();
    }
  }

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  private applyTheme() {
    if (typeof document !== 'undefined') {
      if (this.theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  }
}
