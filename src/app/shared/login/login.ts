import { Component } from '@angular/core';
import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule,
    IconFieldModule, InputIconModule,CardModule
  ],
  templateUrl: './login.html'
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  cargando = signal(false);
  errorMensaje = signal<string | null>(null);

  form = this.fb.group({
    nombreUsuario: ['', Validators.required],
    password: ['', Validators.required]
  });

  iniciarSesion() {
    if (this.form.invalid) return;
    this.cargando.set(true);
    this.errorMensaje.set(null);

    const { nombreUsuario, password } = this.form.getRawValue();
    console.log(`nombre de usuario ${nombreUsuario} y contraseña ${password}`)

    this.authService.login(nombreUsuario!, password!).subscribe({
      next: (response) =>
      {
        console.log(response)
        this.router.navigate(['/home']);
      },

      error: (err) => {
        console.log(err);
        this.errorMensaje.set(
          err.status === 401
            ? 'Usuario o contraseña incorrectos.'
            : 'Error al conectar con el servidor.'
        );
        this.cargando.set(false);
      }
    });
  }
}
