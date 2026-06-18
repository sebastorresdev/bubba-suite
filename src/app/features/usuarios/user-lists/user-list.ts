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
        error: () => { this.errorMessage.set('Error loading users.'); this.loading.set(false); }
      });
    }

    goToCreate() { this.router.navigate(['/usuarios/nuevo']); }
    goToEdit(id: string) { this.router.navigate(['/usuarios/editar', id]); }

    confirmDelete(user: UserResponse) {
      this.confirmationService.confirm({
        message: `Are you sure you want to delete <strong>${user.name}</strong>?`,
        header: 'Confirm deletion',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Yes, delete',
        rejectLabel: 'Cancel',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => this.delete(user)
      });
    }

    delete(user: UserResponse) {
      this.userService.delete(user.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted.' });
          this.loadUsers();
        },
        error: (err) => {
          if (err.status === 409) {
            // Has associated records — suggest archiving
            this.confirmArchive(user, err.error?.detail);
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete the user.' });
          }
        }
      });
    }

    confirmArchive(user: UserResponse, detail?: string) {
      this.confirmationService.confirm({
        message: `${detail ?? 'The user has associated records.'} <br/><br/>Do you want to archive them instead?`,
        header: 'Cannot delete',
        icon: 'pi pi-info-circle',
        acceptLabel: 'Archive',
        rejectLabel: 'Cancel',
        accept: () => this.archive(user.id)
      });
    }

    archive(id: string) {
      this.userService.archive(id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'info', summary: 'Archived', detail: 'User successfully archived.' });
          this.loadUsers();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not archive the user.' })
      });
    }

    getInitials(name: string) {
      return name ? name.substring(0, 2).toUpperCase() : '';
    }

    getPhotoUrl(photoUrl: string | null): string {
      if (!photoUrl) return '';
      return `${environment.serverUrl}${photoUrl}`;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'secondary' {
      return isActive ? 'success' : 'secondary';
    }

    getStatusLabel(isActive: boolean): string {
      return isActive ? 'Active' : 'Inactive';
    }
  }
