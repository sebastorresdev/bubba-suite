import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ListboxModule } from 'primeng/listbox';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MenuModule } from 'primeng/menu';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { forkJoin, of, switchMap } from 'rxjs';
import { UserService } from '../services/user.service';
import { RoleService } from '../../roles/services/role.service';
import { RoleResponse } from '../../roles/models/role.models';
import { CardModule } from 'primeng/card';
import { BranchService } from '../../branches/services/branch.service';
import { SkeletonModule } from 'primeng/skeleton';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-edit-user',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, ButtonModule, InputTextModule, PasswordModule,
    SelectModule, ListboxModule, ToastModule, MessageModule, SkeletonModule, FileUploadModule, CardModule,
    ConfirmDialogModule, DialogModule, MenuModule
  ],
  providers: [ConfirmationService],
  templateUrl: './add-edit-user.html'
})
export class AddEditUser implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private branchService = inject(BranchService);

  photoPreview = signal<string | null>(null);
  photoFile = signal<File | null>(null);

  linkedBranches = signal<any[]>([]);
  displaySedeDialog = signal(false);
  selectedBranches = signal<any[]>([]);
  availableBranches = signal<any[]>([]);

  userId = this.route.snapshot.paramMap.get('id');
  isEditing = computed(() => !!this.userId);

  isActiveUser = signal<boolean>(true);
  roles = signal<RoleResponse[]>([]);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal<string | null>(null);

  userActions = computed<MenuItem[]>(() => [
    {
      label: this.isActiveUser() ? 'Desactivar Usuario' : 'Reactivar Usuario',
      icon: this.isActiveUser() ? 'pi pi-ban' : 'pi pi-check-circle',
      command: () => this.toggleStatus(!this.isActiveUser()),
      styleClass: this.isActiveUser() ? 'text-warn-600 dark:text-warn-400' : 'text-green-600 dark:text-green-400'
    },
    {
      separator: true
    },
    {
      label: 'Eliminar Usuario',
      icon: 'pi pi-trash',
      command: () => this.confirmDelete(),
      styleClass: 'text-red-600 dark:text-red-400'
    }
  ]);

  form = this.fb.group({
    name: ['', Validators.required],
    username: ['', [Validators.required, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', Validators.email],
    phoneNumber: [''],
    profilePicture: [null as string | null],
    roleId: ['', Validators.required],
    isActive: [true, Validators.required]
  });

  ngOnInit() {
    this.roleService.getAll().subscribe({
      next: data => this.roles.set(data),
      error: () => this.errorMessage.set('No se pudieron cargar los roles.')
    });

    if (this.isEditing()) {
      this.loading.set(true);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();

      forkJoin({
        user: this.userService.getById(this.userId!),
        branches: this.branchService.getAll()
      }).subscribe({
        next: ({ user, branches }) => {
          this.form.patchValue(user);

          this.isActiveUser.set(user.isActive ?? true);
          if (user.profilePicture) {
            this.photoPreview.set(`${environment.serverUrl}${user.profilePicture}`);
          }

          const userBranchIds = user.branchIds || [];
          const linked = branches.filter(b => userBranchIds.includes(b.id));
          this.linkedBranches.set(linked);

          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('No se pudieron cargar los datos del usuario.');
          this.loading.set(false);
        }
      });
    }
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMessage.set(null);

    this.processPhotoAndSave();
  }

  private processPhotoAndSave() {
    if (!this.photoFile()) {
      this.executeSave().subscribe({
        next: (res: any) => this.onSuccess(res),
        error: (err) => this.onError(err)
      });
      return;
    }

    const formData = new FormData();
    formData.append('photo', this.photoFile()!);

    this.userService.uploadPhoto(formData).pipe(
      switchMap(res => {
        this.form.patchValue({ profilePicture: res.url });
        return this.executeSave();
      })
    ).subscribe({
      next: (res: any) => this.onSuccess(res),
      error: (err) => this.onError(err)
    });
  }

  private executeSave() {
    const payload = this.buildPayload();
    return this.isEditing()
      ? this.userService.update(this.userId!, payload)
      : this.userService.create(payload);
  }

  private buildPayload() {
    const v = this.form.getRawValue();
    const base: any = {
      name: v.name,
      username: v.username,
      email: v.email?.trim() || null,
      phoneNumber: v.phoneNumber?.trim() || null,
      profilePicture: v.profilePicture || null,
      roleId: v.roleId,
      isActive: v.isActive ?? true
    };
    if (!this.isEditing()) base.password = v.password;
    return base;
  }

  private onSuccess(res?: any) {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: this.isEditing() ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.'
    });
    if (this.isEditing()) {
      this.saving.set(false);
    } else {
      const id = res?.id;
      if (id) {
        this.router.navigate(['/usuarios/editar', id]);
      } else {
        this.router.navigate(['/usuarios']);
      }
    }
  }

  private onError(err: any) {
    const detalle = err.error?.errors
      ? Object.values(err.error.errors).flat().join(' ')
      : err.error?.detail ?? 'Ocurrió un error inesperado.';
    this.errorMessage.set(detalle);
    this.saving.set(false);
  }

  onPhotoSelected(event: any) {
    const archivo: File = event.files[0];
    if (!archivo) return;
    this.photoPreview.set(URL.createObjectURL(archivo));
    this.photoFile.set(archivo);
  }

  onPhotoError() {
    this.errorMessage.set('La imagen no cumple con los requisitos (máx 2MB, JPG/PNG/WEBP).');
  }

  onFileRemoved() {
    this.clearPhoto();
  }

  clearPhoto() {
    const preview = this.photoPreview();
    if (preview?.startsWith('blob:'))
      URL.revokeObjectURL(preview);
    this.photoPreview.set(null);
    this.photoFile.set(null);
    this.form.patchValue({ profilePicture: null });
  }

  isFieldInvalid(field: string) {
    const control = this.form.get(field);
    return control?.invalid && control?.touched;
  }

  goBack() {
    this.router.navigate(['/usuarios']);
  }

  goToCreateNew() {
    this.router.navigate(['/usuarios/nuevo']);
  }

  confirmDelete() {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete()
    });
  }

  delete() {
    this.saving.set(true);
    this.userService.delete(this.userId!).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado correctamente.' });
        setTimeout(() => this.router.navigate(['/usuarios']), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario.' });
        this.saving.set(false);
      }
    });
  }

  toggleStatus(activate: boolean) {
    const newStatus = activate;
    const actionText = activate ? 'reactivar' : 'desactivar';
    const messageText = activate ? 'reactivado' : 'desactivado';

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea ${actionText} a este usuario?`,
      header: 'Confirmar cambio de estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: activate ? 'p-button-success' : 'p-button-warning',
      accept: () => {
        this.saving.set(true);
        this.userService.updateUserStatus(this.userId!, newStatus).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Usuario ${messageText} correctamente.` });
            this.isActiveUser.set(newStatus);
            this.form.patchValue({ isActive: newStatus });
            this.saving.set(false);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: `No se pudo ${actionText} al usuario.` });
            this.saving.set(false);
          }
        });
      }
    });
  }

  showSedeDialog() {
    this.loadAvailableBranchesAndInit();
  }

  loadAvailableBranchesAndInit() {
    this.branchService.getAvailableBranches().subscribe({
      next: (branches) => {
        this.availableBranches.set(branches);

        // Pre-select branches that are currently linked
        const linkedIds = this.linkedBranches().map(b => b.id);
        const preSelected = branches.filter(b => linkedIds.includes(b.id));

        // If some linked branches are not in the "available" list, append them to availableBranches
        // and pre-select them so they can be deselected if wanted
        const missingBranches = this.linkedBranches().filter(lb => !branches.some(ab => ab.id === lb.id));
        if (missingBranches.length > 0) {
          this.availableBranches.set([...branches, ...missingBranches]);
          this.selectedBranches.set([...preSelected, ...missingBranches]);
        } else {
          this.selectedBranches.set(preSelected);
        }

        this.displaySedeDialog.set(true);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las sedes disponibles.' })
    });
  }

  linkBranches() {
    if (!this.userId) return;
    this.saving.set(true);

    const branchIds = this.selectedBranches().map(b => b.id);

    this.userService.assignBranchesToUser(this.userId, branchIds).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Sedes vinculadas correctamente.'
        });
        this.linkedBranches.set([...this.selectedBranches()]);
        this.displaySedeDialog.set(false);
        this.saving.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron vincular las sedes.'
        });
        this.saving.set(false);
      }
    });
  }

  unlinkBranch(branchId: string) {
    if (!this.userId) return;

    const branchToUnlink = this.linkedBranches().find(b => b.id === branchId);
    const branchName = branchToUnlink ? branchToUnlink.name : '';

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea desvincular la sucursal '${branchName}' de este usuario?`,
      header: 'Confirmar desvinculación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, desvincular',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.saving.set(true);
        const remainingBranchIds = this.linkedBranches()
          .filter(b => b.id !== branchId)
          .map(b => b.id);

        this.userService.assignBranchesToUser(this.userId!, remainingBranchIds).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: 'Información',
              detail: `Sucursal '${branchName}' desvinculada.`
            });
            this.linkedBranches.update(branches => branches.filter(b => b.id !== branchId));
            this.saving.set(false);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo desvincular la sucursal.'
            });
            this.saving.set(false);
          }
        });
      }
    });
  }
}
