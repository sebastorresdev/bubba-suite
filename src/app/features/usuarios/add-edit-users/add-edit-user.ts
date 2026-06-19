import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MenuModule } from 'primeng/menu';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { of, switchMap } from 'rxjs';
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
    SelectModule, ToastModule, MessageModule, SkeletonModule, FileUploadModule, CardModule,
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

  linkedBranchName = signal<string | null>(null);
  displaySedeDialog = signal(false);
  selectedBranch = signal<any | null>(null);
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
      label: this.isActiveUser() ? 'Deactivate User' : 'Reactivate User',
      icon: this.isActiveUser() ? 'pi pi-ban' : 'pi pi-check-circle',
      command: () => this.toggleStatus(!this.isActiveUser()),
      styleClass: this.isActiveUser() ? 'text-warn-600 dark:text-warn-400' : 'text-green-600 dark:text-green-400'
    },
    {
      separator: true
    },
    {
      label: 'Delete User',
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
      error: () => this.errorMessage.set('Could not load roles.')
    });

    if (this.isEditing()) {
      this.loading.set(true);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();

      this.userService.getById(this.userId!).pipe(
        switchMap(user => {
          if (user.branchId) {
            return this.branchService.getById(user.branchId).pipe(
              switchMap(branch => of({ user, branch }))
            );
          }
          return of({ user, branch: null });
        })
      ).subscribe({
        next: ({ user, branch }) => {
          this.form.patchValue(user);

          this.isActiveUser.set(user.isActive ?? true);
          if (user.profilePicture) {
            this.photoPreview.set(`${environment.serverUrl}${user.profilePicture}`);
          }

          if (branch) {
            this.linkedBranchName.set(branch.name);
          }

          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Could not load user data.');
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
      summary: 'Success',
      detail: this.isEditing() ? 'User updated.' : 'User created.'
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
      : err.error?.detail ?? 'An unexpected error occurred.';
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
    this.errorMessage.set('The image does not meet the requirements (max 2MB, JPG/PNG/WEBP).');
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
      message: `Are you sure you want to delete this user? This action cannot be undone.`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete()
    });
  }

  delete() {
    this.saving.set(true);
    this.userService.delete(this.userId!).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted.' });
        setTimeout(() => this.router.navigate(['/usuarios']), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete the user.' });
        this.saving.set(false);
      }
    });
  }

  toggleStatus(activate: boolean) {
    const newStatus = activate;
    const actionText = activate ? 'reactivate' : 'deactivate';

    this.confirmationService.confirm({
      message: `Are you sure you want to ${actionText} this user?`,
      header: 'Confirm status change',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: activate ? 'p-button-success' : 'p-button-warning',
      accept: () => {
        this.saving.set(true);
        this.userService.updateUserStatus(this.userId!, newStatus).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: `User ${actionText}d successfully.` });
            this.isActiveUser.set(newStatus);
            this.form.patchValue({ isActive: newStatus });
            this.saving.set(false);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: `Could not ${actionText} the user.` });
            this.saving.set(false);
          }
        });
      }
    });
  }

  showSedeDialog() {
    this.loadAvailableBranches();
    this.displaySedeDialog.set(true);
  }

  loadAvailableBranches() {
    this.branchService.getAvailableBranches().subscribe({
      next: (branches) => this.availableBranches.set(branches),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load available branches.' })
    });
  }

  linkBranch() {
    const branchToLink = this.selectedBranch();
    if (!branchToLink || !this.userId) return;

    this.saving.set(true);
    // Asumimos que tienes un método `linkBranch` en tu `UserService`
    this.userService.assignBranchToUser(this.userId, branchToLink.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Sucursal '${branchToLink.name}' vinculada.` });
        this.linkedBranchName.set(branchToLink.name);
        this.displaySedeDialog.set(false);
        this.selectedBranch.set(null);
        this.saving.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo vincular la sucursal.' });
        this.saving.set(false);
      }
    });
  }

  unlinkBranch() {
    if (!this.userId) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea desvincular la sucursal de este usuario?`,
      header: 'Confirmar desvinculación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, desvincular',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.saving.set(true);
        // Asumimos que tienes un método `unlinkBranch` en tu `UserService`
        this.userService.assignBranchToUser(this.userId!, null).subscribe({
          next: () => {
            this.messageService.add({ severity: 'info', summary: 'Información', detail: 'Sucursal desvinculada.' });
            this.linkedBranchName.set(null);
            this.saving.set(false);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo desvincular la sucursal.' });
            this.saving.set(false);
          }
        });
      }
    });
  }
}
