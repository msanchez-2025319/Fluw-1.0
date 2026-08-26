import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-expired',
  imports: [],
  templateUrl: './session-expired.html',
  styleUrl: './session-expired.css',
})
export class SessionExpired {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}