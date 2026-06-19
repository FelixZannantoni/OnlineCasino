import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { DataService } from '../services/data-service';

// Custom validator: passwords must match
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('registerPassword');
  const confirm = control.get('passwordConfirm');
  if (!password || !confirm) return null;
  return password.value === confirm.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  isSignUp = false;
  isBrowser: boolean;
  private router = inject(Router);
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);

  showLoginPassword = false;
  showRegisterPassword = false;
  showRegisterPasswordConfirm = false;

  loginError = '';
  registerError = '';

  loginForm: FormGroup = this.fb.group({
    loginEmail: ['', [Validators.required, Validators.minLength(3)]],
    loginPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  registerForm: FormGroup = this.fb.group({
    registerName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^\S+$/)]],
    registerDisplayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    registerEmail: ['', [Validators.required, Validators.email]],
    registerPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    ]],
    passwordConfirm: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;
    this.updateContainerClass();
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('code');
    if (myParam) {
      await this.handleGithubLoginWithCode(myParam);
    }
  }

  async handleGithubLoginWithCode(code: string): Promise<void> {
    const res = await fetch('/users/login/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) {
      this.loginError = 'GitHub login failed. Please try again.';
      return;
    }
    const userId = (await res.json()).userId;
    localStorage.setItem('userId', userId);
    this.dataService.userId.set(userId);
    this.router.navigate(['/home']);
  }

  togglePanel(signUp: boolean): void {
    if (!this.isBrowser) return;
    this.isSignUp = signUp;
    this.loginError = '';
    this.registerError = '';
    this.updateContainerClass();
  }

  private updateContainerClass(): void {
    const container = document.getElementById('login-container');
    if (container) {
      container.classList.toggle('right-panel-active', this.isSignUp);
    }
  }

  togglePasswordVisibility(field: 'login' | 'register' | 'confirm'): void {
    if (field === 'login') this.showLoginPassword = !this.showLoginPassword;
    else if (field === 'register') this.showRegisterPassword = !this.showRegisterPassword;
    else this.showRegisterPasswordConfirm = !this.showRegisterPasswordConfirm;
  }

  // Helper getters for template
  get lf() { return this.loginForm.controls; }
  get rf() { return this.registerForm.controls; }

  fieldError(form: FormGroup, name: string, errorKey: string): boolean {
    const ctrl = form.get(name);
    return !!(ctrl && ctrl.touched && ctrl.errors?.[errorKey]);
  }

  async onLogin(): Promise<void> {
    this.loginError = '';
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;
    if (!this.isBrowser) return;

    try {
      const res = await fetch('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.loginForm.value.loginEmail,
          password: this.loginForm.value.loginPassword
        })
      });

      if (res.status === 401) { this.loginError = 'Incorrect username or password.'; return; }
      if (res.status === 404) { this.loginError = 'No account found with that username.'; return; }
      if (!res.ok) { this.loginError = 'Login failed. Please try again later.'; return; }

      const userId = (await res.json()).userId;
      localStorage.setItem('userId', userId);
      this.dataService.userId.set(userId);
      this.router.navigate(['/home']);
    } catch {
      this.loginError = 'Network error. Check your connection and try again.';
    }
  }

  async onRegister(): Promise<void> {
    this.registerError = '';
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    if (!this.isBrowser) return;

    try {
      const res = await fetch('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.registerForm.value.registerName,
          email: this.registerForm.value.registerEmail,
          password: this.registerForm.value.registerPassword
        })
      });

      if (res.status === 409) { this.registerError = 'Username or email is already taken.'; return; }
      if (!res.ok) { this.registerError = 'Registration failed. Please try again later.'; return; }

      const userId = (await res.json()).userId;
      localStorage.setItem('userId', userId);
      this.dataService.userId.set(userId);
      this.router.navigate(['/home']);
    } catch {
      this.registerError = 'Network error. Check your connection and try again.';
    }
  }

  handleGithubLogin() {
    if (!this.isBrowser) return;
    const GITHUB_CLIENT_ID = 'Ov23liyXKzvf4zPI8g7J';
    const REDIRECT_URI = '/login';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:user`;
  }
}
