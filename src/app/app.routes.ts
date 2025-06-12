import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./auth/auth.component').then((m) => m.AuthComponent),
    
  },
  {
    path: '',
    loadComponent: () =>
      import('./main/main.component').then((m) => m.MainComponent),
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '' },
];
