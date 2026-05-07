import {Routes} from '@angular/router';
import {Subscription} from './subscription';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing').then(m => m.Landing)
  },
  {
    path: 'login',
    loadComponent: () => import('./login').then(m => m.Login)
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup').then(m => m.Signup)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding').then(m => m.Onboarding)
  },
  {
    path: 'platform-selection',
    loadComponent: () => import('./platform-selection').then(m => m.PlatformSelection)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard').then(m => m.Dashboard)
  },
  {
    path: 'summaries',
    loadComponent: () => import('./summaries').then(m => m.Summaries)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./analytics').then(m => m.Analytics)
  },
  {
    path: 'integrations',
    loadComponent: () => import('./integrations').then(m => m.Integrations)
  },
  {
    path: 'subscription',
    component: Subscription
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings').then(m => m.Settings)
  },
  {
    path: 'payment',
    loadComponent: () => import('./payment').then(m => m.Payment)
  },
];
