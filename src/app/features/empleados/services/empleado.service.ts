import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Empleado, EmpleadoDetail, CreateEmpleadoRequest, UpdateEmpleadoRequest } from '../models/empleado.models';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/empleados`;

  // Datos mockeados en memoria para simular el comportamiento del backend
  private mockEmpleados: EmpleadoDetail[] = [
    {
      id: 'emp-uuid-1',
      code: 'EMP-001',
      documentType: 0, // DNI
      documentNumber: '71234567',
      firstName: 'Juan Carlos',
      lastName: 'Pérez Torres',
      email: 'juan.perez@bubbabags.com',
      phone: '+51 987654321',
      position: 'Administrador de Tienda',
      department: 'Operaciones',
      isActive: true,
      hireDate: '2024-01-15',
      photoUrl: ''
    },
    {
      id: 'emp-uuid-2',
      code: 'EMP-002',
      documentType: 0, // DNI
      documentNumber: '45678901',
      firstName: 'María Fernanda',
      lastName: 'Silva Rivas',
      email: 'maria.silva@bubbabags.com',
      phone: '+51 912345678',
      position: 'Cajera Principal',
      department: 'Ventas',
      isActive: true,
      hireDate: '2024-05-20',
      photoUrl: ''
    },
    {
      id: 'emp-uuid-3',
      code: 'EMP-003',
      documentType: 0, // DNI
      documentNumber: '12345678',
      firstName: 'Ricardo Daniel',
      lastName: 'Gómez Prado',
      email: 'ricardo.gomez@bubbabags.com',
      phone: '+51 955667788',
      position: 'Asistente de Almacén',
      department: 'Logística',
      isActive: true,
      hireDate: '2025-02-10',
      photoUrl: ''
    },
    {
      id: 'emp-uuid-4',
      code: 'EMP-004',
      documentType: 0, // DNI
      documentNumber: '87654321',
      firstName: 'Andrea Sofia',
      lastName: 'Montalván Castro',
      email: 'andrea.montalvan@bubbabags.com',
      phone: '+51 944332211',
      position: 'Asistente de Ventas',
      department: 'Ventas',
      isActive: true,
      hireDate: '2025-03-01',
      photoUrl: ''
    },
    {
      id: 'emp-uuid-5',
      code: 'EMP-005',
      documentType: 0, // DNI
      documentNumber: '10293847',
      firstName: 'Luis Alberto',
      lastName: 'Quispe Huamán',
      email: 'luis.quispe@bubbabags.com',
      phone: '+51 966778899',
      position: 'Personal de Seguridad',
      department: 'Operaciones',
      isActive: false, // Inactivo / De baja
      hireDate: '2023-11-01',
      photoUrl: ''
    }
  ];

  getAll(): Observable<Empleado[]> {
    // Cuando el API esté listo en tu backend, descomenta esta línea:
    // return this.http.get<Empleado[]>(this.base);

    // Retorna una copia de los empleados de prueba
    return of([...this.mockEmpleados]).pipe(delay(400));
  }

  getById(id: string): Observable<EmpleadoDetail> {
    // Cuando el API esté listo en tu backend, descomenta esta línea:
    // return this.http.get<EmpleadoDetail>(`${this.base}/${id}`);

    const emp = this.mockEmpleados.find(e => e.id === id);
    if (!emp) {
      throw new Error(`Empleado con ID ${id} no encontrado.`);
    }
    return of({ ...emp }).pipe(delay(300));
  }

  create(data: CreateEmpleadoRequest): Observable<{ id: string }> {
    // Cuando el API esté listo en tu backend, descomenta esta línea:
    // return this.http.post<{ id: string }>(this.base, data);

    const newId = `emp-uuid-${Date.now()}`;
    const newEmp: EmpleadoDetail = {
      ...data,
      id: newId,
      isActive: true
    };
    this.mockEmpleados.unshift(newEmp);
    return of({ id: newId }).pipe(delay(450));
  }

  update(id: string, data: UpdateEmpleadoRequest): Observable<void> {
    // Cuando el API esté listo en tu backend, descomenta esta línea:
    // return this.http.put<void>(`${this.base}/${id}`, data);

    const idx = this.mockEmpleados.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.mockEmpleados[idx] = {
        ...this.mockEmpleados[idx],
        ...data
      };
    }
    return of(void 0).pipe(delay(400));
  }

  delete(id: string): Observable<void> {
    // Cuando el API esté listo en tu backend, descomenta esta línea:
    // return this.http.delete<void>(`${this.base}/${id}`);

    this.mockEmpleados = this.mockEmpleados.filter(e => e.id !== id);
    return of(void 0).pipe(delay(350));
  }

  updateStatus(id: string, isActive: boolean): Observable<void> {
    // Cuando el API esté listo en tu backend, descomenta esta línea:
    // return this.http.patch<void>(`${this.base}/${id}/status`, { isActive });

    const emp = this.mockEmpleados.find(e => e.id === id);
    if (emp) {
      emp.isActive = isActive;
    }
    return of(void 0).pipe(delay(250));
  }
}
