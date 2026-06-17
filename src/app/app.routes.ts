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
            // {
            //     path: 'usuarios/crear',
            //     loadComponent: () => import('./features/usuarios/crear-usuario/crear-usuario')
            //         .then(m => m.CrearUsuario)
            // },
            // {
            //     path: 'usuarios/editar/:id',
            //     loadComponent: () => import('./features/usuarios/editar-usuario/editar-usuario')
            //         .then(m => m.EditarUsuario)
            // },
            // // Roles
            // {
            //     path: 'roles',
            //     loadComponent: () => import('./features/roles/listar-roles/listar-roles')
            //         .then(m => m.ListarRoles)
            // },
            // {
            //     path: 'roles/editar/:id',
            //     loadComponent: () => import('./features/roles/editar-rol/editar-rol')
            //         .then(m => m.EditarRol)
            // }
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
