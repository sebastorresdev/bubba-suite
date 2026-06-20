import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

// Models and Services
import { BranchService } from '../services/branch.service';
import { CreateBranchRequest, UpdateBranchRequest } from '../models/branch.models';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../../../shared/models/problem-details.model';

@Component({
  selector: 'app-add-edit-branch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ConfirmDialogModule,
    SkeletonModule,
    MessageModule, // Mantén este módulo si lo usas en otro lugar
    MenuModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './add-edit-branch.html',
})
export class AddEditBranch implements OnInit {
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private branchService = inject(BranchService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Signals para manejar el estado del componente
  branchId = signal<string | null>(null);
  isEditing = computed(() => !!this.branchId());
  loading = signal<boolean>(false);
  isActiveBranch = signal<boolean>(true);
  saving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  branchActions = computed<MenuItem[]>(() => [
    {
      label: this.isActiveBranch() ? 'Desactivar Sucursal' : 'Reactivar Sucursal',
      icon: this.isActiveBranch() ? 'pi pi-ban' : 'pi pi-check-circle',
      command: () => this.toggleStatus(!this.isActiveBranch()),
      styleClass: this.isActiveBranch()
        ? 'text-warn-600 dark:text-warn-400'
        : 'text-green-600 dark:text-green-400',
    },
    {
      separator: true,
    },
    {
      label: 'Eliminar Sucursal',
      icon: 'pi pi-trash',
      command: () => this.confirmDelete(),
      styleClass: 'text-red-600 dark:text-red-400',
    },
  ]);

  // Formulario Reactivo
  form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    address: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.branchId.set(id);
      this.loading.set(true);
      this.branchService.getById(id).subscribe({
        next: (branch) => {
          this.form.patchValue(branch);
          this.isActiveBranch.set(branch.isActive ?? true);
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar la sucursal.',
          });
          this.loading.set(false);
          setTimeout(() => this.goBack(), 2000);
        },
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    if (this.isEditing()) {
      // --- Lógica de Actualización ---
      // Usamos UpdateBranchRequest y tomamos solo los campos necesarios del formulario.
      const branchRequest: UpdateBranchRequest = this.form.value;
      this.branchService.update(this.branchId()!, branchRequest).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Sucursal actualizada correctamente.',
          });
          this.saving.set(false);
        },
        error: (err: HttpErrorResponse) => this.onError(err),
      });
    } else {
      // --- Lógica de Creación ---
      // Usamos CreateBranchRequest y tomamos solo los campos necesarios del formulario.
      const branchRequest: CreateBranchRequest = this.form.value;
      this.branchService.create(branchRequest).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Sucursal creada correctamente.',
          });
          // Al crear, redirigimos a la página de edición de la nueva sucursal
          // No es necesario `saving.set(false)` aquí porque el componente será destruido.
          this.router.navigate(['/sucursales/editar', response.id]);
        },
        error: (err: HttpErrorResponse) => this.onError(err),
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  goBack(): void {
    this.router.navigate(['/sucursales']);
  }

  goToCreateNew(): void {
    this.router.navigate(['/sucursales/nuevo']);
  }

  toggleStatus(newStatus: boolean): void {
    if (!this.isEditing() || !this.branchId()) {
      return;
    }

    const action = newStatus ? 'reactivar' : 'desactivar';
    const branchName = this.form.get('name')?.value || 'esta sucursal';

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea ${action} la sucursal "${branchName}"?`,
      header: 'Confirmar Cambio de Estado',
      icon: 'pi pi-info-circle',
      acceptLabel: `Sí, ${action}`,
      rejectLabel: 'Cancelar',
      accept: () => {
        this.branchService.updateBranchStatus(this.branchId()!, newStatus).subscribe({
          next: () => {
            this.isActiveBranch.set(newStatus);
            this.form.get('isActive')?.setValue(newStatus);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Estado de la sucursal actualizado.',
            });
          },
          error: (err) => {
            const detail = err.error?.message || 'No se pudo actualizar el estado.';
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
          },
        });
      },
    });
  }

  confirmDelete(): void {
    const branchName = this.form.get('name')?.value || 'esta sucursal';
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la sucursal "${branchName}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(),
    });
  }

  private delete(): void {
    if (!this.branchId()) return;

    this.saving.set(true);
    this.branchService.delete(this.branchId()!).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Sucursal eliminada correctamente.',
        });
        setTimeout(() => this.goBack(), 1500);
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

  private onError(err: HttpErrorResponse): void {
    const detailMessage = err.error?.errors
      ? Object.values(err.error.errors).flat().join(' ')
      : err.error?.detail ?? 'Ocurrió un error inesperado.';
    this.errorMessage.set(detailMessage);
    this.saving.set(false);
  }
}
