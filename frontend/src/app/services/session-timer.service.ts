import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SessionTimerService {
  private router = inject(Router);
  private timeoutId?: ReturnType<typeof setTimeout>;

  schedule(sessionExpiresAt: string) {
    this.clear();

    const msUntilExpiry = new Date(sessionExpiresAt).getTime() - Date.now();

    if (msUntilExpiry <= 0) {
      this.router.navigateByUrl('/session-expired');
      return;
    }

    this.timeoutId = setTimeout(() => {
      this.router.navigateByUrl('/session-expired');
    }, msUntilExpiry);
  }

  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}