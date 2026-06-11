import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // ✅ Signal — reactivo
  token = signal<string | null>(localStorage.getItem('token'));
  isAuthenticated = computed(() => !!this.token());

  login(nombreUsuario: string, password: string) {
    return this.http.post<{ token: string }>(
      `${environment.apiUrl}/auth/login`,
      { nombreUsuario, password }
    ).pipe(
      tap(response => {
        this.token.set(response.token);
        localStorage.setItem('token', response.token);
      })
    );
  }

  logout() {
    this.token.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
