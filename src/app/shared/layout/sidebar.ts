import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NAVIGATION_CONFIG } from '../../core/config/navigation.config';

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
                       [class.text-primary-500]="activeSubMenu() === item.label || hasActiveChild(item)"></i>
                    <span class="flex-1 transition-colors"
                          [class.text-primary-600]="activeSubMenu() === item.label || hasActiveChild(item)"
                          [class.font-semibold]="activeSubMenu() === item.label || hasActiveChild(item)">
                      {{ item.label }}
                    </span>
                    <i class="pi pi-chevron-down text-xs text-surface-400 transition-transform duration-200"
                       [class.rotate-180]="activeSubMenu() === item.label"></i>
                  </a>

                  <div class="overflow-hidden transition-all duration-300 ease-in-out"
                       [style.max-height]="activeSubMenu() === item.label ? '200px' : '0px'"
                       [style.opacity]="activeSubMenu() === item.label ? '1' : '0'">
                    <div class="pl-3 mt-1 space-y-1 border-l border-surface-200 dark:border-surface-800 ml-6 pb-1">
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
                  </div>
                </div>
              }

            }
          </div>
        }
      </nav>
    </div>
  `
})
export class Sidebar implements OnInit {
  activeSubMenu = signal<string | null>(null);
  private router = inject(Router);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.autoExpandActiveSubmenu();
    });
    // Autoexpandir en carga inicial
    this.autoExpandActiveSubmenu();
  }

  private autoExpandActiveSubmenu() {
    const currentUrl = this.router.url;
    for (const group of this.menuConfig) {
      for (const item of group.items) {
        if (item.subItems) {
          const hasActiveChild = item.subItems.some(sub =>
            currentUrl === sub.routerLink || currentUrl.startsWith(sub.routerLink + '/')
          );
          if (hasActiveChild) {
            this.activeSubMenu.set(item.label);
            return;
          }
        }
      }
    }
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  hasActiveChild(item: any): boolean {
    if (!item.subItems) return false;
    return item.subItems.some((sub: any) => this.isRouteActive(sub.routerLink));
  }

  menuConfig = NAVIGATION_CONFIG;

  toggleSubMenu(menu: string) {
    this.activeSubMenu.update(current => current === menu ? null : menu);
  }
}
