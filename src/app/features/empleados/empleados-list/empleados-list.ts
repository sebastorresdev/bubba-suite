import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { AvatarModule } from 'primeng/avatar';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmpleadoService } from '../services/empleado.service';
import { Empleado } from '../models/empleado.models';

@Component({
  selector: 'app-empleados-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    AvatarModule,
    MessageModule,
    CardModule,
    ToolbarModule
  ],
  providers: [ConfirmationService],
  templateUrl: './empleados-list.html'
})
export class EmpleadosList implements OnInit {
  private router = inject(Router);
  private empleadoService = inject(EmpleadoService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  empleados = signal<Empleado[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Computados para KPI Cards
  totalEmpleados = computed(() => this.empleados().length);
  activeEmpleados = computed(() => this.empleados().filter(e => e.isActive).length);
  inactiveEmpleados = computed(() => this.empleados().filter(e => !e.isActive).length);

  // Filtros
  globalSearch = '';

  ngOnInit() {
    this.loadEmpleados();
  }

  loadEmpleados() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.empleadoService.getAll().subscribe({
      next: data => {
        this.empleados.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar la lista de empleados.');
        this.loading.set(false);
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/empleados/nuevo']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/empleados/editar', id]);
  }

  toggleStatus(emp: Empleado) {
    const newStatus = !emp.isActive;
    this.empleadoService.updateStatus(emp.id, newStatus).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Estado Actualizado',
          detail: `Empleado ${emp.firstName} ahora está ${newStatus ? 'Activo' : 'Inactivo'}.`
        });
        this.loadEmpleados();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado del empleado.'
        });
      }
    });
  }

  confirmDelete(emp: Empleado) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar al empleado <strong>${emp.firstName} ${emp.lastName}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteEmpleado(emp.id)
    });
  }

  deleteEmpleado(id: string) {
    this.empleadoService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado eliminado correctamente.'
        });
        this.loadEmpleados();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar al empleado.'
        });
      }
    });
  }

  getStatusSeverity(isActive: boolean): 'success' | 'secondary' {
    return isActive ? 'success' : 'secondary';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  getInitials(firstName: string, lastName: string): string {
    const f = firstName ? firstName.charAt(0) : '';
    const l = lastName ? lastName.charAt(0) : '';
    return (f + l).toUpperCase();
  }
}

