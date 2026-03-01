import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatIcon],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username = '';
  password = '';
  private isBrowser: boolean;
  private router = inject(Router);

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }

  onLogin(): void {
    if (!this.isBrowser) return;
    console.log('Login:', this.username);
    this.router.navigate(['/home']);
  }
}