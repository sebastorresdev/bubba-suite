import { Component, inject, signal, OnInit } from '@angular/core';
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
import { UsuarioService } from '../services/usuario.service';
import { UsuarioResponse } from '../models/usuario.models';
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
  providers: [ConfirmationService, MessageService],
  templateUrl: './listar-usuarios.html'
})
export class ListarUsuarios implements OnInit {
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  usuarios = signal<UsuarioResponse[]>([]);
  cargando = signal(false);
  errorMensaje = signal<string | null>(null);
  buscarGlobal = '';
  options: any[] = ['list', 'grid'];
  layout: 'list' | 'grid' = 'grid';


  ngOnInit() { this.cargarUsuarios(); }

  cargarUsuarios() {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.usuarioService.obtenerTodos().subscribe({
      next: data => { this.usuarios.set(data); this.cargando.set(false); },
      error: () => { this.errorMensaje.set('Error al cargar los usuarios.'); this.cargando.set(false); }
    });
  }

  irACrear() { this.router.navigate(['/usuarios/nuevo']); }
  irAEditar(id: string) { this.router.navigate(['/usuarios/editar', id]); }

  confirmarEliminar(usuario: UsuarioResponse) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar a <strong>${usuario.nombre}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.eliminar(usuario)
    });
  }

  eliminar(usuario: UsuarioResponse) {
    this.usuarioService.eliminar(usuario.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado.' });
        this.cargarUsuarios();
      },
      error: (err) => {
        if (err.status === 409) {
          // Tiene registros asociados — sugiere archivar
          this.confirmarArchivar(usuario, err.error?.detail);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario.' });
        }
      }
    });
  }

  confirmarArchivar(usuario: UsuarioResponse, detalle?: string) {
    this.confirmationService.confirm({
      message: `${detalle ?? 'El usuario tiene registros asociados.'} <br/><br/>¿Desea archivarlo en su lugar?`,
      header: 'No se puede eliminar',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Archivar',
      rejectLabel: 'Cancelar',
      accept: () => this.archivar(usuario.id)
    });
  }

  archivar(id: string) {
    this.usuarioService.archivar(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Archivado', detail: 'Usuario archivado correctamente.' });
        this.cargarUsuarios();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo archivar el usuario.' })
    });
  }

  iniciales(nombre: string) {
    return nombre.substring(0, 2).toUpperCase();
  }

  obtenerRutaFoto(fotoUrl: string): string {
    if (!fotoUrl) return '';
    return `${environment.serverUrl}${fotoUrl}`;
  }
}
