import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { AsistenciaService } from '../asistencias/services/asistencia.service';
import { Asistencia, ResumenAsistencia } from '../asistencias/models/asistencia.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, TagModule, AvatarModule],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private asistenciaService = inject(AsistenciaService);

  resumenHoy = signal<ResumenAsistencia | null>(null);
  asistenciasRecientes = signal<Asistencia[]>([]);

  ngOnInit() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.asistenciaService.obtenerResumenHoy().subscribe(resumen => {
      this.resumenHoy.set(resumen);
    });

    this.asistenciaService.obtenerAsistenciasRecientes().subscribe(asistencias => {
      this.asistenciasRecientes.set(asistencias);
    });
  }

  obtenerEstadoSeverity(estado: string): "success" | "warn" | "danger" | "info" | "secondary" | "contrast" {
    switch (estado) {
      case 'PUNTUAL':
        return 'success';
      case 'TARDANZA':
        return 'warn';
      case 'FALTA':
        return 'danger';
      case 'PERMISO':
        return 'info';
      default:
        return 'secondary';
    }
  }

  iniciales(nombre: string): string {
    if (!nombre) return '';
    return nombre.substring(0, 2).toUpperCase();
  }

  irAUsuarios() {
    this.router.navigate(['/usuarios']);
  }

  logout() {
    this.authService.logout();
  }
}
