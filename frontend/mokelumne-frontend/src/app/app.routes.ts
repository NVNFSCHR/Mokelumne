import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { App } from './app'; // Ihre Hauptkomponente
import { Home} from './home/home';
import { RegisterComponent } from './register/register';
import { AdminPanelComponent } from './admin-panel/admin-panel';
import { authGuard } from './auth-guard';
import { adminGuard } from './admin-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'manage', component: AdminPanelComponent, canActivate: [adminGuard] },
  // Fallback-Route
  { path: '**', redirectTo: '' }
];
