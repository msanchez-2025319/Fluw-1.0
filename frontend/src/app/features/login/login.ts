import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { SessionTimerService } from '../../services/session-timer.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  form;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionTimer: SessionTimerService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();

    this.authService.login(email!, password!).subscribe({
      next: (response) => {
        this.loading.set(false);

        this.sessionTimer.schedule(response.sessionExpiresAt);

        this.router.navigateByUrl('/dashboard');
      },

      error: (err) => {
        this.loading.set(false);

        this.errorMessage.set(
          err.error?.message || 'No se pudo iniciar sesión. Intenta de nuevo.'
        );
      },
    });
  }
}