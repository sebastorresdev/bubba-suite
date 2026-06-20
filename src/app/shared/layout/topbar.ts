import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { NAVIGATION_CONFIG } from '../../core/config/navigation.config';
import { ThemeService } from '../../core/services/theme.service';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';

interface SearchRouteItem {
  label: string;
  category: string;
  route: string;
  icon: string;
  keywords: string[];
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
          <div class="relative w-full md:w-80">
            <p-iconfield iconPosition="left">
              <p-inputicon class="pi pi-search text-surface-400" />
              <input type="text"
                     pInputText
                     [(ngModel)]="searchQuery"
                     (input)="onSearchInput()"
                     (focus)="showResults.set(true)"
                     (blur)="onBlur()"
                     (keydown.arrowdown)="onKeyDownArrowDown($event)"
                     (keydown.arrowup)="onKeyDownArrowUp($event)"
                     (keydown.enter)="onKeyDownEnter($event)"
                     (keydown.escape)="onKeyDownEscape($event)"
                     placeholder="Buscar sección o página..."
                     class="w-full"
                     pSize="small" />
            </p-iconfield>

            <!-- Panel de Resultados de Navegación Rápida -->
            @if (showResults() && searchQuery.trim().length >= 2) {
              <div class="absolute top-full left-0 right-0 mt-2 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto p-2 flex flex-col gap-1 min-w-[290px] animate-fade-in">
                
                @if (filteredItems().length === 0) {
                  <div class="text-center py-4 text-sm text-surface-400">
                    No se encontraron secciones para "{{ searchQuery }}"
                  </div>
                } @else {
                  @for (item of filteredItems(); track item.route; let idx = $index) {
                    <div (mousedown)="navigateTo(item.route)"
                         (mouseenter)="activeItemIndex.set(idx)"
                         [class.bg-surface-100]="activeItemIndex() === idx"
                         [class.dark:bg-surface-800/80]="activeItemIndex() === idx"
                         [class.search-suggestion-active]="activeItemIndex() === idx"
                         class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/40 cursor-pointer transition-all duration-150">
                      <div class="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 flex items-center justify-center shrink-0">
                        <i [class]="item.icon + ' text-surface-500'"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-semibold text-surface-800 dark:text-surface-100 truncate">{{ item.label }}</div>
                        <div class="text-[9px] text-surface-400 dark:text-surface-500 uppercase tracking-wider font-bold">{{ item.category }}</div>
                      </div>
                      <i class="pi pi-chevron-right text-[10px] text-surface-300 shrink-0"></i>
                    </div>
                  }
                }
              </div>
            }
          </div>
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

            <span class="w-px h-6 bg-surface-200 dark:bg-surface-800 mx-2"></span>

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
  private router = inject(Router);

  nombreUsuario = this._authService.username;

  searchQuery = '';
  showResults = signal(false);

  navigationItems: SearchRouteItem[] = [];
  filteredItems = signal<SearchRouteItem[]>([]);
  activeItemIndex = signal<number>(-1);

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
    this.buildSearchCatalog();
  }

  private buildSearchCatalog() {
    const catalog: SearchRouteItem[] = [];
    NAVIGATION_CONFIG.forEach(group => {
      group.items.forEach(item => {
        if (item.routerLink) {
          catalog.push({
            label: item.label,
            category: group.title,
            route: item.routerLink,
            icon: item.icon,
            keywords: item.keywords || []
          });
        }
        if (item.subItems) {
          item.subItems.forEach(sub => {
            catalog.push({
              label: sub.label,
              category: `${group.title} › ${item.label}`,
              route: sub.routerLink,
              icon: item.icon,
              keywords: sub.keywords || []
            });
          });
        }
      });
    });
    this.navigationItems = catalog;
  }

  onSearchInput() {
    const query = this.searchQuery.trim().toLowerCase();
    if (query.length < 2) {
      this.filteredItems.set([]);
      this.activeItemIndex.set(-1);
      return;
    }

    const matched = this.navigationItems.filter(item =>
      item.label.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords.some(kw => kw.includes(query))
    );

    this.filteredItems.set(matched);
    this.activeItemIndex.set(-1);
  }

  onKeyDownArrowDown(event: Event) {
    event.preventDefault();
    const items = this.filteredItems();
    if (items.length === 0) return;
    this.activeItemIndex.update(idx => (idx + 1) % items.length);
    this.scrollActiveIntoView();
  }

  onKeyDownArrowUp(event: Event) {
    event.preventDefault();
    const items = this.filteredItems();
    if (items.length === 0) return;
    this.activeItemIndex.update(idx => (idx - 1 + items.length) % items.length);
    this.scrollActiveIntoView();
  }

  onKeyDownEnter(event: Event) {
    const idx = this.activeItemIndex();
    const items = this.filteredItems();
    if (idx >= 0 && idx < items.length) {
      event.preventDefault();
      this.navigateTo(items[idx].route);
    }
  }

  onKeyDownEscape(event: Event) {
    this.showResults.set(false);
    this.activeItemIndex.set(-1);
  }

  private scrollActiveIntoView() {
    setTimeout(() => {
      const activeEl = document.querySelector('.search-suggestion-active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigateByUrl(path);
    this.searchQuery = '';
    this.showResults.set(false);
    this.activeItemIndex.set(-1);
  }

  onBlur() {
    setTimeout(() => {
      this.showResults.set(false);
    }, 200);
  }
}
