import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RoleService } from '../services/role.service';
import { RoleResponse } from '../models/role.models';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ConfirmDialogModule, ToastModule,
    CardModule, MessageModule, SkeletonModule, TooltipModule, IconFieldModule,
    InputIconModule, InputTextModule
  ],
  providers: [ConfirmationService],
  templateUrl: './role-list.html'
})
export class RoleList implements OnInit {
  private router = inject(Router);
  private roleService = inject(RoleService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  roles = signal<RoleResponse[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.roleService.getAll().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar los roles del sistema.');
        this.loading.set(false);
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/roles/nuevo']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/roles/editar', id]);
  }

  confirmDelete(role: RoleResponse) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el rol <strong>${role.name}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteRole(role.id)
    });
  }

  deleteRole(id: string) {
    this.loading.set(true);
    this.roleService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Rol eliminado correctamente.'
        });
        this.loadRoles();
      },
      error: (err) => {
        const detailMessage = err.error?.detail ?? 'No se pudo eliminar el rol. Asegúrese de que no esté asignado a ningún usuario.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: detailMessage
        });
        this.loading.set(false);
      }
    });
  }
}
