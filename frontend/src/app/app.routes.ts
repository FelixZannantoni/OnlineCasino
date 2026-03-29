import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Poker } from './poker/poker';
import { ForgotPassword } from './login/forgot-password/forgot-password';

export const routes: Routes = [
    { path: "home", component: Home },
    { path: "login", component: Login },
    { path: "forgot-password", component: ForgotPassword },
    { path: "poker", component: Poker },
    { path: "", redirectTo: "login", pathMatch: "full" }
];