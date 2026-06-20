import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { forkJoin, switchMap } from 'rxjs';
import { RoleService } from '../services/role.service';
import { PermissionResponse } from '../models/role.models';

@Component({
  selector: 'app-add-edit-role',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, ButtonModule, InputTextModule,
    TextareaModule, CheckboxModule, ToastModule, MessageModule, CardModule,
    SkeletonModule
  ],
  templateUrl: './add-edit-role.html'
})
export class AddEditRole implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private roleService = inject(RoleService);
  private messageService = inject(MessageService);

  userId = this.route.snapshot.paramMap.get('id');
  isEditing = computed(() => !!this.userId);

  availablePermissions = signal<PermissionResponse[]>([]);
  selectedPermissions = signal<string[]>([]);

  groupedPermissions = computed(() => {
    const perms = this.availablePermissions();
    const groups: { [key: string]: PermissionResponse[] } = {};

    perms.forEach(p => {
      let module = 'General';
      const name = p.name.toLowerCase();

      // 1. Detect module based on standard separator like . or : (e.g. "users.read" or "users:read")
      if (p.name.includes('.')) {
        module = p.name.split('.')[0];
      } else if (p.name.includes(':')) {
        module = p.name.split(':')[0];
      }
      // 2. Fallback heuristics based on common words
      else if (name.includes('user') || name.includes('usuario')) {
        module = 'Usuarios';
      } else if (name.includes('branch') || name.includes('sucursal') || name.includes('sede')) {
        module = 'Sucursales';
      } else if (name.includes('role') || name.includes('rol')) {
        module = 'Roles';
      } else if (name.includes('asistencia') || name.includes('attendance')) {
        module = 'Asistencias';
      }

      // Capitalize and format the module name for Spanish display
      const moduleLower = module.toLowerCase().trim();
      let displayModule = 'General';
      if (moduleLower === 'users' || moduleLower === 'user' || moduleLower === 'usuarios' || moduleLower === 'usuario') {
        displayModule = 'Usuarios';
      } else if (moduleLower === 'branches' || moduleLower === 'branch' || moduleLower === 'sucursales' || moduleLower === 'sucursal' || moduleLower === 'sedes' || moduleLower === 'sede') {
        displayModule = 'Sucursales';
      } else if (moduleLower === 'roles' || moduleLower === 'role' || moduleLower === 'rol') {
        displayModule = 'Roles';
      } else if (moduleLower === 'asistencias' || moduleLower === 'asistencia' || moduleLower === 'attendances' || moduleLower === 'attendance') {
        displayModule = 'Asistencias';
      } else {
        // Capitalize first letter
        displayModule = module.charAt(0).toUpperCase() + module.slice(1);
      }

      if (!groups[displayModule]) {
        groups[displayModule] = [];
      }
      groups[displayModule].push(p);
    });

    // Convert map to array of groups
    return Object.keys(groups).map(key => ({
      moduleName: key,
      permissions: groups[key]
    }));
  });

  loading = signal(false);
  permissionsLoading = signal(true);
  saving = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit() {
    if (this.isEditing()) {
      this.loading.set(true);
      forkJoin({
        permissions: this.roleService.getPermissions(),
        roleDetail: this.roleService.getById(this.userId!)
      }).subscribe({
        next: ({ permissions, roleDetail }) => {
          this.availablePermissions.set(permissions);
          this.form.patchValue({
            name: roleDetail.name,
            description: roleDetail.description ?? ''
          });
          const assignedIds = roleDetail.permissions.map(p => p.id);
          this.selectedPermissions.set(assignedIds);
          this.loading.set(false);
          this.permissionsLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('No se pudieron cargar los datos del rol.');
          this.loading.set(false);
          this.permissionsLoading.set(false);
        }
      });
    } else {
      this.roleService.getPermissions().subscribe({
        next: (perms) => {
          this.availablePermissions.set(perms);
          this.permissionsLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('No se pudieron cargar los permisos del sistema.');
          this.permissionsLoading.set(false);
        }
      });
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const name = this.form.value.name!;
    const description = this.form.value.description || null;

    if (this.isEditing()) {
      const roleId = this.userId!;
      this.roleService.update(roleId, { name, description }).pipe(
        switchMap(() => this.roleService.assignPermissions(roleId, { PermissionIds: this.selectedPermissions() }))
      ).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rol y permisos actualizados correctamente.'
          });
          setTimeout(() => this.router.navigate(['/roles']), 1000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.detail ?? 'No se pudo actualizar el rol.');
          this.saving.set(false);
        }
      });
    } else {
      this.roleService.create({ name, description }).pipe(
        switchMap((res) => {
          const newId = res.id;
          return this.roleService.assignPermissions(newId, { PermissionIds: this.selectedPermissions() });
        })
      ).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rol creado y permisos asignados correctamente.'
          });
          setTimeout(() => this.router.navigate(['/roles']), 1000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.detail ?? 'No se pudo crear el rol.');
          this.saving.set(false);
        }
      });
    }
  }

  isFieldInvalid(field: string) {
    const control = this.form.get(field);
    return control?.invalid && control?.touched;
  }

  goBack() {
    this.router.navigate(['/roles']);
  }

  getModuleIcon(moduleName: string): string {
    switch (moduleName.toLowerCase()) {
      case 'usuarios': return 'pi pi-users';
      case 'sucursales': return 'pi pi-building';
      case 'roles': return 'pi pi-shield';
      case 'asistencias': return 'pi pi-calendar-plus';
      default: return 'pi pi-cog';
    }
  }

  formatPermissionName(name: string): string {
    let action = name;
    if (name.includes('.')) {
      action = name.split('.')[1];
    } else if (name.includes(':')) {
      action = name.split(':')[1];
    }

    const actionLower = action.toLowerCase().trim();
    switch (actionLower) {
      case 'read':
      case 'list':
      case 'get':
        return 'Leer / Listar';
      case 'create':
      case 'add':
      case 'write':
        return 'Crear / Agregar';
      case 'update':
      case 'edit':
        return 'Editar / Actualizar';
      case 'delete':
      case 'remove':
        return 'Eliminar';
      default:
        return action.charAt(0).toUpperCase() + action.slice(1);
    }
  }
}
