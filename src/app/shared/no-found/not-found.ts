import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './not-found.html'
})
export class NotFound {
  private router = inject(Router);
  private location = inject(Location);

  irAlHome() {
    // Redirige al Dashboard de pruebas que acabamos de crear
    this.router.navigate(['/home']);
  }

  volverAtras() {
    // Regresa a la página anterior en el historial del navegador
    this.location.back();
  }
}
