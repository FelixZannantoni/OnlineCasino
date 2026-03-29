import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Poker } from './poker/poker';
import { ForgotPassword } from './login/forgot-password/forgot-password';
import { Friends } from './friends/friends';
import { Leaderboard } from './leaderboard/leaderboard';
import { Navbar } from './navbar/navbar';
import { ProfileOverlay } from './profile-overlay/profile-overlay';
import { SettingsOverlay } from './settings-overlay/settings-overlay';
import { Shop } from './shop/shop';
import { Club } from './club/club';

export const routes: Routes = [
    //{ path: "home", component: Home },
    //{ path: "login", component: Login },
    { path: "forgot-password", component: ForgotPassword },
    //{ path: "poker", component: Poker },
    { path: "club", component: Club },
    { path: "friends", component: Friends },
    { path: "home", component: Home },
    { path: "leaderboard", component: Leaderboard },
    { path: "login", component: Login },
    { path: "navbar", component: Navbar },
    { path: "poker", component: Poker },
    { path: "profile-overlay", component: ProfileOverlay },
    { path: "settings-overlay", component: SettingsOverlay },
    { path: "shop", component: Shop },
    { path: "", redirectTo: "login", pathMatch: "full" }
];