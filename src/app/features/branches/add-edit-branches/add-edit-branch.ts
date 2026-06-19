import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

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
import { ToggleSwitchModule } from 'primeng/toggleswitch';



@Component({
  selector: 'app-add-edit-branch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule,
    MessageModule,
    ToggleSwitchModule
  ],
  providers: [MessageService, ConfirmationService],
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
  saving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Formulario Reactivo
  form: FormGroup = this.fb.group({
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
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la sucursal.' });
          this.loading.set(false);
          setTimeout(() => this.goBack(), 2000);
        }
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
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal actualizada correctamente.' });
          this.saving.set(false);
        },
        error: (err) => {
          const detail = err.error?.message || 'Ocurrió un error inesperado.';
          this.errorMessage.set(detail);
          this.saving.set(false);
        }
      });
    } else {
      // --- Lógica de Creación ---
      // Usamos CreateBranchRequest y tomamos solo los campos necesarios del formulario.
      const branchRequest: CreateBranchRequest = this.form.value;
      this.branchService.create(branchRequest).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal creada correctamente.' });
          // Al crear, redirigimos a la página de edición de la nueva sucursal
          // No es necesario `saving.set(false)` aquí porque el componente será destruido.
          this.router.navigate(['/sucursales/editar', response.id]);
        },
        error: (err) => {
          const detail = err.error?.message || 'Ocurrió un error inesperado.';
          this.errorMessage.set(detail);
          this.saving.set(false);
        }
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
            this.form.get('isActive')?.setValue(newStatus);
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado de la sucursal actualizado.' });
          },
          error: (err) => {
            const detail = err.error?.message || 'No se pudo actualizar el estado.';
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
          }
        });
      }
    });
  }
}
