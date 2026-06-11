import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Topbar } from './topbar';
import { Sidebar } from './sidebar';
import { LayoutService } from '../../core/services/layout.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Topbar, Sidebar, ToastModule],
  template: `
    <p-toast />
    <div class="h-screen w-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-550 flex flex-col transition-colors duration-200 overflow-hidden">

  <app-topbar class="shrink-0" />

  <div class="flex flex-1 relative overflow-hidden">

    @if (_layoutService.sidebarVisible()) {
      <div
        (click)="_layoutService.closeSidebar()"
        class="fixed inset-0 bg-black/40 z-20 md:hidden transition-opacity duration-300 animate-fade-in">
      </div>
    }

    <aside [class]="'bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-all duration-300 ease-in-out overflow-hidden ' +
                    'fixed top-0 left-0 h-screen z-30 shadow-2xl md:shadow-none ' +
                    'md:sticky md:top-0 md:h-full md:z-10 ' +
                    (_layoutService.sidebarVisible() ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full md:translate-x-0')">

      <div class="pt-16 md:pt-0 h-full">
        <app-sidebar />
      </div>
    </aside>

    <main class="flex-1 px-6 py-4 transition-all duration-300 ease-in-out overflow-y-auto h-full">
      <router-outlet />
    </main>

  </div>
</div>
  `
})
export class Layout {
  _layoutService = inject(LayoutService);
}
