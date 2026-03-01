import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { ProfileOverlay } from './profile-overlay/profile-overlay';
import { SettingsOverlay } from './settings-overlay/settings-overlay';
import { Login } from "./login/login";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Navbar,
    ProfileOverlay,
    SettingsOverlay,
    Login
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}