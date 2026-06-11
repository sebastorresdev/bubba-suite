import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

import { ThemeService } from '../../core/services/theme.service';
import { LayoutService } from '../../core/services/layout.service';


@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ButtonModule,
    IconFieldModule, InputIconModule, SplitButtonModule, ToolbarModule, InputTextModule,
    DividerModule
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
            <p-inputicon class="pi pi-search" />
            <input type="text" pInputText placeholder="Search" />
          </p-iconfield>
        </ng-template>
        <ng-template #end>
          <div class="flex  gap-4">
            <p-button
            [icon]="_themeService.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"
            class="mr-2" severity="secondary"
            [outlined]="true" (onClick)="_themeService.toggleTheme()"/>
            <p-splitbutton label="Save" [model]="items" />
          </div>
        </ng-template>
      </p-toolbar>
    </div>
    `
})
export class Topbar {
  items: MenuItem[] | undefined;
  _themeService = inject(ThemeService);
  _layoutService = inject(LayoutService);

  ngOnInit() {
    this.items = [
      {
        label: 'Update',
        icon: 'pi pi-refresh'
      },
      {
        label: 'Delete',
        icon: 'pi pi-times'
      }
    ];
  }
}
