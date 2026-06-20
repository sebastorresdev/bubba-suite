import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { EmpleadoService } from '../services/empleado.service';
import { DocumentType, DocumentTypeLabels } from '../models/empleado.models';

@Component({
  selector: 'app-add-edit-empleado',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    MessageModule,
    SkeletonModule,
    CardModule,
    ConfirmDialogModule,
    MenuModule
  ],
  providers: [ConfirmationService],
  templateUrl: './add-edit-empleado.html'
})
export class AddEditEmpleado implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private empleadoService = inject(EmpleadoService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  empleadoId = this.route.snapshot.paramMap.get('id');
  isEditing = computed(() => !!this.empleadoId);

  isActiveEmpleado = signal<boolean>(true);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal<string | null>(null);

  documentTypes = DocumentTypeLabels;

  empleadoActions = computed<MenuItem[]>(() => [
    {
      label: this.isActiveEmpleado() ? 'Desactivar Empleado' : 'Reactivar Empleado',
      icon: this.isActiveEmpleado() ? 'pi pi-ban' : 'pi pi-check-circle',
      command: () => this.toggleStatus(!this.isActiveEmpleado()),
      styleClass: this.isActiveEmpleado() ? 'text-warn-600 dark:text-warn-400' : 'text-green-600 dark:text-green-400'
    },
    {
      separator: true
    },
    {
      label: 'Eliminar Empleado',
      icon: 'pi pi-trash',
      command: () => this.confirmDelete(),
      styleClass: 'text-red-600 dark:text-red-400'
    }
  ]);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    documentType: [DocumentType.DNI, Validators.required],
    documentNumber: ['', [Validators.required, Validators.pattern('^[0-9A-Za-z-]{6,15}$')]],
    code: ['', [Validators.required, Validators.pattern('^EMP-[0-9]{3,5}$')]],
    email: ['', [Validators.email]],
    phone: [''],
    position: [''],
    department: [''],
    hireDate: ['', Validators.required],
    isActive: [true, Validators.required]
  });

  ngOnInit() {
    if (this.isEditing()) {
      this.loadEmpleado();
    } else {
      // Valor por defecto para fecha de ingreso (hoy en formato YYYY-MM-DD)
      const today = new Date().toISOString().substring(0, 10);
      this.form.patchValue({ hireDate: today });
    }
  }

  loadEmpleado() {
    if (!this.empleadoId) return;
    this.loading.set(true);
    this.empleadoService.getById(this.empleadoId).subscribe({
      next: emp => {
        this.isActiveEmpleado.set(emp.isActive);
        this.form.patchValue({
          firstName: emp.firstName,
          lastName: emp.lastName,
          documentType: emp.documentType,
          documentNumber: emp.documentNumber,
          code: emp.code,
          email: emp.email || '',
          phone: emp.phone || '',
          position: emp.position || '',
          department: emp.department || '',
          hireDate: emp.hireDate || '',
          isActive: emp.isActive
        });
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información del empleado.'
        });
        this.router.navigate(['/empleados']);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.value as any;

    if (this.isEditing() && this.empleadoId) {
      this.empleadoService.update(this.empleadoId, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Empleado actualizado correctamente.'
          });
          setTimeout(() => this.router.navigate(['/empleados']), 800);
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar la información del empleado.'
          });
        }
      });
    } else {
      this.empleadoService.create(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Empleado registrado con éxito.'
          });
          setTimeout(() => this.router.navigate(['/empleados']), 800);
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar al empleado.'
          });
        }
      });
    }
  }

  toggleStatus(newStatus: boolean) {
    if (!this.empleadoId) return;
    this.empleadoService.updateStatus(this.empleadoId, newStatus).subscribe({
      next: () => {
        this.isActiveEmpleado.set(newStatus);
        this.form.patchValue({ isActive: newStatus });
        this.messageService.add({
          severity: 'success',
          summary: 'Estado Actualizado',
          detail: `Empleado ${newStatus ? 'reactivado' : 'desactivado'} con éxito.`
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cambiar el estado del empleado.'
        });
      }
    });
  }

  confirmDelete() {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar permanentemente este empleado? Esta acción no se puede revertir.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteEmpleado()
    });
  }

  deleteEmpleado() {
    if (!this.empleadoId) return;
    this.empleadoService.delete(this.empleadoId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'El empleado fue eliminado.'
        });
        setTimeout(() => this.router.navigate(['/empleados']), 800);
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

  cancel() {
    this.router.navigate(['/empleados']);
  }
}

