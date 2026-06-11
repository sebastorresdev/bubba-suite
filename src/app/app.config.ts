import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // 👈
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from './mypreset';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    MessageService,
    provideHttpClient(
      withInterceptors([
        authInterceptor,   // ← añade token
        errorInterceptor   // ← maneja errores globales
      ])
    ),
    provideAnimationsAsync(), // 👈
    providePrimeNG({
      ripple: true,
      translation: {
        accept: 'Aceptar',
        reject: 'Rechazar',
      },
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
  ],
};
