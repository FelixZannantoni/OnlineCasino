import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Poker } from './poker/poker'

export const routes: Routes = [
    {
        path: "home", component: Home
    },
    {
        path: "login", component: Login
    },
    {
        path: "poker", component: Poker
    },
    {
        path: "", redirectTo: "home", pathMatch: "full"
    }
];
