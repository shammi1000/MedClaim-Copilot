import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="isLoggedIn; else loginTemplate">
      <div class="app-container">
        <app-sidebar [collapsed]="sidebarCollapsed" (toggleSidebar)="toggleSidebar()"></app-sidebar>
        <div class="main-content" [class.collapsed]="sidebarCollapsed">
          <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>
          <div class="page-content">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
    </div>
    <ng-template #loginTemplate>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent implements OnInit {
  title = 'MedClaim Copilot';
  sidebarCollapsed = false;
  isLoggedIn = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.authService.loginState$.subscribe(state => {
      this.isLoggedIn = state;
    });
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.isLoggedIn = this.authService.isLoggedIn() && !e.url.includes('/login');
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
