import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // 🎯 Una señal para almacenar el estado actual (true = oscuro, false = claro)
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Al iniciar, verificamos si el usuario ya tenía una preferencia guardada
    const savedTheme = localStorage.getItem('skvia_theme');

    if (savedTheme === 'dark') {
      this.setDarkMode(true);
    }
  }

  // 🔄 Cambia entre modo claro y oscuro
  toggleTheme(): void {
    this.setDarkMode(!this.isDarkMode());
  }

  // 🛠️ Aplica la clase necesaria en el HTML de acuerdo a PrimeNG 21
  private setDarkMode(dark: boolean): void {
    this.isDarkMode.set(dark);
    const element = document.documentElement;

    if (dark) {
      element.classList.add('dark'); // La clase configurada en app.config.ts
      localStorage.setItem('skvia_theme', 'dark');
    } else {
      element.classList.remove('dark');
      localStorage.setItem('skvia_theme', 'light');
    }
  }
}
