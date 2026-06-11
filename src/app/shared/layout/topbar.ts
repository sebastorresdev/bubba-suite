import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';

import { ThemeService } from '../../core/services/theme.service';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    ToolbarModule,
    InputTextModule,
    DividerModule,
    MenuModule
  ],
  template: `
    <div class="card">
      <p-toolbar>
        <ng-template #start>
          <p-button icon="pi pi-bars" class="mr-2" severity="secondary" [outlined]="true"
          (onClick)="_layoutService.toggleSidebar()" />
          <p-divider layout="vertical" />
                <!-- AQUI VA EL LOGO DE LA EMPRESA -->
          <img
          src="https://bubbabags.com.pe/cdn/shop/files/Logo_bubba.webp?v=1712543297&width=300"
          alt="Bubba Bags"
          class="h-8 w-auto object-contain transition-all duration-300 dark:invert"/>
        </ng-template>
        
        <ng-template #center>
          <p-iconfield iconPosition="left">
            <p-inputicon class="pi pi-search text-surface-400" />
            <input type="text" pInputText placeholder="Search..." />
          </p-iconfield>
        </ng-template>
        
        <ng-template #end>
          <div class="flex items-center gap-2">
            <!-- Botón de Tema (Sol/Luna) -->
            <p-button
              [icon]="_themeService.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"
              severity="secondary"
              [outlined]="true"
              (onClick)="_themeService.toggleTheme()"/>

            <!-- Icono adicional: Notificaciones -->
            <p-button
              icon="pi pi-bell"
              severity="secondary"
              [outlined]="true"
            />

            <!-- Icono adicional: Ajustes Rápidos -->
            <p-button
              icon="pi pi-sliders-h"
              severity="secondary"
              [outlined]="true"
            />

            <span class="w-[1px] h-6 bg-surface-200 dark:bg-surface-800 mx-2"></span>

            <!-- Perfil del usuario con dropdown -->
            <p-button
              icon="pi pi-user"
              [label]="nombreUsuario()"
              severity="secondary"
              [outlined]="true"
              (onClick)="userMenu.toggle($event)"
            />
            <p-menu #userMenu [model]="userMenuItems" [popup]="true" />
          </div>
        </ng-template>
      </p-toolbar>
    </div>
    `
})
export class Topbar implements OnInit {
  userMenuItems: MenuItem[] | undefined;
  
  _themeService = inject(ThemeService);
  _layoutService = inject(LayoutService);
  _authService = inject(AuthService);

  nombreUsuario = this._authService.nombreUsuario;

  ngOnInit() {
    this.userMenuItems = [
      {
        label: 'Ajustes del Sistema',
        icon: 'pi pi-cog',
        routerLink: '/configuracion'
      },
      {
        separator: true
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => {
          this._authService.logout();
        }
      }
    ];
  }
}
