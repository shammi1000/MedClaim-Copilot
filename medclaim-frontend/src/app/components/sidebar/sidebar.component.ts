import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/claim.model';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-logo">
        <div class="logo-icon">
          <mat-icon>health_and_safety</mat-icon>
        </div>
        <div class="logo-text" *ngIf="!collapsed">
          <span class="logo-title">MedClaim</span>
          <span class="logo-sub">Copilot</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a class="nav-item" *ngFor="let item of navItems"
           [routerLink]="item.route"
           [class.active]="activeRoute === item.route"
           [matTooltip]="collapsed ? item.label : ''"
           matTooltipPosition="right">
          <mat-icon class="nav-icon">{{item.icon}}</mat-icon>
          <span class="nav-label" *ngIf="!collapsed">{{item.label}}</span>
          <span class="nav-badge" *ngIf="item.badge && !collapsed">{{item.badge}}</span>
        </a>
      </nav>

      <div class="sidebar-footer" *ngIf="!collapsed">
        <div class="user-info">
          <div class="user-avatar">
            {{currentUser?.name?.charAt(0)}}
          </div>
          <div class="user-details">
            <p class="user-name">{{currentUser?.name?.split(' ')[0]}} {{currentUser?.name?.split(' ')[1]}}</p>
            <p class="user-role">{{currentUser?.role}}</p>
          </div>
        </div>
        <button class="logout-btn" (click)="logout()" matTooltip="Logout">
          <mat-icon>logout</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: linear-gradient(180deg, #0f2447 0%, #1a3c6e 50%, #1e4a80 100%);
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      overflow: hidden;
      box-shadow: 4px 0 24px rgba(0,0,0,0.15);
    }
    .sidebar.collapsed { width: 70px; }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      min-height: 80px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #00a86b, #00c97f);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .logo-icon mat-icon { color: white; font-size: 22px; }
    .logo-text { display: flex; flex-direction: column; }
    .logo-title { font-size: 18px; font-weight: 800; color: white; line-height: 1; letter-spacing: -0.3px; }
    .logo-sub { font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 500; margin-top: 2px; }

    .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 10px;
      color: rgba(255,255,255,0.65);
      text-decoration: none;
      margin-bottom: 4px;
      transition: all 0.2s ease;
      cursor: pointer;
      white-space: nowrap;
    }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
    .nav-item.active { background: rgba(255,255,255,0.15); color: white; }
    .nav-item.active .nav-icon { color: #00c97f; }
    .nav-icon { font-size: 20px; flex-shrink: 0; }
    .nav-label { font-size: 14px; font-weight: 500; }
    .nav-badge {
      margin-left: auto;
      background: #e74c3c;
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 50px;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00a86b, #3498db);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }
    .user-details { min-width: 0; }
    .user-name { color: white; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { color: rgba(255,255,255,0.5); font-size: 11px; }
    .logout-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,0.5);
      padding: 4px;
      border-radius: 6px;
      transition: all 0.2s;
      display: flex;
    }
    .logout-btn:hover { color: #e74c3c; background: rgba(231,76,60,0.1); }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  activeRoute = '/dashboard';
  currentUser: User | null = null;

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'add_circle', label: 'Submit Claim', route: '/submit-claim' },
    { icon: 'track_changes', label: 'Claims Tracker', route: '/claims-tracker', badge: 3 },
    { icon: 'verified_user', label: 'Compliance Checker', route: '/compliance-checker' },
    { icon: 'bar_chart', label: 'Analytics', route: '/analytics' },
    { icon: 'person', label: 'My Profile', route: '/profile' },
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.activeRoute = e.url.split('?')[0].split('#')[0];
    });
    this.activeRoute = this.router.url;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
