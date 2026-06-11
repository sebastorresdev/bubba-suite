import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError(error => {
            switch (error.status) {
                case 401:
                    router.navigate(['/login']);
                    break;
                case 403:
                    router.navigate(['/403']);
                    break;
            }
            return throwError(() => error);
        })
    );
};
