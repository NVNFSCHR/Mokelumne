import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { App } from './app'; // Ihre Hauptkomponente
import { Home} from './home/home';
import { RegisterComponent } from './register/register';
import { AdminPanelComponent } from './admin-panel/admin-panel';
import { ManageProducts } from './manage-products/manage-products';
import { ManageOrders } from './manage-orders/manage-orders';
import { ManageUsers } from './manage-users/manage-users';
import { Analytics } from './analytics/analytics';
import { ProductOverview } from './product-overview/product-overview';
import { AllProducts } from './all-products/all-products';
import { AboutUs } from './about-us/about-us';
import { Profile } from './profile/profile';
import { ProfileSettings } from './profile-settings/profile-settings';
import { Cart } from './cart/cart';
import { CheckOut } from './check-out/check-out';
import { authGuard } from './auth-guard';
import { adminGuard } from './admin-guard';


export const routes: Routes = [
  { path: '', component: Home },
  { path: 'product/:id', component: ProductOverview},
  { path: 'discover', component: AllProducts },
  { path: 'cart', component: Cart},
  { path: 'check-out', component: CheckOut },
  { path: 'about-us', component: AboutUs },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'settings', component: ProfileSettings, canActivate: [authGuard] },
  { path: 'manage', component: AdminPanelComponent, canActivate: [adminGuard] },
  { path: 'manage/products', component: ManageProducts, canActivate: [adminGuard] },
  { path: 'manage/orders', component: ManageOrders, canActivate: [adminGuard] },
  { path: 'manage/users', component: ManageUsers, canActivate: [adminGuard] },
  { path: 'manage/analytics', component: Analytics, canActivate: [adminGuard] },

  // Fallback-Route
  //{ path: '**', redirectTo: '' }
];
