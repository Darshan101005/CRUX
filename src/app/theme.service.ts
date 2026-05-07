import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal(true);

  constructor() {
    let savedTheme = 'dark';
    try {
      if (typeof localStorage !== 'undefined') {
        savedTheme = localStorage.getItem('theme') || 'dark';
      }
    } catch(e) {}

    if (savedTheme === 'light') {
      this.isDarkMode.set(false);
    } else {
      this.isDarkMode.set(true);
    }

    effect(() => {
      const isDark = this.isDarkMode();
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
        if (typeof document !== 'undefined') {
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch(e) {}
    });
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }
}
