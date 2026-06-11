import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SubMenuItem {
  label: string;
  routerLink: string;
}

interface MenuGroup {
  title: string;
  items: {
    label: string;
    icon: string;
    routerLink?: string;
    subItems?: SubMenuItem[];
  }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="h-full w-full flex flex-col p-4 bg-surface-0 dark:bg-surface-900 select-none">

      <nav class="space-y-4 overflow-y-auto flex-1 pr-1">

        @for (group of menuConfig; track group.title) {
          <div class="space-y-1">

            <h2 class="text-base font-bold text-surface-400 dark:text-surface-500 px-4 py-2">
              {{ group.title }}
            </h2>

            @for (item of group.items; track item.label) {

              @if (!item.subItems) {
                <a [routerLink]="item.routerLink"
                   [routerLinkActiveOptions]="{ exact: true }"
                   routerLinkActive="bg-primary-50! dark:bg-primary-950/20! text-primary-600! dark:text-primary-400! font-semibold"
                   class="flex items-center gap-3 px-4 py-3 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/60 rounded-lg transition-all duration-150 group text-base cursor-pointer">

                  <i [class]="item.icon + ' text-lg text-surface-400 group-hover:text-primary-500 transition-colors'"></i>
                  <span class="flex-1">{{ item.label }}</span>
                </a>
              }

              @else {
                <div>
                  <a (click)="toggleSubMenu(item.label)"
                     class="flex items-center gap-3 px-4 py-3 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/60 rounded-lg transition-all duration-150 group text-base cursor-pointer">
                    <i [class]="item.icon + ' text-lg text-surface-400 group-hover:text-primary-500 transition-colors'"
                       [class.text-primary-500]="activeSubMenu() === item.label"></i>
                    <span class="flex-1 transition-colors"
                          [class.text-primary-600]="activeSubMenu() === item.label"
                          [class.font-semibold]="activeSubMenu() === item.label">
                      {{ item.label }}
                    </span>
                    <i class="pi pi-chevron-down text-xs text-surface-400 transition-transform duration-200"
                       [class.rotate-180]="activeSubMenu() === item.label"></i>
                  </a>

                  @if (activeSubMenu() === item.label) {
                    <div class="pl-3 mt-1 space-y-1 border-l border-surface-200 dark:border-surface-800 ml-6">
                      @for (sub of item.subItems; track sub.label) {
                        <a [routerLink]="sub.routerLink"
                           [routerLinkActiveOptions]="{ exact: true }"
                           routerLinkActive="bg-primary-50! dark:bg-primary-950/20! text-primary-600! dark:text-primary-400! font-semibold"
                           #subRla="routerLinkActive"
                           class="flex items-center gap-3 px-4 py-2.5 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/60 rounded-lg transition-all duration-150 group text-base cursor-pointer">

                          <i class="pi pi-circle-fill text-[6px] text-surface-300 dark:text-surface-600 group-hover:text-primary-400 transition-colors"
                             [class.text-primary-500]="subRla.isActive"></i>

                          <span class="flex-1">{{ sub.label }}</span>
                        </a>
                      }
                    </div>
                  }
                </div>
              }

            }
          </div>
        }
      </nav>
    </div>
  `
})
export class Sidebar {
  activeSubMenu = signal<string | null>(null);

  // Array robusto con todos tus módulos de prueba completos, limpio de badges
  menuConfig: MenuGroup[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/home' },
        { label: 'Indicadores KPI', icon: 'pi pi-chart-bar', routerLink: '/kpis' }
      ]
    },
    {
      title: 'Operaciones',
      items: [
        { label: 'Órdenes de Trabajo', icon: 'pi pi-file-edit', routerLink: '/ordenes' },
        {
          label: 'Mantenimiento',
          icon: 'pi pi-cog',
          subItems: [
            { label: 'Correctivos', routerLink: '/mantenimiento/correctivos' },
            { label: 'Preventivos', routerLink: '/mantenimiento/preventivos' },
            { label: 'Calendario Anual', routerLink: '/mantenimiento/calendario' }
          ]
        },
        { label: 'Hojas de Ruta', icon: 'pi pi-map-marker', routerLink: '/rutas' }
      ]
    },
    {
      title: 'Inventario',
      items: [
        { label: 'Stock de Repuestos', icon: 'pi pi-box', routerLink: '/inventario/repuestos' },
        {
          label: 'Proveedores',
          icon: 'pi pi-truck',
          subItems: [
            { label: 'Listado Oficial', routerLink: '/proveedores' },
            { label: 'Evaluación de Servicio', routerLink: '/proveedores/evaluacion' }
          ]
        },
        { label: 'Compras y Órdenes', icon: 'pi pi-shopping-cart', routerLink: '/compras' }
      ]
    },
    {
      title: 'Administración',
      items: [
        {
          label: 'Usuarios',
          icon: 'pi pi-users',
          subItems: [
            { label: 'Listar Usuarios', routerLink: '/usuarios' },
            { label: 'Asignar Permisos', routerLink: '/usuarios/permisos' },
            { label: 'Historial de Accesos', routerLink: '/usuarios/logs' }
          ]
        },
        { label: 'Roles y Permisos', icon: 'pi pi-shield', routerLink: '/roles' },
        { label: 'Sucursales', icon: 'pi pi-building', routerLink: '/sucursales' }
      ]
    },
    {
      title: 'Configuración',
      items: [
        { label: 'Ajustes Generales', icon: 'pi pi-sliders-h', routerLink: '/configuracion' },
        { label: 'Auditoría del Sistema', icon: 'pi pi-eye', routerLink: '/auditoria' }
      ]
    }
  ];

  toggleSubMenu(menu: string) {
    this.activeSubMenu.update(current => current === menu ? null : menu);
  }
}
