import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Poker } from './table-game/poker/poker';
import { Blackjack } from './table-game/blackjack/blackjack';
import { ForgotPassword } from './login/forgot-password/forgot-password';
import { Shop } from './shop/shop';

export const routes: Routes = [
    { path: "home", component: Home },
    { path: "login", component: Login },
    { path: "forgot-password", component: ForgotPassword },
    { path: "poker", component: Poker },
    { path: "blackjack", component: Blackjack },
    { path: "shop", component: Shop },
    { path: "", redirectTo: "login", pathMatch: "full" }
];