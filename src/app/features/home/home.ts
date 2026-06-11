import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardModule, ButtonModule],
  templateUrl: './home.html'
})
export class Home {
  private router = inject(Router);

  irAUsuarios() {
    // Te manda directo al CRUD que descomentaste en las rutas
    this.router.navigate(['/usuarios']);
  }

  logout() {
    // Limpia el token y te regresa al login para verificar todo el flujo
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
