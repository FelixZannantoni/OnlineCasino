import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Poker } from './table-game/poker/poker';
import { Blackjack } from './table-game/blackjack/blackjack';
import { ForgotPassword } from './login/forgot-password/forgot-password';
import { Shop } from './shop/shop';
import { Slotmachine } from './slotmachine/slotmachine';
import { Inventory } from './inventory/inventory'

export const routes: Routes = [
    { path: "home", component: Home },
    { path: "login", component: Login },
    { path: "forgot-password", component: ForgotPassword },
    { path: "poker", component: Poker },
    { path: "blackjack", component: Blackjack },
    { path: "slotmachine", component: Slotmachine},
    { path: "shop", component: Shop },
    { path: "inventory", component: Inventory },
    { path: "", redirectTo: "login", pathMatch: "full" }
];