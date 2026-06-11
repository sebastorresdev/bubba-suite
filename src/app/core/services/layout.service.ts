import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // 🎯 True = Menú abierto/expandido, False = Menú cerrado/colapsado
  sidebarVisible = signal<boolean>(true);

  toggleSidebar(): void {
    this.sidebarVisible.update(visible => !visible);
  }

  closeSidebar(): void {
    this.sidebarVisible.set(false);
  }

  openSidebar(): void {
    this.sidebarVisible.set(true);
  }
}
