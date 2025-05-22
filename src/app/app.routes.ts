import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ReportsComponent } from './reports/reports.component';
import { AuthGuard } from './guard/auth.guard'; // Lo mantenemos por si lo usas en otras rutas

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }, // Puedes protegerla con AuthGuard después
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }, // Ruta pública para registro
  {
    path: 'reports',
    component: ReportsComponent,
    // canActivate: [AuthGuard] // Puedes protegerla con AuthGuard después
  },
  // Agrega una ruta wildcard al final si quieres manejar rutas no encontradas
  // { path: '**', redirectTo: '/home' } // O a una página de "No encontrado"
];