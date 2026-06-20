import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

// Models and Services
import { BranchResponse } from '../models/branch.models';
import { BranchService } from '../services/branch.service';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../../../shared/models/problem-details.model';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    SkeletonModule,
    ConfirmDialogModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './branches-list.html',
})
export class BranchesList implements OnInit {
  private branchService = inject(BranchService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal<boolean>(true);
  branches = signal<BranchResponse[]>([]);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.loading.set(true);
    this.error.set(null);
    this.branchService.getAll().subscribe({
      next: (data) => {
        this.branches.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las sucursales. Intente de nuevo más tarde.');
        this.loading.set(false);
      },
    });
  }

  goToCreate(): void {
    this.router.navigate(['/sucursales/nuevo']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/sucursales/editar', id]);
  }

  confirmDelete(branch: BranchResponse): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la sucursal "${branch.name}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteBranch(branch.id),
    });
  }

  private deleteBranch(id: string): void {
    this.branchService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Sucursal eliminada correctamente.',
        });
        this.branches.update((b) => b.filter((branch) => branch.id !== id));
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
}
