import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Asistencia, ResumenAsistencia } from '../models/asistencia.models';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/asistencias`;

  obtenerResumenHoy(): Observable<ResumenAsistencia> {
    // Cuando el API esté listo:
    // return this.http.get<ResumenAsistencia>(`${this.base}/resumen-hoy`);

    const mockResumen: ResumenAsistencia = {
      totalEmpleados: 45,
      activosHoy: 38,
      tardanzasHoy: 4,
      faltasHoy: 3,
      porcentajePuntualidad: 89.4
    };
    return of(mockResumen);
  }

  obtenerAsistenciasRecientes(): Observable<Asistencia[]> {
    // Cuando el API esté listo:
    // return this.http.get<Asistencia[]>(`${this.base}/recientes`);

    const mockAsistencias: Asistencia[] = [
      {
        id: '1',
        empleadoId: 'emp-101',
        nombreEmpleado: 'Carlos Mendoza',
        rolEmpleado: 'Supervisor de Tienda',
        fecha: '2026-06-11',
        horaEntrada: '07:52:14',
        estado: 'PUNTUAL',
        fotoEmpleado: ''
      },
      {
        id: '2',
        empleadoId: 'emp-102',
        nombreEmpleado: 'Ana Laura Gómez',
        rolEmpleado: 'Vendedora Senior',
        fecha: '2026-06-11',
        horaEntrada: '08:14:30',
        estado: 'TARDANZA',
        fotoEmpleado: '',
        observaciones: 'Tráfico pesado en Av. Arequipa'
      },
      {
        id: '3',
        empleadoId: 'emp-103',
        nombreEmpleado: 'Mateo Sebastiani',
        rolEmpleado: 'Asistente de Almacén',
        fecha: '2026-06-11',
        horaEntrada: '07:45:02',
        estado: 'PUNTUAL',
        fotoEmpleado: ''
      },
      {
        id: '4',
        empleadoId: 'emp-104',
        nombreEmpleado: 'Sofia Valdivia',
        rolEmpleado: 'Cajera principal',
        fecha: '2026-06-11',
        horaEntrada: '08:05:12',
        estado: 'TARDANZA',
        fotoEmpleado: ''
      },
      {
        id: '5',
        empleadoId: 'emp-105',
        nombreEmpleado: 'Luis Fernando Ruiz',
        rolEmpleado: 'Seguridad',
        fecha: '2026-06-11',
        estado: 'FALTA',
        fotoEmpleado: '',
        observaciones: 'Sin justificar'
      },
      {
        id: '6',
        empleadoId: 'emp-106',
        nombreEmpleado: 'Gabriela Peralta',
        rolEmpleado: 'Diseñadora de Marca',
        fecha: '2026-06-11',
        horaEntrada: '08:00:00',
        estado: 'PERMISO',
        fotoEmpleado: '',
        observaciones: 'Cita médica aprobada'
      }
    ];
    return of(mockAsistencias);
  }
}
