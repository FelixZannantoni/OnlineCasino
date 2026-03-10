import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule, MatIconModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']  
})
export class ForgotPassword { 
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  email = '';
  submitted = false;

  onSubmit(): void {
    if (!this.isBrowser) return;
    console.log('Password reset requested for:', this.email);
    this.submitted = true;
  }
}