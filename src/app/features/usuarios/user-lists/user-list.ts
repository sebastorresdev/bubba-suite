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
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from '../services/user.service';
import { UserResponse } from '../models/user.models';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DataViewModule } from 'primeng/dataview';
import { environment } from '../../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../../../shared/models/problem-details.model';



@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, TagModule,
    TooltipModule, IconFieldModule, InputIconModule, InputTextModule,
    ConfirmDialogModule, ToastModule, AvatarModule, MessageModule, CardModule,
    ToolbarModule, SelectButtonModule, DataViewModule
  ],
  providers: [ConfirmationService],
  templateUrl: './user-list.html'
})
export class UserList implements OnInit {
  private router = inject(Router);
    private userService = inject(UserService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    users = signal<UserResponse[]>([]);
    totalUsers = computed(() => this.users().length);
    activeUsers = computed(() => this.users().filter(u => u.isActive).length);
    inactiveUsers = computed(() => this.users().filter(u => !u.isActive).length);
    loading = signal(false);
    errorMessage = signal<string | null>(null);
    globalSearch = '';
    options: any[] = ['list', 'grid'];
    layout: 'list' | 'grid' = 'grid';


    ngOnInit() { this.loadUsers(); }

    loadUsers() {
      this.loading.set(true);
      this.errorMessage.set(null);
      this.userService.getAll().subscribe({
        next: data => { this.users.set(data); this.loading.set(false); },
        error: () => { this.errorMessage.set('Error al cargar los usuarios.'); this.loading.set(false); }
      });
    }

    goToCreate() { this.router.navigate(['/usuarios/nuevo']); }
    goToEdit(id: string) { this.router.navigate(['/usuarios/editar', id]); }

    confirmDelete(user: UserResponse) {
      this.confirmationService.confirm({
        message: `¿Está seguro de que desea eliminar a <strong>${user.name}</strong>?`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => this.delete(user)
      });
    }

    delete(user: UserResponse) {
      this.userService.delete(user.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado.' });
          this.loadUsers();
        },
        error: (err: HttpErrorResponse) => {
        const problem = err.error as ProblemDetails;

        // Extrae directamente el título y el detalle que configuramos en tu Handler de C#
        const detailMessage = problem?.detail || 'Ocurrió un error inesperado.';
        const summaryTitle = problem?.title || 'Error';

        this.messageService.add({
          severity: 'error',
          summary: summaryTitle,
          detail: detailMessage,
        });
      },
      });
    }

    confirmArchive(user: UserResponse, detail?: string) {
      this.confirmationService.confirm({
        message: `${detail ?? 'El usuario tiene registros asociados.'} <br/><br/>¿Desea archivarlo en su lugar?`,
        header: 'No se puede eliminar',
        icon: 'pi pi-info-circle',
        acceptLabel: 'Archivar',
        rejectLabel: 'Cancelar',
        accept: () => this.archive(user.id)
      });
    }

    archive(id: string) {
      this.userService.archive(id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'info', summary: 'Archivado', detail: 'Usuario archivado correctamente.' });
          this.loadUsers();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo archivar al usuario.' })
      });
    }

    getInitials(name: string) {
      return name ? name.substring(0, 2).toUpperCase() : '';
    }

    getPhotoUrl(photoUrl: string | null): string {
      if (!photoUrl) return '';
      return `${environment.serverUrl}${photoUrl}`;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
      return isActive ? 'success' : 'danger';
    }

    getStatusLabel(isActive: boolean): string {
      return isActive ? 'Activo' : 'Inactivo';
    }
  }
