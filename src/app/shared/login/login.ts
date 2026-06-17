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

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  login() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.form.getRawValue();
    console.log(`username ${username} and password ${password}`)

    this.authService.login(username!, password!).subscribe({
      next: (response) =>
      {
        console.log(response)
        this.router.navigate(['/home']);
      },

      error: (err) => {
        console.log(err);
        this.errorMessage.set(
          err.status === 401
            ? 'Incorrect username or password.'
            : 'Error connecting to the server.'
        );
        this.loading.set(false);
      }
    });
  }
}
