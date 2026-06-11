import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { switchMap, of } from 'rxjs';
import { UsuarioService } from '../services/usuario.service';
import { RolService } from '../../roles/services/rol.service';
import { RolResponse } from '../../roles/models/rol.models';
import { CardModule } from 'primeng/card';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-crear-editar-usuario',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule,
    PasswordModule, SelectModule, ToastModule, MessageModule,
    SkeletonModule, FileUploadModule, CardModule, ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './crear-editar-usuario.html'
})
export class CrearEditarUsuario implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  fotoPreview = signal<string | null>(null);
  fotoArchivo = signal<File | null>(null);

  usuarioId = this.route.snapshot.paramMap.get('id');
  esEdicion = computed(() => !!this.usuarioId);

  roles = signal<RolResponse[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  errorMensaje = signal<string | null>(null);

  form = this.fb.group({
    nombre: ['', Validators.required],
    nombreUsuario: ['', [Validators.required, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', Validators.email],
    telefono: [''],
    fotoPerfil: [null as string | null],
    rolId: ['', Validators.required],
    activo: [true, Validators.required]
  });

  estadoOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  ngOnInit() {
    this.rolService.obtenerTodos().subscribe({
      next: data => this.roles.set(data),
      error: () => this.errorMensaje.set('No se pudieron cargar los roles.')
    });

    if (this.esEdicion()) {
      this.cargando.set(true);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();

      this.usuarioService.obtenerPorId(this.usuarioId!).subscribe({
        next: usuario => {
          console.log(usuario);
          this.form.patchValue({
            nombre: usuario.nombre,
            nombreUsuario: usuario.nombreUsuario,
            email: usuario.email,
            telefono: usuario.telefono,
            fotoPerfil: usuario.fotoPerfil,
            rolId: usuario.rolId,
            activo: usuario.activo ?? true
          });

          if (usuario.fotoPerfil) {
            this.fotoPreview.set(`${environment.serverUrl}${usuario.fotoPerfil}`);
          }

          this.cargando.set(false);
        },
        error: () => {
          this.errorMensaje.set('No se pudo cargar el usuario.');
          this.cargando.set(false);
        }
      });
    }
  }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.errorMensaje.set(null);

    this.procesarFotoYGuardar();
  }

  private procesarFotoYGuardar() {
    if (!this.fotoArchivo()) {
      this.ejecutarGuardado().subscribe({
        next: (res: any) => this.onExito(res),
        error: (err) => this.onError(err)
      });
      return;
    }

    const formData = new FormData();
    formData.append('foto', this.fotoArchivo()!);

    this.usuarioService.subirFoto(formData).pipe(
      switchMap(res => {
        this.form.patchValue({ fotoPerfil: res.url });
        return this.ejecutarGuardado();
      })
    ).subscribe({
      next: (res: any) => this.onExito(res),
      error: (err) => this.onError(err)
    });
  }

  private ejecutarGuardado() {
    const payload = this.construirPayload();
    return this.esEdicion()
      ? this.usuarioService.editar(this.usuarioId!, payload)
      : this.usuarioService.crear(payload);
  }

  private construirPayload() {
    const v = this.form.getRawValue();
    const base: any = {
      nombre: v.nombre,
      nombreUsuario: v.nombreUsuario,
      email: v.email?.trim() || null,
      telefono: v.telefono?.trim() || null,
      fotoPerfil: v.fotoPerfil || null,
      rolId: v.rolId,
      activo: v.activo ?? true
    };
    if (!this.esEdicion()) base.password = v.password;
    return base;
  }

  private onExito(res?: any) {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: this.esEdicion() ? 'Usuario actualizado.' : 'Usuario creado.'
    });
    if (this.esEdicion()) {
      this.guardando.set(false);
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
    this.errorMensaje.set(detalle);
    this.guardando.set(false);
  }

  onFotoSeleccionada(event: any) {
    const archivo: File = event.files[0];
    if (!archivo) return;
    this.fotoPreview.set(URL.createObjectURL(archivo));
    this.fotoArchivo.set(archivo);
  }

  onFotoError(event: any) {
    this.errorMensaje.set('La imagen no cumple los requisitos (máx. 2MB, JPG/PNG/WEBP).');
  }

  onArchivoRemovido() {
    this.limpiarFoto();
  }

  limpiarFoto() {
    const preview = this.fotoPreview();
    if (preview?.startsWith('blob:'))
      URL.revokeObjectURL(preview);
    this.fotoPreview.set(null);
    this.fotoArchivo.set(null);
    this.form.patchValue({ fotoPerfil: null });
  }

  campoInvalido(campo: string) {
    const control = this.form.get(campo);
    return control?.invalid && control?.touched;
  }

  volver() {
    this.router.navigate(['/usuarios']);
  }

  irACrearNuevo() {
    this.router.navigate(['/usuarios/nuevo']);
  }

  confirmarEliminar() {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar a este usuario? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.eliminar()
    });
  }

  eliminar() {
    this.guardando.set(true);
    this.usuarioService.eliminar(this.usuarioId!).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado.' });
        setTimeout(() => this.router.navigate(['/usuarios']), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario.' });
        this.guardando.set(false);
      }
    });
  }

  confirmarVincularEmpleado() {
    this.messageService.add({
      severity: 'info',
      summary: 'Vincular Empleado',
      detail: 'Módulo de vinculación en desarrollo para conectarse con la base de datos de planillas.'
    });
  }
}
