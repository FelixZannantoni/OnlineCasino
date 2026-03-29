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

  loginEmail = '';
  loginPassword = '';
  showLoginPassword = false;
  registerName = '';
  registerDisplayName = '';
  registerEmail = '';
  registerPassword = '';
  showRegisterPassword = false;
  passwordConfirm = '';
  showRegisterPasswordConfirm = false;

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;
    this.updateContainerClass();
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('code');
    
    const res = await fetch('http://localhost:3000/users/login/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: myParam
      })
    });

    if(!res.ok) {
      alert('Login failed: ' + res.statusText);
      return;
    }
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

  togglePasswordVisibility(field: 'login' | 'register' | 'confirm'): void {
    if (field === 'login') {
      this.showLoginPassword = !this.showLoginPassword;
    } else if (field === 'register') {
      this.showRegisterPassword = !this.showRegisterPassword;
    } else if (field === 'confirm') {
      this.showRegisterPasswordConfirm = !this.showRegisterPasswordConfirm;
    }
  }


  async onLogin(event?: Event): Promise<void> {
    event?.preventDefault();
    if (!this.isBrowser) return;
    console.log('onLogin called, navigating...');

    //#region login

    const res = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.loginEmail,
        password: this.loginPassword
      })
    });

    if(!res.ok) {
      alert('Login failed: ' + res.statusText);
      return;
    }

    //#endregion

    // note from julian: login success ->

    this.router.navigate(['/home']).then(() => {
      console.log('Navigation successful');
    });
}

  async onRegister(event?: Event): Promise<void> {
    event?.preventDefault();
    if (!this.isBrowser) return;
    
    if (this.registerPassword !== this.passwordConfirm) {
      alert('Passwords do not match!');
      return;
    }

    // note from julian: we could do some validation like checking if the email has a valid format, or password strength, etc.

    //#region registering

    const res = await fetch('http://localhost:3000/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.registerName,
        email: this.registerEmail,
        password: this.registerPassword
      })
    });

    if(!res.ok) {
      alert('Registration failed: ' + res.statusText);
      return;
    }

    //#endregion

    // note from julian: registration success ->

    console.log('Navigating to /home from register');
    this.router.navigate(['/home']);
  }

    handleGithubLogin() {
    const GITHUB_CLIENT_ID = 'Ov23liyXKzvf4zPI8g7J';
    const REDIRECT_URI = 'http://localhost:4200/login'; // Url, zu der zurückgeleitet werden soll

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:user`;
    window.location.href = githubAuthUrl;
};
}