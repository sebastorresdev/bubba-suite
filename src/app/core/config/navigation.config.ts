export interface NavigationSubItem {
  label: string;
  routerLink: string;
  keywords?: string[];
}

export interface NavigationItem {
  label: string;
  icon: string;
  routerLink?: string;
  subItems?: NavigationSubItem[];
  keywords?: string[];
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export const NAVIGATION_CONFIG: NavigationGroup[] = [
  {
    title: 'Principal',
    items: [
      { 
        label: 'Dashboard / Inicio', 
        icon: 'pi pi-home', 
        routerLink: '/home', 
        keywords: ['inicio', 'dashboard', 'home', 'principal', 'ver', 'kpis', 'estadisticas'] 
      },
      { 
        label: 'Indicadores KPI', 
        icon: 'pi pi-chart-bar', 
        routerLink: '/kpis', 
        keywords: ['kpi', 'indicadores', 'graficos', 'metricas', 'reportes', 'analisis'] 
      }
    ]
  },
  {
    title: 'Administración',
    items: [
      {
        label: 'Usuarios',
        icon: 'pi pi-users',
        subItems: [
          { label: 'Listar Usuarios', routerLink: '/usuarios', keywords: ['listar', 'usuarios', 'ver', 'colaboradores', 'users', 'list', 'personas'] },
          { label: 'Asignar Permisos', routerLink: '/usuarios/permisos', keywords: ['asignar', 'permisos', 'usuarios', 'accesos', 'roles', 'seguridad'] },
          { label: 'Historial de Accesos', routerLink: '/usuarios/logs', keywords: ['historial', 'accesos', 'logs', 'usuarios', 'bitacora', 'auditoria'] }
        ],
        keywords: ['usuarios', 'colaboradores', 'users', 'personas']
      },
      { 
        label: 'Roles y Permisos', 
        icon: 'pi pi-shield', 
        routerLink: '/roles', 
        keywords: ['roles', 'permisos', 'privilegios', 'list', 'shields', 'seguridad', 'acceso'] 
      },
      { 
        label: 'Empleados', 
        icon: 'pi pi-id-card', 
        routerLink: '/empleados', 
        keywords: ['empleados', 'trabajadores', 'personal', 'staff', 'employees', 'asistencia', 'marcacion', 'rfid', 'pin'] 
      },
      { 
        label: 'Sucursales', 
        icon: 'pi pi-building', 
        routerLink: '/sucursales', 
        keywords: ['listar', 'sucursales', 'sedes', 'locales', 'branches', 'list', 'tiendas', 'almacenes'] 
      }
    ]
  },
  {
    title: 'Configuración',
    items: [
      { 
        label: 'Ajustes Generales', 
        icon: 'pi pi-sliders-h', 
        routerLink: '/configuracion', 
        keywords: ['ajustes', 'configuracion', 'settings', 'sistema', 'general', 'opciones'] 
      },
      { 
        label: 'Auditoría del Sistema', 
        icon: 'pi pi-eye', 
        routerLink: '/auditoria', 
        keywords: ['auditoria', 'logs', 'seguridad', 'verificacion', 'historial', 'accesos'] 
      }
    ]
  }
];
