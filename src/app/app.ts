import {ChangeDetectionStrategy, Component, signal, inject} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {filter} from 'rxjs/operators';
import {PlanService} from './plan.service';
import {AuthService} from './auth.service';
import {ThemeService} from './theme.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  public planService = inject(PlanService);
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  
  isSidebarCollapsed = signal(false);
  isPublicPage = signal(true);

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Summaries', icon: 'auto_awesome', route: '/summaries' },
    { label: 'Integrations', icon: 'hub', route: '/integrations' },
    { label: 'Analytics', icon: 'insights', route: '/analytics' },
    { label: 'Subscription', icon: 'payments', route: '/subscription' },
  ];

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const publicRoutes = ['', '/', '/login', '/signup', '/onboarding', '/platform-selection'];
      this.isPublicPage.set(publicRoutes.includes(event.urlAfterRedirects.split('?')[0]));
    });
  }

  logout() {
    if (confirm('Are you sure you want to log out?')) {
      this.router.navigate(['/login']);
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }
}
