import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionTimerService {
  private router = inject(Router);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  private timeoutId?: ReturnType<typeof setTimeout>;
  private activityHandler?: () => void;

  private sessionExpiresAt = 0;
  private lastActivity = 0;
  private refreshing = false;

  schedule(sessionExpiresAt: string) {
    this.clear();

    this.sessionExpiresAt = new Date(sessionExpiresAt).getTime();
    this.lastActivity = Date.now();

    this.startListening();

    this.ngZone.runOutsideAngular(() => {
      this.armTimeout();
    });
  }

  private armTimeout() {
    this.clearTimeoutOnly();

    const remaining = this.sessionExpiresAt - Date.now();

    if (remaining <= 0) {
      this.expire();
      return;
    }

    // Revisa el estado de la sesión cada 30s.
    this.timeoutId = setTimeout(() => {
      this.check();
    }, Math.min(remaining, 30_000));
  }

  private check() {
    const now = Date.now();

    if (now >= this.sessionExpiresAt) {
      this.expire();
      return;
    }

    const hasActivity = now - this.lastActivity < 30_000;

    if (hasActivity && !this.refreshing) {
      this.renew();
    } else {
      this.armTimeout();
    }
  }

  private renew() {
    this.refreshing = true;

    this.authService.refresh().subscribe({
      next: (response) => {
        this.refreshing = false;
        this.sessionExpiresAt = new Date(
          response.sessionExpiresAt
        ).getTime();
        this.armTimeout();
      },
      error: () => {
        this.refreshing = false;
        this.armTimeout();
      },
    });
  }

  private expire() {
    this.clear();
    this.router.navigateByUrl('/session-expired');
  }

  private startListening() {
    this.stopListening();

    const handler = () => {
      this.lastActivity = Date.now();
    };

    this.activityHandler = handler;

    document.addEventListener('mousemove', handler);
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('scroll', handler);
  }

  private stopListening() {
    if (this.activityHandler) {
      document.removeEventListener('mousemove', this.activityHandler);
      document.removeEventListener('mousedown', this.activityHandler);
      document.removeEventListener('keydown', this.activityHandler);
      document.removeEventListener('touchstart', this.activityHandler);
      document.removeEventListener('scroll', this.activityHandler);
      this.activityHandler = undefined;
    }
  }

  private clearTimeoutOnly() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  clear() {
    this.clearTimeoutOnly();
    this.stopListening();
  }
}
