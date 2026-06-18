import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'login',
        //canActivate: [noAuthGuard],
        loadComponent: () => import('./shared/login/login').then(m => m.Login)
    },
    {
        path: '',
        loadComponent: () => import('./shared/layout/layout').then(m => m.Layout),
        canActivate: [authGuard],
        children: [
          // 💡 Redirección por defecto al Home (Dashboard) cuando entras al Layout
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            {
                path: 'home',
                loadComponent: () => import('./features/home/home').then(m => m.Home)
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./features/usuarios/user-lists/user-list')
                    .then(m => m.UserList)
            },
            {
                path: 'usuarios/nuevo',
                loadComponent: () => import('./features/usuarios/add-edit-users/add-edit-user').then(m => m.AddEditUser)
            },
            {
                path: 'usuarios/editar/:id',
                loadComponent: () => import('./features/usuarios/add-edit-users/add-edit-user').then(m => m.AddEditUser)
            },
            {
                path: 'sucursales',
                loadComponent: () => import('./features/branches/branches-list/branches-list').then(m => m.BranchesList)
            },
            {
                path: 'sucursales/nuevo',
                loadComponent: () => import('./features/branches/add-edit-branches/add-edit-branch').then(m => m.AddEditBranch)
            },
            {
                path: 'sucursales/editar/:id',
                loadComponent: () => import('./features/branches/add-edit-branches/add-edit-branch').then(m => m.AddEditBranch)
            },
            {
                path: '404',
                loadComponent: () => import('./shared/not-found/not-found').then(m => m.NotFound)
            },
            // Si la ruta no existe PERO el usuario ya cruzó el authGuard, lo mandamos al 404 interno
            { path: '**', redirectTo: '404' }
        ]
    },
    { path: '**', redirectTo: '/login' }
];
