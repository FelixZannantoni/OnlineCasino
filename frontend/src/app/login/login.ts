import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  isSignUp = false;
  isBrowser: boolean;
  private router = inject(Router);

  // Login fields
  loginEmail = '';
  loginPassword = '';

  // Register fields
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  passwordConfirm = '';

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.updateContainerClass();
  }

  togglePanel(signUp: boolean): void {
    if (!this.isBrowser) return;
    this.isSignUp = signUp;
    this.updateContainerClass();
  }

  private updateContainerClass(): void {
    const container = document.getElementById('login-container');
    if (container) {
      container.classList.toggle('right-panel-active', this.isSignUp);
    }
  }

  onLogin(): void {
    console.log('Login:', this.loginEmail);
    // TODO: Connect to backend
    this.router.navigate(['/home']);
  }

  onRegister(): void {
    if (this.registerPassword !== this.passwordConfirm) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Register:', this.registerEmail);
    // TODO: Connect to backend
    this.router.navigate(['/home']);
  }
}